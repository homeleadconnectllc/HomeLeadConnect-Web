import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const voice = readFileSync("src/lib/agentVoice.ts", "utf8");
const panel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");

// HLC free-only release policy: spoken replies use the local browser/device speech
// engine. No paid or external TTS provider is required by the active client path.

test("active HLC agent speech is native-device only", () => {
  assert.match(voice, /function hasNativeSpeech\(\)/);
  assert.match(voice, /speechSynthesis/);
  assert.match(voice, /new SpeechSynthesisUtterance/);
  assert.doesNotMatch(voice, /supabaseConfig/);
  assert.doesNotMatch(voice, /supabase\.auth/);
  assert.doesNotMatch(voice, /functions\/v1\/hlc-agent-voice/);
  assert.doesNotMatch(voice, /fetch\(/);
  assert.doesNotMatch(voice, /AudioContext/);
});

test("free native profiles are clarity-first and remain distinct", () => {
  assert.match(voice, /kendrell:[\s\S]*rate: 0\.92[\s\S]*pitch: 0\.98/);
  assert.match(voice, /dion:[\s\S]*rate: 0\.94[\s\S]*pitch: 1/);
  assert.match(voice, /diamond:[\s\S]*rate: 0\.9[\s\S]*pitch: 1/);
  assert.match(voice, /preferredNames/);
});

test("voice selection ranks local exact-locale voices and rejects poor physical-device candidates", () => {
  assert.match(voice, /function scoreNativeVoice/);
  assert.match(voice, /if \(lang === normalizedLocale\) score \+= 500/);
  assert.match(voice, /if \(voice\.localService\) score \+= 300/);
  assert.match(voice, /if \(voice\.default\) score \+= 120/);
  assert.match(voice, /rejectedVoiceNameHints/);
  assert.match(voice, /"reed"/);
  assert.match(voice, /return -10_000/);
  assert.match(voice, /\.sort\(\(a, b\) => b\.score - a\.score\)/);
});

test("Kendrell and Dion prefer persona-matched male-named native voices while Diamond keeps her passing ranked path", () => {
  assert.match(voice, /kendrell:[\s\S]*preferredNames: \["Daniel", "Aaron", "Alex", "Arthur", "Ralph"\]/);
  assert.match(voice, /dion:[\s\S]*preferredNames: \["Tom", "Nathan", "Oliver", "Albert", "Alex"\]/);
  assert.match(voice, /if \(agentId !== "diamond"\)/);
  assert.match(voice, /const personaMatch = ranked\.find/);
  assert.match(voice, /if \(personaMatch\) return personaMatch\.voice/);
});

test("native English speech preserves locked HLC pronunciations", () => {
  assert.match(voice, /\.replace\(\/\\bDiamond\\b\/gi, "Die-Men"\)/);
  assert.match(voice, /\.replace\(\/\\bDion\\b\/gi, "Dee-Yon"\)/);
  assert.match(voice, /\.replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
  assert.match(voice, /\.replace\(\/\\bHLC\\b\/g, "H L C"\)/);
});

test("interactive speech remains authoritative and newer requests cancel older speech", () => {
  assert.match(voice, /const interactive = Boolean\(onPlaybackStart\);/);
  assert.match(voice, /if \(!interactive && activeInteractiveGeneration !== null\) return false;/);
  assert.match(voice, /const generation = \+\+speechGeneration;/);
  assert.match(voice, /cancelNativeSpeech\(\);/);
  assert.match(voice, /if \(generation !== speechGeneration\)[\s\S]*window\.speechSynthesis\.cancel\(\)/);
});

test("explicit stop cancels native speech and invalidates the active generation", () => {
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*speechGeneration \+= 1;/);
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*activeInteractiveGeneration = null;/);
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*cancelNativeSpeech\(\);/);
});

test("voice remains explicit opt-in and persists locally", () => {
  assert.match(voice, /return \{ enabled: false, autoSpeak: false \};/);
  assert.match(voice, /window\.localStorage\.getItem\(STORAGE_KEY\)/);
  assert.match(voice, /window\.localStorage\.setItem\(STORAGE_KEY, JSON\.stringify\(preferences\)\)/);
});

test("agent tab changes hard-reset stale speech, dictation, transcript, and busy state", () => {
  assert.match(panel, /const previousAgentIdRef = useRef<AgentId>\(agentId\)/);
  assert.match(panel, /const agentGenerationRef = useRef\(0\)/);
  assert.match(panel, /if \(previousAgentIdRef\.current === agentId\) return/);
  assert.match(panel, /agentGenerationRef\.current \+= 1/);
  assert.match(panel, /recognitionRef\.current\?\.stop\(\)/);
  assert.match(panel, /recognitionRef\.current = null/);
  assert.match(panel, /stopAgentSpeech\(\)/);
  assert.match(panel, /setMessages\(\[\]\)/);
  assert.match(panel, /setDraft\(""\)/);
  assert.match(panel, /setBusy\(false\)/);
  assert.match(panel, /setListening\(false\)/);
  assert.match(panel, /setError\(""\)/);
  assert.match(panel, /setFallbackMode\(false\)/);
  assert.match(panel, /setVoicePhase\("idle"\)/);
});

test("a response from the previous agent generation cannot land or speak after a tab switch", () => {
  assert.match(panel, /const requestGeneration = agentGenerationRef\.current/);
  assert.match(panel, /const response = await chatWithAgent\(agentId, clean, prior, resolvedLocale\)/);
  assert.match(panel, /if \(requestGeneration !== agentGenerationRef\.current\) return/);
  assert.match(panel, /if \(!response\.fallback && voicePreferences\.enabled && voicePreferences\.autoSpeak\) void speak/);
  assert.match(panel, /finally \{[\s\S]*if \(requestGeneration === agentGenerationRef\.current\) setBusy\(false\)/);
});
