import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const voice = readFileSync("src/lib/agentVoice.ts", "utf8");
const kendrellVoice = readFileSync("src/lib/kendrellVoice.ts", "utf8");
const provider = readFileSync("supabase/functions/hlc-agent-voice/index.ts", "utf8");
const panel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");

test("Kendrell alone uses the authenticated high-quality streamed voice runtime", () => {
  assert.match(voice, /if \(agentId === "kendrell"\)/);
  assert.match(voice, /speakKendrellNeuralText\(cleanText, locale, onPlaybackStart\)/);
  assert.match(kendrellVoice, /supabase\.auth\.getSession\(\)/);
  assert.match(kendrellVoice, /functions\/v1\/hlc-agent-voice/);
  assert.match(kendrellVoice, /body: JSON\.stringify\(\{ agentId: "kendrell", text: text\.trim\(\), locale \}\)/);
  assert.match(kendrellVoice, /STREAM_SAMPLE_RATE = 24_000/);
  assert.match(kendrellVoice, /response\.body\.getReader\(\)/);
});

test("Kendrell never silently falls back to a different native voice identity", () => {
  assert.match(voice, /if \(agentId === "kendrell"\)[\s\S]*throw new Error\("Kendrell's high-quality voice is unavailable in this browser\."\)/);
  assert.match(voice, /if \(agentId === "kendrell"\)[\s\S]*return played && generation === speechGeneration;/);
});

test("Kendrell provider is identity-locked to the deep steady executive benchmark", () => {
  assert.match(provider, /const VOICE_IDENTITY_LOCK/);
  assert.match(provider, /kendrell:[\s\S]*providerVoice: "cedar"/);
  assert.match(provider, /kendrell:[\s\S]*model: "gpt-4o-mini-tts"/);
  assert.match(provider, /natural adult male executive operator/);
  assert.match(provider, /consistent medium-low pitch/);
  assert.match(provider, /Never whisper/);
  assert.match(provider, /never sound breathy, raspy, scratchy/);
});

test("Dion and Diamond remain on the native-device path while their physical rounds are unchanged", () => {
  assert.match(voice, /function hasNativeSpeech\(\)/);
  assert.match(voice, /new SpeechSynthesisUtterance/);
  assert.match(voice, /return await speakWithNativeVoice\(agentId, cleanText, locale, generation, onPlaybackStart\)/);
  assert.match(voice, /dion:[\s\S]*rate: 0\.94[\s\S]*pitch: 1/);
  assert.match(voice, /diamond:[\s\S]*rate: 0\.9[\s\S]*pitch: 1/);
});

test("native voice selection still ranks local exact-locale voices and rejects poor physical-device candidates", () => {
  assert.match(voice, /function scoreNativeVoice/);
  assert.match(voice, /if \(lang === normalizedLocale\) score \+= 500/);
  assert.match(voice, /if \(voice\.localService\) score \+= 300/);
  assert.match(voice, /if \(voice\.default\) score \+= 120/);
  assert.match(voice, /rejectedVoiceNameHints/);
  assert.match(voice, /"reed"/);
  assert.match(voice, /return -10_000/);
  assert.match(voice, /\.sort\(\(a, b\) => b\.score - a\.score\)/);
});

test("Dion prefers persona-matched native voices while Diamond keeps her passing ranked path", () => {
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

test("provider English speech preserves Kendrell canonical pronunciation", () => {
  assert.match(provider, /\.replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
});

test("interactive speech remains authoritative and newer requests cancel older speech", () => {
  assert.match(voice, /const interactive = Boolean\(onPlaybackStart\);/);
  assert.match(voice, /if \(!interactive && activeInteractiveGeneration !== null\) return false;/);
  assert.match(voice, /const generation = \+\+speechGeneration;/);
  assert.match(voice, /cancelNativeSpeech\(\);/);
  assert.match(voice, /stopKendrellNeuralVoice\(\);/);
  assert.match(voice, /if \(generation !== speechGeneration\)[\s\S]*window\.speechSynthesis\.cancel\(\)/);
});

test("explicit stop cancels both Kendrell streamed speech and native speech", () => {
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*speechGeneration \+= 1;/);
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*activeInteractiveGeneration = null;/);
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*stopKendrellNeuralVoice\(\);/);
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*cancelNativeSpeech\(\);/);
  assert.match(kendrellVoice, /activeAbortController\?\.abort\(\)/);
  assert.match(kendrellVoice, /stopSources\(\)/);
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
