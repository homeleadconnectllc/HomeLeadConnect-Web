import type { AgentId } from "../ai/agents";
import { supabase } from "./supabase";

export type AgentVoicePreferences = {
  enabled: boolean;
  autoSpeak: boolean;
};

const STORAGE_KEY = "hlc.agentVoicePreferences.v1";

const DEFAULT_PREFERENCES: AgentVoicePreferences = {
  enabled: true,
  autoSpeak: false,
};

let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;

export function getAgentVoicePreferences(): AgentVoicePreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(stored) as Partial<AgentVoicePreferences>;
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULT_PREFERENCES.enabled,
      autoSpeak: typeof parsed.autoSpeak === "boolean" ? parsed.autoSpeak : DEFAULT_PREFERENCES.autoSpeak,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveAgentVoicePreferences(preferences: AgentVoicePreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function cleanupAudio() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.src = "";
    activeAudio = null;
  }
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mimeType });
}

export async function speakAgentText(agentId: AgentId, text: string) {
  if (typeof window === "undefined") throw new Error("Spoken replies are unavailable in this browser.");
  const cleanText = text.trim();
  if (!cleanText) return false;

  cleanupAudio();

  const { data, error } = await supabase.functions.invoke("hlc-agent-voice", {
    body: { agentId, text: cleanText },
  });

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

  const blob = base64ToBlob(payload.audioBase64, payload.mimeType || "audio/wav");
  activeObjectUrl = URL.createObjectURL(blob);
  activeAudio = new Audio(activeObjectUrl);
  activeAudio.preload = "auto";
  activeAudio.onended = cleanupAudio;
  activeAudio.onerror = cleanupAudio;
  await activeAudio.play();
  return true;
}

export function stopAgentSpeech() {
  if (typeof window === "undefined") return;
  cleanupAudio();
}
