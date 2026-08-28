import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const voice = readFileSync("src/lib/agentVoice.ts", "utf8");
const maleVoice = readFileSync("src/lib/kendrellVoice.ts", "utf8");
const maleProvider = readFileSync("supabase/functions/hlc-agent-voice-male-preview/index.ts", "utf8");
const panel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");

test("Kendrell and Dion use one isolated authenticated male-voice family", () => {
  assert.match(voice, /agentId === "kendrell" \|\| agentId === "dion"/);
  assert.match(voice, /speakMaleAgentNeuralText\(agentId, cleanText, locale, onPlaybackStart\)/);
  assert.match(maleVoice, /supabase\.auth\.getSession\(\)/);
  assert.match(maleVoice, /MALE_VOICE_PREVIEW_FUNCTION = "hlc-agent-voice-male-preview"/);
  assert.match(maleVoice, /functions\/v1\/\$\{MALE_VOICE_PREVIEW_FUNCTION\}/);
  assert.match(maleVoice, /body: JSON\.stringify\(\{ agentId, text: text\.trim\(\), locale \}\)/);
  assert.match(maleVoice, /STREAM_SAMPLE_RATE = 24_000/);
});

test("Dion assembles provider PCM into one continuous Safari buffer", () => {
  assert.match(maleVoice, /if \(agentId === "dion"\)/);
  assert.match(maleVoice, /new Uint8Array\(await response\.arrayBuffer\(\)\)/);
  assert.match(maleVoice, /playContiguousPcm\(context, bytes, controller, onPlaybackStart\)/);
  assert.match(maleVoice, /continuous AudioBuffer/);
  assert.match(maleVoice, /Keep Kendrell's accepted path/);
  assert.match(maleVoice, /const reader = response\.body\.getReader\(\)/);
});

test("male agents do not silently fall back to unrelated native identities", () => {
  assert.match(voice, /if \(agentId === "kendrell" \|\| agentId === "dion"\)/);
  assert.match(voice, /throw new Error\(`\$\{label\}'s high-quality voice is unavailable in this browser\.`\)/);
  assert.match(voice, /return played && generation === speechGeneration/);
});

test("Diamond defines the shared quality baseline without becoming the male identity", () => {
  assert.match(maleProvider, /SHARED_QUALITY/);
  assert.match(maleProvider, /quality standard established by Diamond/);
  assert.match(maleProvider, /smooth, clean, stable, natural, conversational/);
  assert.match(maleProvider, /ordinary phone-conversation volume with a fully voiced tone/);
  assert.match(maleProvider, /Never whisper, murmur, speak under the breath/);
  assert.match(maleProvider, /Prioritize a believable regular human speaking voice/);
});

test("male voice generation uses a pinned TTS snapshot for delivery consistency", () => {
  assert.match(maleProvider, /const MODEL = "gpt-4o-mini-tts-2025-12-15"/);
  assert.match(maleProvider, /model: MODEL/);
});

test("Kendrell stays frozen on the accepted cedar profile", () => {
  assert.match(maleProvider, /kendrell:[\s\S]*providerVoice: "cedar"/);
  assert.match(maleProvider, /plain, smooth, natural adult male speaking voice/);
  assert.match(maleProvider, /Speak clearly and fully at normal conversational volume/);
  assert.match(maleProvider, /Every sentence must remain fully voiced and audible/);
  assert.match(maleProvider, /do not soften into a whisper/);
  assert.match(maleProvider, /Do not add cinematic depth, booming resonance, forced bass/);
  assert.match(maleProvider, /Kendrell is pronounced Ken-Drayl/);
});

test("Dion uses the physically proven cedar base with a distinct operations cadence", () => {
  assert.match(maleProvider, /dion:[\s\S]*providerVoice: "cedar"/);
  assert.match(maleProvider, /DION_CEDAR_DIRECTION/);
  assert.match(maleProvider, /same clean, stable cedar voice base that passed physical iPhone testing for Kendrell/);
  assert.match(maleProvider, /slightly quicker, more matter-of-fact operations cadence/);
  assert.match(maleProvider, /normal adult male voice at ordinary conversational volume/);
  assert.match(maleProvider, /every word fully voiced, clear, direct, relaxed, and natural/);
  assert.match(maleProvider, /Do not perform a character or add a special vocal effect/);
  assert.match(maleProvider, /agentId === "dion"[\s\S]*profileConfig\.direction[\s\S]*: `\$\{IDENTITY_LOCK\} \$\{SHARED_QUALITY\}/);
  assert.match(maleProvider, /Dion is pronounced Dee-Yon/);
});

test("male preview is isolated to Kendrell and Dion and preserves workspace authorization", () => {
  assert.match(maleProvider, /type MaleAgentId = "kendrell" \| "dion"/);
  assert.match(maleProvider, /This preview is only for Kendrell and Dion/);
  assert.match(maleProvider, /workspace_members/);
  assert.match(maleProvider, /Kendrell voice access requires an approved owner, manager, or supervisor role/);
  assert.match(maleProvider, /Authorization/);
});

test("provider English speech preserves locked HLC pronunciations", () => {
  assert.match(maleProvider, /\.replace\(\/\\bDiamond\\b\/gi, "Die-Men"\)/);
  assert.match(maleProvider, /\.replace\(\/\\bDion\\b\/gi, "Dee-Yon"\)/);
  assert.match(maleProvider, /\.replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
  assert.match(maleProvider, /\.replace\(\/\\bHLC\\b\/g, "H L C"\)/);
});

test("Diamond remains on the existing native-device path", () => {
  assert.match(voice, /function hasNativeSpeech\(\)/);
  assert.match(voice, /new SpeechSynthesisUtterance/);
  assert.match(voice, /return await speakWithNativeVoice\(agentId, cleanText, locale, generation, onPlaybackStart\)/);
  assert.match(voice, /diamond:[\s\S]*rate: 0\.9[\s\S]*pitch: 1/);
  assert.match(voice, /preferredNames: \["Samantha", "Ava", "Serena", "Victoria", "Tessa", "Karen"\]/);
});

test("native selection remains available only as Diamond's existing path", () => {
  assert.match(voice, /function scoreNativeVoice/);
  assert.match(voice, /if \(lang === normalizedLocale\) score \+= 500/);
  assert.match(voice, /if \(voice\.localService\) score \+= 300/);
  assert.match(voice, /rejectedVoiceNameHints/);
  assert.match(voice, /"reed"/);
  assert.match(voice, /return -10_000/);
});

test("newer speech requests cancel older streamed or contiguous playback", () => {
  assert.match(voice, /const interactive = Boolean\(onPlaybackStart\);/);
  assert.match(voice, /if \(!interactive && activeInteractiveGeneration !== null\) return false;/);
  assert.match(voice, /const generation = \+\+speechGeneration/);
  assert.match(voice, /cancelNativeSpeech\(\)/);
  assert.match(voice, /stopMaleAgentNeuralVoice\(\)/);
  assert.match(maleVoice, /activeAbortController\?\.abort\(\)/);
  assert.match(maleVoice, /stopSources\(\)/);
});

test("voice remains explicit opt-in and persists locally", () => {
  assert.match(voice, /return \{ enabled: false, autoSpeak: false \}/);
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
