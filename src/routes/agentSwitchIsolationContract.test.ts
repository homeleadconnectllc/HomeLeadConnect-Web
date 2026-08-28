import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");

test("agent changes establish a hard conversation boundary", () => {
  assert.match(panel, /const previousAgentIdRef = useRef<AgentId>\(agentId\)/);
  assert.match(panel, /const agentGenerationRef = useRef\(0\)/);
  assert.match(panel, /if \(previousAgentIdRef\.current === agentId\) return/);
  assert.match(panel, /previousAgentIdRef\.current = agentId/);
  assert.match(panel, /agentGenerationRef\.current \+= 1/);
  assert.match(panel, /recognitionRef\.current\?\.stop\(\)/);
  assert.match(panel, /recognitionRef\.current = null/);
  assert.match(panel, /stopAgentSpeech\(\)/);
  assert.match(panel, /setMessages\(\[\]\)/);
  assert.match(panel, /setDraft\(""\)/);
  assert.match(panel, /setBusy\(false\)/);
  assert.match(panel, /setListening\(false\)/);
  assert.match(panel, /setError\(""\)/);
  assert.match(panel, /setFallbackMode\(false\)/);
  assert.match(panel, /setVoicePhase\("idle"\)/);
});

test("responses from a previous agent generation cannot mutate or speak in the new agent tab", () => {
  assert.match(panel, /const requestGeneration = agentGenerationRef\.current/);
  assert.match(panel, /const response = await chatWithAgent\(agentId, clean, prior, resolvedLocale\)/);
  assert.match(panel, /if \(requestGeneration !== agentGenerationRef\.current\) return/);
  assert.match(panel, /if \(!response\.fallback && voicePreferences\.enabled && voicePreferences\.autoSpeak\) void speak/);
  assert.match(panel, /finally \{[\s\S]*if \(requestGeneration === agentGenerationRef\.current\) setBusy\(false\)/);
});
