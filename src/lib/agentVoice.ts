import type { AgentId } from "../ai/agents";

export type AgentVoicePreferences = {
  enabled: boolean;
  autoSpeak: boolean;
};

type VoiceProfile = {
  rate: number;
  pitch: number;
  volume: number;
  preferredNames: string[];
  preferredLangPrefix: string;
};

const STORAGE_KEY = "hlc.agentVoicePreferences.v1";

const DEFAULT_PREFERENCES: AgentVoicePreferences = {
  enabled: true,
  autoSpeak: false,
};

const PROFILES: Record<AgentId, VoiceProfile> = {
  kendrell: {
    rate: 0.94,
    pitch: 0.92,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Aaron", "Daniel", "Alex", "Fred", "Google US English", "Microsoft David"],
  },
  dion: {
    rate: 1.02,
    pitch: 0.98,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Daniel", "Alex", "Google US English", "Microsoft Mark", "Microsoft David"],
  },
  diamond: {
    rate: 0.96,
    pitch: 1.08,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Samantha", "Ava", "Victoria", "Karen", "Google US English", "Microsoft Zira"],
  },
};

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

function chooseVoice(agentId: AgentId, voices: SpeechSynthesisVoice[]) {
  const profile = PROFILES[agentId];
  const localeVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(profile.preferredLangPrefix));
  const pool = localeVoices.length ? localeVoices : voices;

  for (const preferredName of profile.preferredNames) {
    const match = pool.find((voice) => voice.name.toLowerCase().includes(preferredName.toLowerCase()));
    if (match) return match;
  }

  return pool.find((voice) => voice.default) || pool[0] || null;
}

export function speakAgentText(agentId: AgentId, text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  const cleanText = text.trim();
  if (!cleanText) return false;

  const profile = PROFILES[agentId];
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices();
  const voice = chooseVoice(agentId, voices);

  if (voice) utterance.voice = voice;
  utterance.rate = profile.rate;
  utterance.pitch = profile.pitch;
  utterance.volume = profile.volume;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopAgentSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
