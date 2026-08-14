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
  avoidNames?: string[];
  preferredLangPrefix: string;
};

const STORAGE_KEY = "hlc.agentVoicePreferences.v1";

const DEFAULT_PREFERENCES: AgentVoicePreferences = {
  enabled: true,
  autoSpeak: false,
};

// These profiles are intentionally conservative. Browser speech is a fallback-only
// path; the app should not try to infer "premium" quality from arbitrary OS labels.
// Prefer known, stable voices in a fixed order and preserve native pitch.
const PROFILES: Record<AgentId, VoiceProfile> = {
  kendrell: {
    rate: 0.98,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Alex", "Daniel", "Evan", "Nathan", "Tom"],
    avoidNames: ["Fred", "Aaron", "Google US English", "compact", "legacy", "espeak"],
  },
  dion: {
    rate: 1,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Daniel", "Alex", "Evan", "Nathan", "Tom"],
    avoidNames: ["Fred", "Aaron", "Google US English", "compact", "legacy", "espeak"],
  },
  diamond: {
    rate: 0.98,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Samantha", "Victoria", "Ava", "Karen", "Tessa", "Moira"],
    avoidNames: ["Google US English", "compact", "legacy", "espeak"],
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

function includesIgnoreCase(value: string, needle: string) {
  return value.toLowerCase().includes(needle.toLowerCase());
}

function chooseVoice(agentId: AgentId, voices: SpeechSynthesisVoice[]) {
  const profile = PROFILES[agentId];
  const localeVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith(profile.preferredLangPrefix),
  );
  const pool = localeVoices.length ? localeVoices : voices;
  const avoided = profile.avoidNames ?? [];

  for (const preferredName of profile.preferredNames) {
    const preferred = pool.find((voice) =>
      (includesIgnoreCase(voice.name || "", preferredName) ||
        includesIgnoreCase(voice.voiceURI || "", preferredName)) &&
      !avoided.some((name) =>
        includesIgnoreCase(voice.name || "", name) || includesIgnoreCase(voice.voiceURI || "", name),
      ),
    );
    if (preferred) return preferred;
  }

  const safeDefault = pool.find((voice) =>
    voice.default &&
    !avoided.some((name) =>
      includesIgnoreCase(voice.name || "", name) || includesIgnoreCase(voice.voiceURI || "", name),
    ),
  );
  if (safeDefault) return safeDefault;

  return pool.find((voice) =>
    !avoided.some((name) =>
      includesIgnoreCase(voice.name || "", name) || includesIgnoreCase(voice.voiceURI || "", name),
    ),
  ) || pool[0] || null;
}

function speakWithAvailableVoices(agentId: AgentId, cleanText: string) {
  const profile = PROFILES[agentId];
  const utterance = new SpeechSynthesisUtterance(cleanText);
  const voices = window.speechSynthesis.getVoices();
  const voice = chooseVoice(agentId, voices);

  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang || navigator.language || "en-US";
  utterance.rate = profile.rate;
  utterance.pitch = profile.pitch;
  utterance.volume = profile.volume;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function speakAgentText(agentId: AgentId, text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  const cleanText = text.trim();
  if (!cleanText) return false;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    speakWithAvailableVoices(agentId, cleanText);
    return true;
  }

  let spoken = false;
  const speakOnce = () => {
    if (spoken) return;
    spoken = true;
    window.speechSynthesis.removeEventListener("voiceschanged", speakOnce);
    speakWithAvailableVoices(agentId, cleanText);
  };

  window.speechSynthesis.addEventListener("voiceschanged", speakOnce, { once: true });
  window.setTimeout(speakOnce, 500);
  return true;
}

export function stopAgentSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
