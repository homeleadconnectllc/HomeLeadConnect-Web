import type { AgentId } from "../ai/agents";
import type { ResolvedAgentLocale } from "./agentLocale";
import { supabase, supabaseConfig } from "./supabase";

export type AgentVoicePreferences = {
  enabled: boolean;
  autoSpeak: boolean;
};

type AudioContextWindow = typeof window & {
  webkitAudioContext?: typeof AudioContext;
};

type NativeVoiceProfile = {
  rate: number;
  pitch: number;
  preferredNames: string[];
};

const STORAGE_KEY = "hlc.agentVoicePreferences.v3";
const STREAM_SAMPLE_RATE = 24_000;
const STREAM_START_LEAD_SECONDS = 0.04;

const nativeVoiceProfiles: Record<AgentId, NativeVoiceProfile> = {
  kendrell: {
    rate: 0.9,
    pitch: 0.86,
    preferredNames: ["Aaron", "Daniel", "Alex", "Arthur", "Fred", "Ralph"],
  },
  dion: {
    rate: 1.02,
    pitch: 0.94,
    preferredNames: ["Evan", "Tom", "Nathan", "Oliver", "Reed", "Albert"],
  },
  diamond: {
    rate: 0.97,
    pitch: 1.08,
    preferredNames: ["Samantha", "Ava", "Serena", "Karen", "Victoria", "Tessa"],
  },
};

function defaultPreferences(): AgentVoicePreferences {
  return { enabled: false, autoSpeak: false };
}

let audioContext: AudioContext | null = null;
const activeSources = new Set<AudioBufferSourceNode>();
let activeSpeechAbortController: AbortController | null = null;
let speechGeneration = 0;
let activeInteractiveGeneration: number | null = null;

export function getAgentVoicePreferences(): AgentVoicePreferences {
  const defaults = defaultPreferences();
  if (typeof window === "undefined") return defaults;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaults;
    const parsed = JSON.parse(stored) as Partial<AgentVoicePreferences>;
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : defaults.enabled,
      autoSpeak: typeof parsed.autoSpeak === "boolean" ? parsed.autoSpeak : defaults.autoSpeak,
    };
  } catch {
    return defaults;
  }
}

export function saveAgentVoicePreferences(preferences: AgentVoicePreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (audioContext) return audioContext;
  const audioWindow = window as AudioContextWindow;
  const Constructor = window.AudioContext || audioWindow.webkitAudioContext;
  if (!Constructor) return null;
  audioContext = new Constructor();
  return audioContext;
}

async function ensureAudioContextRunning(context: AudioContext) {
  if (context.state === "suspended") await context.resume();
  if (context.state !== "running") {
    throw new Error("Tap the voice control again to enable audio playback.");
  }
}

function hasNativeSpeech() {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

export function isAgentAudioSupported() {
  if (typeof window === "undefined") return false;
  const audioWindow = window as AudioContextWindow;
  return Boolean(window.AudioContext || audioWindow.webkitAudioContext || hasNativeSpeech());
}

export async function prepareAgentAudio() {
  const context = getAudioContext();
  if (context) {
    await ensureAudioContextRunning(context);
    const silentBuffer = context.createBuffer(1, 1, context.sampleRate);
    const silentSource = context.createBufferSource();
    silentSource.buffer = silentBuffer;
    silentSource.connect(context.destination);
    silentSource.start(0);
    return true;
  }

  if (hasNativeSpeech()) {
    window.speechSynthesis.getVoices();
    return true;
  }

  throw new Error("Spoken replies are unavailable in this browser.");
}

function cancelNativeSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // Native speech may be unavailable or blocked by the browser.
  }
}

function stopActiveSources() {
  for (const source of activeSources) {
    try {
      source.stop();
    } catch {
      // Source may already have ended.
    }
    try {
      source.disconnect();
    } catch {
      // Source may already be disconnected.
    }
  }
  activeSources.clear();
}

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function pcm16ToFloat32(bytes: Uint8Array) {
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const samples = new Float32Array(sampleCount);
  const view = new DataView(bytes.buffer, bytes.byteOffset, sampleCount * 2);
  for (let index = 0; index < sampleCount; index += 1) {
    const value = view.getInt16(index * 2, true);
    samples[index] = value < 0 ? value / 0x8000 : value / 0x7fff;
  }
  return samples;
}

