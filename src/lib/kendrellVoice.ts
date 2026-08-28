import { supabase, supabaseConfig } from "./supabase";
import type { ResolvedAgentLocale } from "./agentLocale";

type AudioContextWindow = typeof window & {
  webkitAudioContext?: typeof AudioContext;
};

type MaleAgentId = "kendrell" | "dion";

const STREAM_SAMPLE_RATE = 24_000;
const STREAM_START_LEAD_SECONDS = 0.04;
const MALE_VOICE_PREVIEW_FUNCTION = "hlc-agent-voice-male-preview";

let audioContext: AudioContext | null = null;
let activeAbortController: AbortController | null = null;
const activeSources = new Set<AudioBufferSourceNode>();

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
    throw new Error("Tap the voice control again to enable agent audio playback.");
  }
}

function stopSources() {
  for (const source of activeSources) {
    try { source.stop(); } catch { /* source may already have ended */ }
    try { source.disconnect(); } catch { /* source may already be disconnected */ }
  }
  activeSources.clear();
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

async function readVoiceError(response: Response, agentId: MaleAgentId) {
  let message = `${agentId === "kendrell" ? "Kendrell" : "Dion"} voice generation failed.`;
  try {
    const payload = await response.json() as { error?: string };
    if (payload?.error) message = payload.error;
  } catch {
    // Keep generic message for non-JSON responses.
  }
  return message;
}

export function isMaleAgentNeuralVoiceSupported() {
  if (typeof window === "undefined") return false;
  const audioWindow = window as AudioContextWindow;
  return Boolean(window.AudioContext || audioWindow.webkitAudioContext);
}

export async function prepareMaleAgentNeuralVoice() {
  const context = getAudioContext();
  if (!context) throw new Error("Agent voice playback is unavailable in this browser.");
  await ensureAudioContextRunning(context);

  const silentBuffer = context.createBuffer(1, 1, context.sampleRate);
  const silentSource = context.createBufferSource();
  silentSource.buffer = silentBuffer;
  silentSource.connect(context.destination);
  silentSource.start(0);
  return true;
}

export function stopMaleAgentNeuralVoice() {
  activeAbortController?.abort();
  activeAbortController = null;
  stopSources();
}

export async function speakMaleAgentNeuralText(
  agentId: MaleAgentId,
  text: string,
  locale: ResolvedAgentLocale,
  onPlaybackStart?: () => void,
) {
  const context = getAudioContext();
  if (!context) throw new Error("Agent voice playback is unavailable in this browser.");
  await ensureAudioContextRunning(context);

  stopMaleAgentNeuralVoice();

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Authentication is required for agent voice.");

  const controller = new AbortController();
  activeAbortController = controller;

  try {
    const response = await fetch(`${supabaseConfig.url}/functions/v1/${MALE_VOICE_PREVIEW_FUNCTION}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabaseConfig.anonKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({ agentId, text: text.trim(), locale }),
    });

    if (!response.ok) throw new Error(await readVoiceError(response, agentId));
    if (!response.body) throw new Error("Agent voice returned no playable audio stream.");

    const reader = response.body.getReader();
    let nextPlaybackAt = context.currentTime + STREAM_START_LEAD_SECONDS;
    let carry: number | null = null;
    let started = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (controller.signal.aborted) {
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

      await ensureAudioContextRunning(context);
      if (controller.signal.aborted) return false;
      nextPlaybackAt = schedulePcmChunk(context, bytes, nextPlaybackAt);
      if (!started) {
        started = true;
        onPlaybackStart?.();
      }
    }

    if (!started) throw new Error("Agent voice returned no playable audio stream.");
    const remainingMs = Math.max(0, Math.ceil((nextPlaybackAt - context.currentTime) * 1000));
    if (remainingMs) await new Promise<void>((resolve) => window.setTimeout(resolve, remainingMs));
    return !controller.signal.aborted;
  } catch (reason) {
    if (controller.signal.aborted) return false;
    throw reason;
  } finally {
    if (activeAbortController === controller) activeAbortController = null;
  }
}
