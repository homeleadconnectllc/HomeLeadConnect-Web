import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const voice = readFileSync("src/lib/agentVoice.ts", "utf8");

test("agent voice claims the single playback generation before awaiting auth", () => {
  const generationIndex = voice.indexOf("const generation = ++speechGeneration");
  const authIndex = voice.indexOf("await supabase.auth.getSession()");
  assert.ok(generationIndex >= 0, "voice generation guard must exist");
  assert.ok(authIndex >= 0, "auth lookup must exist");
  assert.ok(generationIndex < authIndex, "latest voice request must become authoritative before async auth work");
  assert.match(voice, /if \(generation !== speechGeneration\) return false;\n  const accessToken/);
});

test("agent voice cancels competing native speech and active Web Audio sources", () => {
  assert.match(voice, /window\.speechSynthesis\?\.cancel\(\)/);
  assert.match(voice, /activeSpeechAbortController\?\.abort\(\)/);
  assert.match(voice, /cancelNativeSpeech\(\);\n  stopActiveSources\(\);/);
});

test("stopAgentSpeech invalidates pending async requests before they can start", () => {
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*speechGeneration \+= 1;[\s\S]*cancelNativeSpeech\(\);[\s\S]*stopActiveSources\(\);/);
});
