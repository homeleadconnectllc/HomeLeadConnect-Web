import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chat = readFileSync(new URL("../../supabase/functions/hlc-agent-chat/index.ts", import.meta.url), "utf8");
const voice = readFileSync(new URL("../../supabase/functions/hlc-agent-voice/index.ts", import.meta.url), "utf8");
const chatClient = readFileSync(new URL("../api/agentChat.ts", import.meta.url), "utf8");

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

test("every HLC agent interaction carries current local temporal context", () => {
  assert.match(chatClient, /Intl\.DateTimeFormat\(\)\.resolvedOptions\(\)\.timeZone/);
  assert.match(chatClient, /HLC RUNTIME TEMPORAL CONTEXT/);
  assert.match(chatClient, /authoritative for this interaction/);
  assert.match(chatClient, /UTC instant=/);
  assert.match(chatClient, /good morning\/afternoon\/evening/);
  assert.match(chatClient, /today, tomorrow, yesterday, this week, deadlines, appointments, and follow-ups/);
  assert.match(chatClient, /Do not infer current time from conversation history/);
  assert.match(chatClient, /const localeAwareHistory = \[temporalDirective, localeDirective/);
  assert.match(chatClient, /timeZone,/);
});

test("agent voice uses streamed OpenAI speech while preserving canonical HLC voice identities, locale behavior, and access boundaries", () => {
  assert.match(voice, /Deno\.env\.get\("OPENAI_API_KEY"\)/);
  assert.match(voice, /https:\/\/api\.openai\.com\/v1\/audio\/speech/);
  assert.match(voice, /gpt-4o-mini-tts/);
  assert.doesNotMatch(voice, /generativelanguage\.googleapis\.com/);
  assert.match(voice, /response_format: "pcm"/);
  assert.match(voice, /stream_format: "audio"/);
  assert.match(voice, /new Response\(providerResponse\.body/);
  assert.match(voice, /"Content-Type": "audio\/pcm"/);
  assert.match(voice, /"X-HLC-Sample-Rate": String\(PCM_SAMPLE_RATE\)/);
  assert.match(voice, /"X-HLC-Locale": locale/);
  assert.doesNotMatch(voice, /audioBase64/);
  assert.doesNotMatch(voice, /providerResponse\.arrayBuffer\(\)/);
  assert.match(voice, /voice: "Schedar"/);
  assert.match(voice, /providerVoice: "cedar"/);
  assert.match(voice, /pronounced Ken-Drayl/);
  assert.match(voice, /voice: "Sadaltager"/);
  assert.match(voice, /providerVoice: "ash"/);
  assert.match(voice, /Pronounce the name Dion as Dee-Yon/);
  assert.match(voice, /replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
  assert.match(voice, /replace\(\/\\bDion\\b\/gi, "Dee-Yon"\)/);
  assert.match(voice, /if \(locale !== "en-US"\) return text;/);
  assert.match(voice, /input: applyCanonicalPronunciations\(text, locale\)/);
  assert.match(voice, /Use Spanish pronunciation and rhythm/);
  assert.match(voice, /Use French pronunciation and rhythm/);
  assert.match(voice, /Use Brazilian Portuguese pronunciation and rhythm/);
  assert.match(voice, /Use Mandarin pronunciation and rhythm/);
  assert.match(voice, /Use Arabic pronunciation and rhythm/);
  assert.match(voice, /voice: "Sulafat"/);
  assert.match(voice, /providerVoice: "coral"/);
  assert.match(voice, /Kendrell voice access requires an approved owner, manager, or supervisor role/);
  assert.match(voice, /Diamond is the resident portal assistant/);
  assert.match(voice, /Dion is the professional portal assistant/);
});
