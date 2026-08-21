import type { AgentId } from "../ai/agents";
import { supabase, supabaseConfig } from "./supabase";

export type AgentVoicePreferences = {
  enabled: boolean;
  autoSpeak: boolean;
};

type AudioContextWindow = typeof window & {
  webkitAudioContext?: typeof AudioContext;
};

const STORAGE_KEY = "hlc.agentVoicePreferences.v3";
const STREAM_SAMPLE_RATE = 24_000;
const STREAM_START_LEAD_SECONDS = 0.04;

function defaultPreferences(): AgentVoicePreferences {
  return { enabled: false, autoSpeak: false };
}

let audioContext: AudioContext | null = null;
const activeSources = new Set<AudioBufferSourceNode>();
let activeSpeechAbortController: AbortController | null = null;
let speechGeneration = 0;

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

export function isAgentAudioSupported() {
  if (typeof window === "undefined") return false;
  const audioWindow = window as AudioContextWindow;
  return Boolean(window.AudioContext || audioWindow.webkitAudioContext);
}

/**
 * Must be called from a user gesture on iOS/Safari before an async TTS request.
 * It resumes Web Audio and plays a one-frame silent buffer so later neural audio
 * can start after the network round-trip without invoking HTMLMediaElement autoplay.
 */
export async function prepareAgentAudio() {
  const context = getAudioContext();
  if (!context) throw new Error("Spoken replies are unavailable in this browser.");

  if (context.state === "suspended") await context.resume();
  if (context.state !== "running") {
    throw new Error("Tap the voice control again to enable audio playback.");
  }

  const silentBuffer = context.createBuffer(1, 1, context.sampleRate);
  const silentSource = context.createBufferSource();
  silentSource.buffer = silentBuffer;
  silentSource.connect(context.destination);
  silentSource.start(0);
  return true;
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

async function playLegacyBufferedResponse(context: AudioContext, response: Response, generation: number) {
  const payload = await response.json() as { audioBase64?: string } | null;
  if (generation !== speechGeneration) return false;
  if (!payload?.audioBase64) throw new Error("Neural voice returned no playable audio.");

  const encodedAudio = base64ToArrayBuffer(payload.audioBase64);
  const decodedAudio = await context.decodeAudioData(encodedAudio.slice(0));
  if (generation !== speechGeneration) return false;

  stopActiveSources();
  const source = context.createBufferSource();
  source.buffer = decodedAudio;
  source.connect(context.destination);
  source.onended = () => {
    activeSources.delete(source);
    try { source.disconnect(); } catch { /* already disconnected */ }
  };
  activeSources.add(source);
  source.start(0);
  return true;
}

export async function speakAgentText(agentId: AgentId, text: string) {
  if (typeof window === "undefined") throw new Error("Spoken replies are unavailable in this browser.");
  const cleanText = text.trim();
  if (!cleanText) return false;

  const context = getAudioContext();
  if (!context) throw new Error("Spoken replies are unavailable in this browser.");
  if (context.state === "suspended") await context.resume();
  if (context.state !== "running") throw new Error("Tap the voice control again to enable audio playback.");

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Authentication is required for agent voice.");

  const generation = ++speechGeneration;
  activeSpeechAbortController?.abort();
  stopActiveSources();
  const controller = new AbortController();
  activeSpeechAbortController = controller;

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
      body: JSON.stringify({ agentId, text: cleanText }),
    });
  } catch (reason) {
    if (controller.signal.aborted || generation !== speechGeneration) return false;
    throw reason;
  }

  if (generation !== speechGeneration) return false;
  if (!response.ok) await throwVoiceResponseError(response);

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("application/json")) {
    return playLegacyBufferedResponse(context, response, generation);
  }

  if (!response.body) throw new Error("Neural voice returned no playable audio stream.");

  const reader = response.body.getReader();
  let nextPlaybackAt = context.currentTime + STREAM_START_LEAD_SECONDS;
  let carry: number | null = null;
  let started = false;

  try {
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

      nextPlaybackAt = schedulePcmChunk(context, bytes, nextPlaybackAt);
      started = true;
    }
  } finally {
    if (activeSpeechAbortController === controller) activeSpeechAbortController = null;
  }

  return started;
}

export function stopAgentSpeech() {
  if (typeof window === "undefined") return;
  speechGeneration += 1;
  activeSpeechAbortController?.abort();
  activeSpeechAbortController = null;
  stopActiveSources();
}
