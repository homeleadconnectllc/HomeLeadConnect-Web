import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const voice = readFileSync("src/lib/agentVoice.ts", "utf8");

test("streamed agent voice schedules PCM chunks continuously instead of restarting playback per chunk", () => {
  assert.match(voice, /let nextPlaybackAt = context\.currentTime \+ STREAM_START_LEAD_SECONDS;/);
  assert.match(voice, /nextPlaybackAt = schedulePcmChunk\(context, bytes, nextPlaybackAt\);/);
  const streamStart = voice.indexOf("while (true)");
  const streamEnd = voice.indexOf("return started;", streamStart);
  const streamBody = voice.slice(streamStart, streamEnd);
  assert.ok(streamStart >= 0 && streamEnd > streamStart);
  assert.equal(streamBody.includes("stopActiveSources();"), false, "active audio must not be stopped between normal stream chunks");
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
