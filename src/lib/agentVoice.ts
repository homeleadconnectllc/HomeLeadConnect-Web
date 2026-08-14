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

const PROFILES: Record<AgentId, VoiceProfile> = {
  kendrell: {
    // Keep Kendrell close to the system voice's native prosody. Heavy pitch/rate
    // manipulation makes Apple's compact Safari voices sound noticeably robotic.
    rate: 0.98,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Evan", "Nathan", "Daniel", "Alex", "Tom", "Reed", "Rishi"],
    // These voices are valid fallbacks but commonly sound more synthetic on iOS.
    avoidNames: ["Fred", "Aaron", "Google US English"],
  },
  dion: {
    rate: 1.02,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Daniel", "Alex", "Evan", "Nathan", "Microsoft Mark", "Microsoft David"],
  },
  diamond: {
    rate: 0.98,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Samantha", "Ava", "Victoria", "Karen", "Moira", "Tessa", "Microsoft Zira"],
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

function voiceMatchesName(voice: SpeechSynthesisVoice, name: string) {
  return voice.name.toLowerCase().includes(name.toLowerCase());
}

function chooseVoice(agentId: AgentId, voices: SpeechSynthesisVoice[]) {
  const profile = PROFILES[agentId];
  const localeVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(profile.preferredLangPrefix));
  const pool = localeVoices.length ? localeVoices : voices;

  for (const preferredName of profile.preferredNames) {
    const match = pool.find((voice) => voiceMatchesName(voice, preferredName));
    if (match) return match;
  }

  const avoided = profile.avoidNames ?? [];
  const naturalFallback = pool.find(
    (voice) => voice.default && !avoided.some((name) => voiceMatchesName(voice, name)),
  ) || pool.find(
    (voice) => voice.localService && !avoided.some((name) => voiceMatchesName(voice, name)),
  ) || pool.find(
    (voice) => !avoided.some((name) => voiceMatchesName(voice, name)),
  );

  return naturalFallback || pool.find((voice) => voice.default) || pool[0] || null;
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

  // Safari can expose an empty voice list on the first call. Waiting briefly for
  // voiceschanged prevents it from silently falling back to a low-quality default.
  let spoken = false;
  const speakOnce = () => {
    if (spoken) return;
    spoken = true;
    window.speechSynthesis.removeEventListener("voiceschanged", speakOnce);
    speakWithAvailableVoices(agentId, cleanText);
  };

  window.speechSynthesis.addEventListener("voiceschanged", speakOnce, { once: true });
  window.setTimeout(speakOnce, 350);
  return true;
}

export function stopAgentSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
