import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const voice = readFileSync("src/lib/agentVoice.ts", "utf8");

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
  assert.match(voice, /kendrell:[\s\S]*rate: 0\.9[\s\S]*pitch: 0\.94/);
  assert.match(voice, /dion:[\s\S]*rate: 0\.94[\s\S]*pitch: 0\.98/);
  assert.match(voice, /diamond:[\s\S]*rate: 0\.92[\s\S]*pitch: 1\.02/);
  assert.match(voice, /preferredNames/);
});

test("voice selection prefers local device voices before remote browser voices", () => {
  assert.match(voice, /const localCandidates = candidates\.filter\(\(voice\) => voice\.localService\);/);
  assert.match(voice, /const pool = localCandidates\.length \? localCandidates : candidates;/);
  assert.match(voice, /pool\.find\(\(voice\) => preferredNames\.some/);
  assert.match(voice, /pool\.find\(\(voice\) => voice\.default\)/);
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
