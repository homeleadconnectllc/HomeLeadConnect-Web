import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const voice = readFileSync("src/lib/agentVoice.ts", "utf8");
const voiceRuntime = readFileSync("supabase/functions/hlc-agent-voice/index.ts", "utf8");

// Free-first release policy: paid neural TTS is an enhancement, never a requirement for audible HLC guidance.

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

test("canonical agent voices retain their primary models with a shared tts-1 resilience fallback", () => {
  assert.match(voiceRuntime, /kendrell:[\s\S]*providerVoice: "cedar"[\s\S]*model: "gpt-4o-mini-tts"[\s\S]*supportsInstructions: true/);
  assert.match(voiceRuntime, /dion:[\s\S]*providerVoice: "ash"[\s\S]*model: "gpt-4o-mini-tts"[\s\S]*supportsInstructions: true/);
  assert.match(voiceRuntime, /diamond:[\s\S]*providerVoice: "coral"[\s\S]*model: "tts-1-hd"[\s\S]*supportsInstructions: false/);
  assert.match(voiceRuntime, /const FALLBACK_VOICE_MODEL = "tts-1"/);
  assert.match(voiceRuntime, /model: profileConfig\.model/);
  assert.match(voiceRuntime, /model: FALLBACK_VOICE_MODEL/);
  assert.match(voiceRuntime, /X-HLC-Provider": usedModel/);
});

test("free browser and device speech is a final fallback when neural TTS is unavailable", () => {
  assert.match(voice, /function hasNativeSpeech\(\)/);
  assert.match(voice, /speechSynthesis/);
  assert.match(voice, /new SpeechSynthesisUtterance/);
  assert.match(voice, /speakWithNativeVoice\(agentId, cleanText, locale, generation, onPlaybackStart\)/);
  assert.match(voice, /if \(!accessToken\)[\s\S]*speakWithNativeVoice/);
  assert.match(voice, /catch \(reason\)[\s\S]*const played = await speakWithNativeVoice/);
});

test("free system fallback keeps Kendrell Dion and Diamond distinct", () => {
  assert.match(voice, /kendrell:[\s\S]*rate: 0\.9[\s\S]*pitch: 0\.86/);
  assert.match(voice, /dion:[\s\S]*rate: 1\.02[\s\S]*pitch: 0\.94/);
  assert.match(voice, /diamond:[\s\S]*rate: 0\.97[\s\S]*pitch: 1\.08/);
  assert.match(voice, /preferredNames/);
});

test("native English fallback preserves locked agent-name pronunciation", () => {
  assert.match(voice, /\.replace\(\/\\bDiamond\\b\/gi, "Die-Men"\)/);
  assert.match(voice, /\.replace\(\/\\bDion\\b\/gi, "Dee-Yon"\)/);
  assert.match(voice, /\.replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
});

test("instruction-based identity locking stays enabled only on the instruction-capable primary request", () => {
  assert.match(voiceRuntime, /const VOICE_IDENTITY_LOCK =/);
  assert.match(voiceRuntime, /Maintain one stable vocal identity across every reply/);
  assert.match(voiceRuntime, /primaryRequest\.instructions = `\$\{VOICE_IDENTITY_LOCK\} \$\{profileConfig\.direction\}/);
  assert.match(voiceRuntime, /Do not harden, tighten, sharpen, deepen, brighten, or dramatically soften the voice/);
});

test("voice provider attempts are time-bounded before failover", () => {
  assert.match(voiceRuntime, /VOICE_PROVIDER_TIMEOUT_MS = 8_000/);
  assert.match(voiceRuntime, /Promise\.race\(\[request, timeout\]\)/);
  assert.match(voiceRuntime, /controller\.abort\("voice_provider_timeout"\)/);
  assert.match(voiceRuntime, /usedModel = FALLBACK_VOICE_MODEL/);
});

test("canonical English agent-name pronunciations are locked before speech generation", () => {
  assert.match(voiceRuntime, /\.replace\(\/\\bDiamond\\b\/gi, "Die-Men"\)/);
  assert.match(voiceRuntime, /\.replace\(\/\\bDion\\b\/gi, "Dee-Yon"\)/);
  assert.match(voiceRuntime, /\.replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
  assert.match(voiceRuntime, /The name Diamond is pronounced Die-Men/);
  assert.match(voiceRuntime, /The name Dion is pronounced Dee-Yon/);
  assert.match(voiceRuntime, /The name Kendrell is pronounced Ken-Drayl/);
});
