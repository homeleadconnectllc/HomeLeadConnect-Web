import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const voice = readFileSync("src/lib/agentVoice.ts", "utf8");
const voiceRuntime = readFileSync("supabase/functions/hlc-agent-voice/index.ts", "utf8");

test("streamed agent voice schedules PCM chunks continuously instead of restarting playback per chunk", () => {
  assert.match(voice, /let nextPlaybackAt = context\.currentTime \+ STREAM_START_LEAD_SECONDS;/);
  assert.match(voice, /nextPlaybackAt = schedulePcmChunk\(context, bytes, nextPlaybackAt\);/);
  const streamStart = voice.indexOf("while (true)");
  const streamEnd = voice.indexOf("await waitForScheduledPlayback", streamStart);
  const streamBody = voice.slice(streamStart, streamEnd);
  assert.ok(streamStart >= 0 && streamEnd > streamStart);
  assert.equal(streamBody.includes("stopActiveSources();"), false, "active audio must not be stopped between normal stream chunks");
  assert.match(voice, /await waitForScheduledPlayback\(context, nextPlaybackAt, generation\)/);
});

test("odd-byte PCM boundaries are carried into the next network chunk", () => {
  assert.match(voice, /let carry: number \| null = null;/);
  assert.match(voice, /if \(carry !== null\)[\s\S]*combined\[0\] = carry;[\s\S]*combined\.set\(value, 1\)/);
  assert.match(voice, /if \(bytes\.byteLength % 2 === 1\)[\s\S]*carry = bytes\[bytes\.byteLength - 1\]/);
});

test("a newer voice request or explicit stop remains the only reason to cut existing playback", () => {
  assert.match(voice, /const generation = \+\+speechGeneration;[\s\S]*activeSpeechAbortController\?\.abort\(\);[\s\S]*stopActiveSources\(\);/);
  assert.match(voice, /export function stopAgentSpeech\(\)[\s\S]*speechGeneration \+= 1;[\s\S]*stopActiveSources\(\);/);
  assert.match(voice, /if \(generation !== speechGeneration\)[\s\S]*await reader\.cancel\(\);[\s\S]*return false;/);
});

test("Diamond alone uses the tts-1-hd A/B candidate while Kendrell and Dion retain the current model", () => {
  assert.match(voiceRuntime, /kendrell:[\s\S]*providerVoice: "cedar"[\s\S]*model: "gpt-4o-mini-tts"[\s\S]*supportsInstructions: true/);
  assert.match(voiceRuntime, /dion:[\s\S]*providerVoice: "ash"[\s\S]*model: "gpt-4o-mini-tts"[\s\S]*supportsInstructions: true/);
  assert.match(voiceRuntime, /diamond:[\s\S]*providerVoice: "coral"[\s\S]*model: "tts-1-hd"[\s\S]*supportsInstructions: false/);
  assert.match(voiceRuntime, /model: profileConfig\.model/);
  assert.match(voiceRuntime, /if \(profileConfig\.supportsInstructions\)/);
  assert.match(voiceRuntime, /X-HLC-Provider": profileConfig\.model/);
});

test("instruction-based identity locking stays enabled only for instruction-capable voices", () => {
  assert.match(voiceRuntime, /const VOICE_IDENTITY_LOCK =/);
  assert.match(voiceRuntime, /Maintain one stable vocal identity across every reply/);
  assert.match(voiceRuntime, /speechRequest\.instructions = `\$\{VOICE_IDENTITY_LOCK\} \$\{profileConfig\.direction\}/);
  assert.match(voiceRuntime, /Do not harden, tighten, sharpen, deepen, brighten, or dramatically soften the voice/);
});

test("canonical English agent-name pronunciations are locked before speech generation", () => {
  assert.match(voiceRuntime, /\.replace\(\/\\bDiamond\\b\/gi, "Die-Men"\)/);
  assert.match(voiceRuntime, /\.replace\(\/\\bDion\\b\/gi, "Dee-Yon"\)/);
  assert.match(voiceRuntime, /\.replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
  assert.match(voiceRuntime, /The name Diamond is pronounced Die-Men/);
  assert.match(voiceRuntime, /The name Dion is pronounced Dee-Yon/);
  assert.match(voiceRuntime, /The name Kendrell is pronounced Ken-Drayl/);
});
