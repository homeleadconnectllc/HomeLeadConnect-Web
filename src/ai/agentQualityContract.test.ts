import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  HLC_AGENT_HANDOFF_FIELDS,
  HLC_AGENT_PARITY_PRINCIPLE,
  HLC_AGENT_QUALITY_CONTRACT,
  HLC_AGENT_RUNTIME_LIMITS,
  HLC_AGENT_VOICE_QUALITY_CONTRACT,
} from "./agentQualityContract.ts";

const chatRuntime = readFileSync("supabase/functions/hlc-agent-chat/index.ts", "utf8");
const voiceRuntime = readFileSync("supabase/functions/hlc-agent-voice/index.ts", "utf8");

test("shared agent quality contract remains explicit and evidence-first", () => {
  assert.ok(HLC_AGENT_QUALITY_CONTRACT.length >= 10);
  assert.ok(HLC_AGENT_VOICE_QUALITY_CONTRACT.length >= 10);
  assert.match(HLC_AGENT_PARITY_PRINCIPLE, /same evidence, authorization, safety, recovery, handoff, interruption, locale, audit, and reliability standards/);
});

test("handoff contract preserves minimum context", () => {
  assert.deepEqual(HLC_AGENT_HANDOFF_FIELDS, [
    "objective",
    "verified current state",
    "blocker",
    "urgency or impact",
    "attempted work",
    "requested action or decision",
    "definition of done",
  ]);
  assert.match(chatRuntime, /Handoffs must be structured/);
});

test("runtime limits match the active chat and voice transports", () => {
  assert.equal(HLC_AGENT_RUNTIME_LIMITS.maxUserMessageCharacters, 4000);
  assert.equal(HLC_AGENT_RUNTIME_LIMITS.maxSpeechCharacters, 4000);
  assert.equal(HLC_AGENT_RUNTIME_LIMITS.maxConversationHistoryItems, 8);
  assert.equal(HLC_AGENT_RUNTIME_LIMITS.chatProviderTimeoutMs, 12000);
  assert.equal(HLC_AGENT_RUNTIME_LIMITS.voiceProviderTimeoutMs, 8000);
  assert.equal(HLC_AGENT_RUNTIME_LIMITS.pcmSampleRate, 24000);

  assert.match(chatRuntime, /const CHAT_PROVIDER_TIMEOUT_MS = 12_000/);
  assert.match(chatRuntime, /message\.length > 4000/);
  assert.match(chatRuntime, /body\.history\.slice\(-8\)/);
  assert.match(voiceRuntime, /const VOICE_PROVIDER_TIMEOUT_MS = 8_000/);
  assert.match(voiceRuntime, /const PCM_SAMPLE_RATE = 24_000/);
  assert.match(voiceRuntime, /text\.length > 4000/);
});

test("internal follow-up metrics stay tenant scoped", () => {
  const scopedFollowUpQueries = chatRuntime.match(/admin\.from\("follow_ups"\)[^\n]+\.eq\("workspace_id", workspaceId\)/g) ?? [];
  assert.equal(scopedFollowUpQueries.length, 2);
});
