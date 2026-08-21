import type { AgentId } from "../ai/agents";
import { supabase } from "./supabase";

export type AgentVoicePreferences = {
  enabled: boolean;
  autoSpeak: boolean;
};

type AudioContextWindow = typeof window & {
  webkitAudioContext?: typeof AudioContext;
};

const STORAGE_KEY = "hlc.agentVoicePreferences.v3";

function defaultPreferences(): AgentVoicePreferences {
  return { enabled: false, autoSpeak: false };
}

let audioContext: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;
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

function stopActiveSource() {
  if (!activeSource) return;
  try {
    activeSource.stop();
  } catch {
    // Source may already have ended.
  }
  activeSource.disconnect();
  activeSource = null;
}

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

export async function speakAgentText(agentId: AgentId, text: string) {
  if (typeof window === "undefined") throw new Error("Spoken replies are unavailable in this browser.");
  const cleanText = text.trim();
  if (!cleanText) return false;

  const context = getAudioContext();
  if (!context) throw new Error("Spoken replies are unavailable in this browser.");

  const generation = ++speechGeneration;
  stopActiveSource();

  const { data, error } = await supabase.functions.invoke("hlc-agent-voice", {
    body: { agentId, text: cleanText },
  });

  if (generation !== speechGeneration) return false;

  if (error) {
    const contextBody = (error as { context?: { json?: () => Promise<unknown> } }).context;
    if (contextBody?.json) {
      try {
        const payload = await contextBody.json() as { error?: string };
        if (payload?.error) throw new Error(payload.error);
      } catch (reason) {
        if (reason instanceof Error && reason.message) throw reason;
      }
    }
    throw new Error(error.message || "Neural voice generation failed.");
  }

  const payload = data as { audioBase64?: string; mimeType?: string; voice?: string } | null;
  if (!payload?.audioBase64) throw new Error("Neural voice returned no playable audio.");

  if (context.state === "suspended") await context.resume();
  if (context.state !== "running") {
    throw new Error("Audio is ready. Tap Replay again to play it on this device.");
  }

  const encodedAudio = base64ToArrayBuffer(payload.audioBase64);
  const decodedAudio = await context.decodeAudioData(encodedAudio.slice(0));
  if (generation !== speechGeneration) return false;

  // A newer request may have begun while this audio was decoding. Re-check the
  // generation and stop anything that managed to start before this source.
  stopActiveSource();
  const source = context.createBufferSource();
  source.buffer = decodedAudio;
  source.connect(context.destination);
  source.onended = () => {
    if (activeSource === source) activeSource = null;
    source.disconnect();
  };
  activeSource = source;
  source.start(0);
  return true;
}

export function stopAgentSpeech() {
  if (typeof window === "undefined") return;
  speechGeneration += 1;
  stopActiveSource();
}