function schedulePcmChunk(context: AudioContext, bytes: Uint8Array, startAt: number) {
  const samples = pcm16ToFloat32(bytes);
  if (!samples.length) return startAt;

  const buffer = context.createBuffer(1, samples.length, STREAM_SAMPLE_RATE);
  buffer.copyToChannel(samples, 0);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.onended = () => {
    activeSources.delete(source);
    try { source.disconnect(); } catch { /* already disconnected */ }
  };
  activeSources.add(source);

  const scheduledAt = Math.max(startAt, context.currentTime + STREAM_START_LEAD_SECONDS);
  source.start(scheduledAt);
  return scheduledAt + buffer.duration;
}

async function waitForScheduledPlayback(context: AudioContext, scheduledEnd: number, generation: number) {
  const remainingMs = Math.max(0, Math.ceil((scheduledEnd - context.currentTime) * 1000));
  if (!remainingMs) return;
  await new Promise<void>((resolve) => window.setTimeout(resolve, remainingMs));
  if (generation !== speechGeneration) return;
}

async function throwVoiceResponseError(response: Response) {
  let message = "Neural voice generation failed.";
  try {
    const payload = await response.json() as { error?: string };
    if (payload?.error) message = payload.error;
  } catch {
    // Preserve the generic message when the response is not JSON.
  }
  throw new Error(message);
}

async function playLegacyBufferedResponse(
  context: AudioContext,
  response: Response,
  generation: number,
  onPlaybackStart?: () => void,
) {
  const payload = await response.json() as { audioBase64?: string } | null;
  if (generation !== speechGeneration) return false;
  if (!payload?.audioBase64) throw new Error("Neural voice returned no playable audio.");

  const encodedAudio = base64ToArrayBuffer(payload.audioBase64);
  const decodedAudio = await context.decodeAudioData(encodedAudio.slice(0));
  if (generation !== speechGeneration) return false;

  await ensureAudioContextRunning(context);
  if (generation !== speechGeneration) return false;

  stopActiveSources();
  const source = context.createBufferSource();
  source.buffer = decodedAudio;
  source.connect(context.destination);
  const ended = new Promise<void>((resolve) => {
    source.onended = () => {
      activeSources.delete(source);
      try { source.disconnect(); } catch { /* already disconnected */ }
      resolve();
    };
  });
  activeSources.add(source);
  source.start(0);
  onPlaybackStart?.();
  await ended;
  return generation === speechGeneration;
}

function nativeSpeechText(text: string, locale: ResolvedAgentLocale) {
  if (locale !== "en-US") return text;
  return text
    .replace(/\bDiamond\b/gi, "Die-Men")
    .replace(/\bDion\b/gi, "Dee-Yon")
    .replace(/\bKendrell\b/gi, "Ken-Drayl");
}

function selectNativeVoice(agentId: AgentId, locale: ResolvedAgentLocale) {
  if (!hasNativeSpeech()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const normalizedLocale = locale.toLowerCase();
  const language = normalizedLocale.split("-")[0];
  const localeVoices = voices.filter((voice) => voice.lang.toLowerCase() === normalizedLocale);
  const languageVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(`${language}-`));
  const candidates = localeVoices.length ? localeVoices : languageVoices.length ? languageVoices : voices;
  const preferredNames = nativeVoiceProfiles[agentId].preferredNames.map((name) => name.toLowerCase());
  return candidates.find((voice) => preferredNames.some((name) => voice.name.toLowerCase().includes(name)))
    ?? candidates.find((voice) => voice.default)
    ?? candidates[0]
    ?? null;
}

async function speakWithNativeVoice(
  agentId: AgentId,
  text: string,
  locale: ResolvedAgentLocale,
  generation: number,
  onPlaybackStart?: () => void,
) {
  if (!hasNativeSpeech() || generation !== speechGeneration) return false;
  cancelNativeSpeech();

  const profile = nativeVoiceProfiles[agentId];
  const utterance = new SpeechSynthesisUtterance(nativeSpeechText(text, locale));
  utterance.lang = locale;
  utterance.rate = profile.rate;
  utterance.pitch = profile.pitch;
  utterance.volume = 1;
  const voice = selectNativeVoice(agentId, locale);
  if (voice) utterance.voice = voice;

  return await new Promise<boolean>((resolve) => {
    let started = false;
    utterance.onstart = () => {
      if (generation !== speechGeneration) {
        window.speechSynthesis.cancel();
        resolve(false);
        return;
      }
      started = true;
      onPlaybackStart?.();
    };
    utterance.onend = () => resolve(started && generation === speechGeneration);
    utterance.onerror = () => resolve(false);
    window.speechSynthesis.speak(utterance);
  });
}

