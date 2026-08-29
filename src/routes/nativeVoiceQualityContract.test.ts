import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const agentVoice = readFileSync("src/lib/agentVoice.ts", "utf8");

test("free native agent voices use conservative clarity-first tuning", () => {
  assert.match(agentVoice, /kendrell:[\s\S]*rate: 0\.92,[\s\S]*pitch: 0\.98/);
  assert.match(agentVoice, /dion:[\s\S]*rate: 0\.94,[\s\S]*pitch: 1,/);
  assert.match(agentVoice, /diamond:[\s\S]*rate: 0\.9,[\s\S]*pitch: 1,/);
  assert.match(agentVoice, /utterance\.volume = 1/);
});

test("voice selection ranks local exact-locale voices and rejects novelty effects", () => {
  assert.match(agentVoice, /function scoreNativeVoice/);
  assert.match(agentVoice, /if \(lang === normalizedLocale\) score \+= 500/);
  assert.match(agentVoice, /if \(voice\.localService\) score \+= 300/);
  assert.match(agentVoice, /if \(voice\.default\) score \+= 120/);
  assert.match(agentVoice, /rejectedVoiceNameHints/);
  assert.match(agentVoice, /"whisper"/);
  assert.match(agentVoice, /"zarvox"/);
  assert.match(agentVoice, /\.sort\(\(a, b\) => b\.score - a\.score\)/);
});

test("native-only policy and canonical pronunciations remain intact", () => {
  assert.match(agentVoice, /speechSynthesis/);
  assert.doesNotMatch(agentVoice, /supabase\.functions\.invoke|audio\/speech|gpt-4o-mini-tts|tts-1-hd/);
  assert.match(agentVoice, /"Die-Men"/);
  assert.match(agentVoice, /"Dee-Yon"/);
  assert.match(agentVoice, /"Ken-Drayl"/);
  assert.match(agentVoice, /"H L C"/);
});
