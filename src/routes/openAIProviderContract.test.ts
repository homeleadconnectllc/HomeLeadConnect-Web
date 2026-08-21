import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chat = readFileSync(new URL("../../supabase/functions/hlc-agent-chat/index.ts", import.meta.url), "utf8");
const voice = readFileSync(new URL("../../supabase/functions/hlc-agent-voice/index.ts", import.meta.url), "utf8");

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

test("agent voice uses OpenAI speech generation while keeping identity-specific directions and access boundaries", () => {
  assert.match(voice, /Deno\.env\.get\("OPENAI_API_KEY"\)/);
  assert.match(voice, /https:\/\/api\.openai\.com\/v1\/audio\/speech/);
  assert.match(voice, /gpt-4o-mini-tts/);
  assert.doesNotMatch(voice, /generativelanguage\.googleapis\.com/);
  assert.match(voice, /voice: "cedar"/);
  assert.match(voice, /voice: "ash"/);
  assert.match(voice, /voice: "coral"/);
  assert.match(voice, /Kendrell voice access requires an approved owner, manager, or supervisor role/);
  assert.match(voice, /Diamond is the resident portal assistant/);
  assert.match(voice, /Dion is the professional portal assistant/);
});