export async function speakAgentText(
  agentId: AgentId,
  text: string,
  locale: ResolvedAgentLocale = "en-US",
  onPlaybackStart?: () => void,
) {
  if (typeof window === "undefined") throw new Error("Spoken replies are unavailable in this browser.");
  const cleanText = text.trim();
  if (!cleanText) return false;

  // Calls with an actual playback-start callback are interactive chat/replay speech.
  // Background greeting/briefing speech must never interrupt that authoritative stream.
  const interactive = Boolean(onPlaybackStart);
  if (!interactive && activeInteractiveGeneration !== null) return false;

  const generation = ++speechGeneration;
  if (interactive) activeInteractiveGeneration = generation;
  activeSpeechAbortController?.abort();
  activeSpeechAbortController = null;
  cancelNativeSpeech();
  stopActiveSources();

  const context = getAudioContext();
  if (!context) {
    try {
      return await speakWithNativeVoice(agentId, cleanText, locale, generation, onPlaybackStart);
    } finally {
      if (activeInteractiveGeneration === generation) activeInteractiveGeneration = null;
    }
  }

  await ensureAudioContextRunning(context);
  const { data: sessionData } = await supabase.auth.getSession();
  if (generation !== speechGeneration) return false;
  const accessToken = sessionData.session?.access_token;

  // Free-first resilience: if authenticated neural TTS cannot be attempted, use the
  // browser/device speech engine rather than making agent voice a paid dependency.
  if (!accessToken) {
    try {
      return await speakWithNativeVoice(agentId, cleanText, locale, generation, onPlaybackStart);
    } finally {
      if (activeInteractiveGeneration === generation) activeInteractiveGeneration = null;
    }
  }

  const controller = new AbortController();
  activeSpeechAbortController = controller;

  try {
    try {
      let response: Response;
      try {
        response = await fetch(`${supabaseConfig.url}/functions/v1/hlc-agent-voice`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            apikey: supabaseConfig.anonKey,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({ agentId, text: cleanText, locale }),
        });
      } catch (reason) {
        if (controller.signal.aborted || generation !== speechGeneration) return false;
        throw reason;
      }

      if (generation !== speechGeneration) return false;
      if (!response.ok) await throwVoiceResponseError(response);

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      if (contentType.includes("application/json")) {
        return await playLegacyBufferedResponse(context, response, generation, onPlaybackStart);
      }

      if (!response.body) throw new Error("Neural voice returned no playable audio stream.");

      const reader = response.body.getReader();
      let nextPlaybackAt = context.currentTime + STREAM_START_LEAD_SECONDS;
      let carry: number | null = null;
      let started = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (generation !== speechGeneration) {
          await reader.cancel();
          return false;
        }
        if (!value?.byteLength) continue;

        let bytes = value;
        if (carry !== null) {
          const combined = new Uint8Array(value.byteLength + 1);
          combined[0] = carry;
          combined.set(value, 1);
          bytes = combined;
          carry = null;
        }
        if (bytes.byteLength % 2 === 1) {
          carry = bytes[bytes.byteLength - 1];
          bytes = bytes.subarray(0, bytes.byteLength - 1);
        }
        if (!bytes.byteLength) continue;

        // iOS can suspend WebAudio again while the network request is in flight.
        // Resume immediately before every scheduled chunk so a successful TTS
        // response cannot silently become inaudible playback.
        await ensureAudioContextRunning(context);
        if (generation !== speechGeneration) return false;
        nextPlaybackAt = schedulePcmChunk(context, bytes, nextPlaybackAt);
        if (!started) {
          started = true;
          onPlaybackStart?.();
        }
      }

      if (!started) throw new Error("Neural voice returned no playable audio stream.");
      await waitForScheduledPlayback(context, nextPlaybackAt, generation);
      return started && generation === speechGeneration;
    } catch (reason) {
      if (controller.signal.aborted || generation !== speechGeneration) return false;
      const played = await speakWithNativeVoice(agentId, cleanText, locale, generation, onPlaybackStart);
      if (played) return true;
      throw reason;
    }
  } finally {
    if (activeSpeechAbortController === controller) activeSpeechAbortController = null;
    if (activeInteractiveGeneration === generation) activeInteractiveGeneration = null;
  }
}

export function stopAgentSpeech() {
  if (typeof window === "undefined") return;
  speechGeneration += 1;
  activeInteractiveGeneration = null;
  activeSpeechAbortController?.abort();
  activeSpeechAbortController = null;
  cancelNativeSpeech();
  stopActiveSources();
}
