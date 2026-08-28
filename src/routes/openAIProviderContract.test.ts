import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chat = readFileSync(new URL("../../supabase/functions/hlc-agent-chat/index.ts", import.meta.url), "utf8");
const legacyVoice = readFileSync(new URL("../../supabase/functions/hlc-agent-voice/index.ts", import.meta.url), "utf8");
const chatClient = readFileSync(new URL("../api/agentChat.ts", import.meta.url), "utf8");
const voiceClient = readFileSync(new URL("../lib/agentVoice.ts", import.meta.url), "utf8");

test("agent chat uses the server-side OpenAI Responses API without weakening HLC authorization", () => {
  assert.match(chat, /Deno\.env\.get\("OPENAI_API_KEY"\)/);
  assert.match(chat, /https:\/\/api\.openai\.com\/v1\/responses/);
  assert.match(chat, /gpt-5\.6-terra/);
  assert.doesNotMatch(chat, /generativelanguage\.googleapis\.com/);
  assert.match(chat, /workspace_members/);
  assert.match(chat, /Kendrell command access requires an approved owner, manager, or supervisor role/);
  assert.match(chat, /resident_portal.*diamond/s);
  assert.match(chat, /professional_portal.*dion/s);
  assert.match(chat, /provider_key_missing/);
  assert.match(chat, /provider_timeout/);
});

test("every HLC agent interaction receives local temporal context without treating device time as trusted business evidence", () => {
  assert.match(chatClient, /Intl\.DateTimeFormat\(\)\.resolvedOptions\(\)\.timeZone/);
  assert.match(chatClient, /HLC RUNTIME TEMPORAL CONTEXT/);
  assert.match(chatClient, /device-reported conversational context/);
  assert.match(chatClient, /UTC instant=/);
  assert.match(chatClient, /Do not treat device time or time zone as trusted business evidence/);
  assert.match(chatClient, /prefer canonical stored timestamps and verified HLC record data whenever available/);
  assert.match(chatClient, /Do not infer the current time from conversation history/);
  assert.match(chatClient, /const localeAwareHistory = \[temporalDirective, localeDirective/);
  assert.match(chatClient, /timeZone/);
});

test("spoken agent output is free native-device speech and does not call the legacy paid TTS endpoint", () => {
  assert.match(voiceClient, /function hasNativeSpeech\(\)/);
  assert.match(voiceClient, /new SpeechSynthesisUtterance\(nativeSpeechText\(text, locale\)\)/);
  assert.match(voiceClient, /window\.speechSynthesis\.speak\(utterance\)/);
  assert.match(voiceClient, /const localCandidates = candidates\.filter\(\(voice\) => voice\.localService\)/);
  assert.doesNotMatch(voiceClient, /hlc-agent-voice|api\.openai\.com\/v1\/audio\/speech|gpt-4o-mini-tts|tts-1-hd|FALLBACK_VOICE_MODEL|response_format/);
  assert.match(voiceClient, /replace\(\/\\bDiamond\\b\/gi, "Die-Men"\)/);
  assert.match(voiceClient, /replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
  assert.match(voiceClient, /replace\(\/\\bDion\\b\/gi, "Dee-Yon"\)/);
  assert.match(voiceClient, /replace\(\/\\bHLC\\b\/g, "H L C"\)/);

  // The historical server function may remain in the repository for rollback/audit,
  // but it is not the active HLC spoken-reply dependency.
  assert.match(legacyVoice, /Deno\.serve/);
});
