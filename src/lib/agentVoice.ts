import type { AgentId } from "../ai/agents";
import type { ResolvedAgentLocale } from "./agentLocale";

export type AgentVoicePreferences = {
  enabled: boolean;
  autoSpeak: boolean;
};

type NativeVoiceProfile = {
  rate: number;
  pitch: number;
  preferredNames: string[];
};

const STORAGE_KEY = "hlc.agentVoicePreferences.v4";

// Free-only HLC voice policy: the browser/device speech engine is the complete
// spoken-reply runtime. These settings favor intelligibility on phone speakers
// while preserving a distinct operational character for each agent.
const nativeVoiceProfiles: Record<AgentId, NativeVoiceProfile> = {
  kendrell: {
    rate: 0.9,
    pitch: 0.94,
    preferredNames: ["Aaron", "Daniel", "Alex", "Arthur", "Ralph", "Fred"],
  },
  dion: {
    rate: 0.94,
    pitch: 0.98,
    preferredNames: ["Evan", "Tom", "Nathan", "Oliver", "Reed", "Albert"],
  },
  diamond: {
    rate: 0.92,
    pitch: 1.02,
    preferredNames: ["Samantha", "Ava", "Serena", "Karen", "Victoria", "Tessa"],
  },
};

function defaultPreferences(): AgentVoicePreferences {
  return { enabled: false, autoSpeak: false };
}

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

function hasNativeSpeech() {
  return typeof window !== "undefined"
    && "speechSynthesis" in window
    && typeof SpeechSynthesisUtterance !== "undefined";
}

export function isAgentAudioSupported() {
  return hasNativeSpeech();
}

export async function prepareAgentAudio() {
  if (!hasNativeSpeech()) {
    throw new Error("Spoken replies are unavailable in this browser.");
  }
  window.speechSynthesis.getVoices();
  return true;
}

function cancelNativeSpeech() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // Native speech may be unavailable or blocked by the browser.
  }
}

function nativeSpeechText(text: string, locale: ResolvedAgentLocale) {
  if (locale !== "en-US") return text;
  return text
    .replace(/\bDiamond\b/gi, "Die-Men")
    .replace(/\bDion\b/gi, "Dee-Yon")
    .replace(/\bKendrell\b/gi, "Ken-Drayl")
    .replace(/\bHLC\b/g, "H L C");
}

function selectNativeVoice(agentId: AgentId, locale: ResolvedAgentLocale) {
  if (!hasNativeSpeech()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const normalizedLocale = locale.toLowerCase();
  const language = normalizedLocale.split("-")[0];
  const exactLocale = voices.filter((voice) => voice.lang.toLowerCase() === normalizedLocale);
  const sameLanguage = voices.filter((voice) => voice.lang.toLowerCase().startsWith(`${language}-`));
  const candidates = exactLocale.length ? exactLocale : sameLanguage.length ? sameLanguage : voices;
  const localCandidates = candidates.filter((voice) => voice.localService);
  const pool = localCandidates.length ? localCandidates : candidates;
  const preferredNames = nativeVoiceProfiles[agentId].preferredNames.map((name) => name.toLowerCase());

  // Prefer a known clear local voice for the agent persona. If that exact voice is
  // unavailable, prefer the device's local default before any remote/browser voice.
  return pool.find((voice) => preferredNames.some((name) => voice.name.toLowerCase().includes(name)))
    ?? pool.find((voice) => voice.default)
    ?? pool[0]
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
  if (typeof window === "undefined" || !hasNativeSpeech()) {
    throw new Error("Spoken replies are unavailable in this browser.");
  }

  const cleanText = text.trim();
  if (!cleanText) return false;

  // Interactive chat/replay speech is authoritative. Background greeting or
  // briefing speech must never interrupt a user-requested spoken reply.
  const interactive = Boolean(onPlaybackStart);
  if (!interactive && activeInteractiveGeneration !== null) return false;

  const generation = ++speechGeneration;
  if (interactive) activeInteractiveGeneration = generation;
  cancelNativeSpeech();

  try {
    return await speakWithNativeVoice(agentId, cleanText, locale, generation, onPlaybackStart);
  } finally {
    if (activeInteractiveGeneration === generation) activeInteractiveGeneration = null;
  }
}

export function stopAgentSpeech() {
  if (typeof window === "undefined") return;
  speechGeneration += 1;
  activeInteractiveGeneration = null;
  cancelNativeSpeech();
}
