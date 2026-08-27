import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { agents } from "./agents.ts";
import {
  HLC_AGENT_HANDOFF_FIELDS,
  HLC_AGENT_PARITY_PRINCIPLE,
  HLC_AGENT_QUALITY_CONTRACT,
  HLC_AGENT_SHARED_RUNTIME_LIMITS,
  HLC_AGENT_VOICE_QUALITY_CONTRACT,
} from "./agentQualityContract.ts";

const chatRuntime = readFileSync("supabase/functions/hlc-agent-chat/index.ts", "utf8");
const voiceRuntime = readFileSync("supabase/functions/hlc-agent-voice/index.ts", "utf8");
const voiceClient = readFileSync("src/lib/agentVoice.ts", "utf8");
const chatPanel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");

test("all three agents share one non-negotiable quality baseline", () => {
  assert.equal(Object.keys(agents).length, 3);
  assert.ok(HLC_AGENT_QUALITY_CONTRACT.length >= 10);
  assert.ok(HLC_AGENT_VOICE_QUALITY_CONTRACT.length >= 10);
  assert.ok(HLC_AGENT_PARITY_PRINCIPLE.includes("same evidence, authorization, safety, recovery, handoff, interruption, locale, audit, and reliability standards"));

  for (const agent of Object.values(agents)) {
    assert.ok(agent.operatingDoctrine.authoritativeData.length >= 4);
    assert.ok(agent.operatingDoctrine.responsibilities.length >= 4);
    assert.ok(agent.operatingDoctrine.escalationTriggers.length >= 4);
    assert.ok(agent.operatingDoctrine.handoffRules.length >= 2);
    assert.ok(agent.operatingDoctrine.completionCriteria.length >= 4);
    assert.ok(agent.voicePersona.avoid.some((value) => /robotic/i.test(value)));
    assert.ok(agent.voicePersona.tone.length >= 30);
    assert.ok(agent.voicePersona.pacing.length >= 25);
  }
});

test("chat runtime applies one evidence authorization fallback and audit mechanism to every agent", () => {
  assert.match(chatRuntime, /const commonOperatingProtocol/);
  assert.match(chatRuntime, /const agentRules: Record<AgentId, string>/);
  assert.match(chatRuntime, /const OPENAI_CHAT_MODEL = "gpt-5\.6-terra"/);
  assert.match(chatRuntime, /const CHAT_PROVIDER_TIMEOUT_MS = 12_000/);
  assert.match(chatRuntime, /body\.history\.slice\(-8\)/);
  assert.match(chatRuntime, /message\.length > 4000/);
  assert.match(chatRuntime, /ai_agent_runs/);
  assert.match(chatRuntime, /returnFallback/);
  assert.match(chatRuntime, /provider_timeout/);
  assert.match(chatRuntime, /provider_network_error/);
  assert.match(chatRuntime, /provider_empty_response/);
  assert.match(chatRuntime, /KNOWLEDGE != AUTHORITY/);
  assert.match(chatRuntime, /Never expose the workspace identifier/);
});

test("handoff semantics carry the same minimum context regardless of specialist", () => {
  assert.deepEqual(HLC_AGENT_HANDOFF_FIELDS, [
    "objective",
    "verified current state",
    "blocker",
    "urgency or impact",
    "attempted work",
    "requested action or decision",
    "definition of done",
  ]);
  assert.match(chatRuntime, /Handoffs must be structured: objective; verified current state; blocker; urgency\/impact; attempted steps; recommended next action; expected result\/definition of done/);
});

test("voice transport reliability mechanics are shared across Kendrell Dion and Diamond", () => {
  assert.match(voiceRuntime, /const VOICE_PROVIDER_TIMEOUT_MS = 12_000/);
  assert.match(voiceRuntime, /const PCM_SAMPLE_RATE = 24_000/);
  assert.match(voiceRuntime, /text\.length > 4000/);
  assert.match(voiceRuntime, /fallbackToText: true/);
  assert.match(voiceRuntime, /providerAbort\.abort\("voice_provider_timeout"\)/);
  assert.match(voiceRuntime, /VOICE_PROVIDER_EMPTY_AUDIO/);

  assert.match(voiceClient, /activeSpeechAbortController\?\.abort\(\)/);
  assert.match(voiceClient, /speechGeneration \+= 1/);
  assert.match(voiceClient, /activeInteractiveGeneration/);
  assert.match(voiceClient, /Background greeting\/briefing speech must never interrupt that authoritative stream/);
  assert.match(voiceClient, /window\.speechSynthesis\?\.cancel\(\)/);
  assert.doesNotMatch(voiceClient, /speechSynthesis\.speak/);
  assert.match(voiceClient, /STREAM_SAMPLE_RATE = 24_000/);
  assert.match(voiceClient, /bytes\.byteLength % 2 === 1/);
  assert.match(voiceClient, /ensureAudioContextRunning\(context\)/);
});

test("text success remains authoritative when voice is unavailable", () => {
  assert.match(chatPanel, /text chat still proceeds/);
  assert.match(chatPanel, /if \(!response\.fallback && voicePreferences\.enabled && voicePreferences\.autoSpeak\) void speak/);
  assert.match(chatPanel, /Live reasoning will resume automatically when the provider is available/);
  assert.match(chatPanel, /voice did not start\. Tap Listen to retry/);
});

test("shared runtime limits stay consistent between chat and voice layers", () => {
  assert.equal(HLC_AGENT_SHARED_RUNTIME_LIMITS.maxUserMessageCharacters, 4000);
  assert.equal(HLC_AGENT_SHARED_RUNTIME_LIMITS.maxSpeechCharacters, 4000);
  assert.equal(HLC_AGENT_SHARED_RUNTIME_LIMITS.maxConversationHistoryItems, 8);
  assert.equal(HLC_AGENT_SHARED_RUNTIME_LIMITS.providerTimeoutMs, 12000);
  assert.equal(HLC_AGENT_SHARED_RUNTIME_LIMITS.pcmSampleRate, 24000);
});
