import type { AgentId } from "../ai/agents";
import type { ResolvedAgentLocale } from "./agentLocale";
import {
  isKendrellNeuralVoiceSupported,
  prepareKendrellNeuralVoice,
  speakKendrellNeuralText,
  stopKendrellNeuralVoice,
} from "./kendrellVoice";

export type AgentVoicePreferences = {
  enabled: boolean;
  autoSpeak: boolean;
};

type NativeVoiceProfile = {
  rate: number;
  pitch: number;
  preferredNames: string[];
};

type AgentNativeVoiceSelections = Partial<Record<AgentId, string>>;

const STORAGE_KEY = "hlc.agentVoicePreferences.v4";
const NATIVE_VOICE_SELECTION_KEY = "hlc.agentNativeVoiceSelections.v1";

// Kendrell uses the dedicated neural runtime so his live voice can stay aligned
// with the locked deep executive benchmark. Dion and Diamond remain on the
// device-native path until their own physical-device voice rounds are complete.
const nativeVoiceProfiles: Record<AgentId, NativeVoiceProfile> = {
  kendrell: {
    rate: 0.92,
    pitch: 0.98,
    preferredNames: ["Daniel", "Aaron", "Alex", "Arthur", "Ralph"],
  },
  dion: {
    rate: 0.94,
    pitch: 1,
    preferredNames: ["Tom", "Nathan", "Oliver", "Albert", "Alex"],
  },
  diamond: {
    rate: 0.9,
    pitch: 1,
    preferredNames: ["Samantha", "Ava", "Serena", "Victoria", "Tessa", "Karen"],
  },
};

const rejectedVoiceNameHints = [
  "whisper",
  "bad news",
  "good news",
  "bells",
  "bubbles",
  "cellos",
  "boing",
  "bahh",
  "deranged",
  "hysterical",
  "organ",
  "superstar",
  "trinoids",
  "zarvox",
  "reed",
];

const qualityVoiceNameHints = ["premium", "enhanced", "natural"];

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

export function getAgentNativeVoiceSelection(agentId: AgentId) {
  if (typeof window === "undefined") return "";
  try {
    const stored = window.localStorage.getItem(NATIVE_VOICE_SELECTION_KEY);
    if (!stored) return "";
    const parsed = JSON.parse(stored) as AgentNativeVoiceSelections;
    return typeof parsed[agentId] === "string" ? parsed[agentId] ?? "" : "";
  } catch {
    return "";
  }
}

export function saveAgentNativeVoiceSelection(agentId: AgentId, voiceUri: string) {
  if (typeof window === "undefined") return;
  let selections: AgentNativeVoiceSelections = {};
  try {
    const stored = window.localStorage.getItem(NATIVE_VOICE_SELECTION_KEY);
    if (stored) selections = JSON.parse(stored) as AgentNativeVoiceSelections;
  } catch {
    selections = {};
  }
  if (voiceUri) selections[agentId] = voiceUri;
  else delete selections[agentId];
  window.localStorage.setItem(NATIVE_VOICE_SELECTION_KEY, JSON.stringify(selections));
}

function hasNativeSpeech() {
  return typeof window !== "undefined"
    && "speechSynthesis" in window
    && typeof SpeechSynthesisUtterance !== "undefined";
}

export function isAgentAudioSupported() {
  return hasNativeSpeech() || isKendrellNeuralVoiceSupported();
}

export async function prepareAgentAudio() {
  let prepared = false;

  if (isKendrellNeuralVoiceSupported()) {
    await prepareKendrellNeuralVoice();
    prepared = true;
  }

  if (hasNativeSpeech()) {
    window.speechSynthesis.getVoices();
    prepared = true;
  }

  if (!prepared) throw new Error("Spoken replies are unavailable in this browser.");
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

function scoreNativeVoice(
  voice: SpeechSynthesisVoice,
  agentId: AgentId,
  locale: ResolvedAgentLocale,
) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  const normalizedLocale = locale.toLowerCase();
  const language = normalizedLocale.split("-")[0];
  const preferredNames = nativeVoiceProfiles[agentId].preferredNames.map((value) => value.toLowerCase());

  if (rejectedVoiceNameHints.some((hint) => name.includes(hint))) return -10_000;

  let score = 0;
  if (lang === normalizedLocale) score += 500;
  else if (lang.startsWith(`${language}-`)) score += 250;
  else score -= 500;

  if (voice.localService) score += 300;
  if (voice.default) score += 120;

  const preferredIndex = preferredNames.findIndex((preferred) => name.includes(preferred));
  if (preferredIndex >= 0) score += 700 - preferredIndex * 40;

  if (qualityVoiceNameHints.some((hint) => name.includes(hint))) score += 80;

  return score;
}

function selectNativeVoice(agentId: AgentId, locale: ResolvedAgentLocale) {
  if (!hasNativeSpeech()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const lockedVoiceUri = getAgentNativeVoiceSelection(agentId);
  if (lockedVoiceUri) {
    const lockedVoice = voices.find((voice) => voice.voiceURI === lockedVoiceUri);
    if (lockedVoice) return lockedVoice;
  }

  const ranked = [...voices]
    .map((voice) => ({ voice, score: scoreNativeVoice(voice, agentId, locale) }))
    .filter(({ score }) => score > -10_000)
    .sort((a, b) => b.score - a.score);

  if (agentId !== "diamond") {
    const preferredNames = nativeVoiceProfiles[agentId].preferredNames.map((value) => value.toLowerCase());
    const personaMatch = ranked.find(({ voice }) => {
      const name = voice.name.toLowerCase();
      return preferredNames.some((preferred) => name.includes(preferred));
    });
    if (personaMatch) return personaMatch.voice;
  }

  return ranked[0]?.voice ?? null;
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
  if (typeof window === "undefined") {
    throw new Error("Spoken replies are unavailable in this browser.");
  }

  const cleanText = text.trim();
  if (!cleanText) return false;

  const interactive = Boolean(onPlaybackStart);
  if (!interactive && activeInteractiveGeneration !== null) return false;

  const generation = ++speechGeneration;
  if (interactive) activeInteractiveGeneration = generation;
  cancelNativeSpeech();
  stopKendrellNeuralVoice();

  try {
    if (agentId === "kendrell") {
      if (!isKendrellNeuralVoiceSupported()) {
        throw new Error("Kendrell's high-quality voice is unavailable in this browser.");
      }
      const played = await speakKendrellNeuralText(cleanText, locale, onPlaybackStart);
      return played && generation === speechGeneration;
    }

    if (!hasNativeSpeech()) {
      throw new Error("Spoken replies are unavailable in this browser.");
    }
    return await speakWithNativeVoice(agentId, cleanText, locale, generation, onPlaybackStart);
  } finally {
    if (activeInteractiveGeneration === generation) activeInteractiveGeneration = null;
  }
}

export function stopAgentSpeech() {
  if (typeof window === "undefined") return;
  speechGeneration += 1;
  activeInteractiveGeneration = null;
  stopKendrellNeuralVoice();
  cancelNativeSpeech();
}
