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
    // Keep Kendrell close to the voice engine's native prosody. Large pitch/rate
    // changes make compact Safari voices noticeably synthetic.
    rate: 0.98,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Siri", "Reed", "Evan", "Nathan", "Daniel", "Alex", "Tom", "Rishi"],
    avoidNames: ["Fred", "Aaron", "Google US English"],
  },
  dion: {
    rate: 1.02,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Siri", "Daniel", "Alex", "Evan", "Nathan", "Microsoft Mark", "Microsoft David"],
  },
  diamond: {
    rate: 0.98,
    pitch: 1,
    volume: 1,
    preferredLangPrefix: "en",
    preferredNames: ["Siri", "Samantha", "Ava", "Victoria", "Karen", "Moira", "Tessa", "Microsoft Zira"],
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

function scoreVoice(agentId: AgentId, voice: SpeechSynthesisVoice) {
  const profile = PROFILES[agentId];
  const name = voice.name || "";
  const uri = voice.voiceURI || "";
  const qualityText = `${name} ${uri}`.toLowerCase();
  let score = 0;

  if (voice.lang.toLowerCase() === "en-us") score += 18;
  else if (voice.lang.toLowerCase().startsWith(profile.preferredLangPrefix)) score += 10;

  if (voice.localService) score += 8;
  if (voice.default) score += 5;

  // Browsers/OSes commonly expose quality hints in the voice name or URI.
  if (/(premium|enhanced|neural|natural)/.test(qualityText)) score += 90;
  if (/siri/.test(qualityText)) score += 75;
  if (/(compact|legacy|espeak)/.test(qualityText)) score -= 100;

  profile.preferredNames.forEach((preferredName, index) => {
    if (includesIgnoreCase(name, preferredName) || includesIgnoreCase(uri, preferredName)) {
      score += 60 - index * 4;
    }
  });

  for (const avoidedName of profile.avoidNames ?? []) {
    if (includesIgnoreCase(name, avoidedName) || includesIgnoreCase(uri, avoidedName)) score -= 120;
  }

  return score;
}

function chooseVoice(agentId: AgentId, voices: SpeechSynthesisVoice[]) {
  const profile = PROFILES[agentId];
  const localeVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith(profile.preferredLangPrefix));
  const pool = localeVoices.length ? localeVoices : voices;

  return [...pool].sort((a, b) => scoreVoice(agentId, b) - scoreVoice(agentId, a))[0] || null;
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

  // Safari can expose an empty list on first use. Waiting for voiceschanged avoids
  // immediately falling through to the browser's lowest-quality default voice.
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
