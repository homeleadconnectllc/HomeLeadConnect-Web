import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");
const protectedLayout = readFileSync("src/layouts/ProtectedLayout.tsx", "utf8");
const contextualAgentDock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const agentChatPanel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");
const agentVoice = readFileSync("src/lib/agentVoice.ts", "utf8");
const mobileAgentPlacement = readFileSync("src/styles/mobile-agent-placement-contract.css", "utf8");

test("authenticated shell has one contextual AI agent owner without a separate tutorial bubble", () => {
  assert.match(appLayout, /const ContextualAgentDock = lazy\(\(\) => import\("\.\.\/components\/agents\/ContextualAgentDock"\)\)/);
  assert.match(appLayout, /<ContextualAgentDock \/>/);
  assert.doesNotMatch(protectedLayout, /ContextualAgentDock/);
  assert.doesNotMatch(protectedLayout, /LiveTutorialDock/);
});

test("active AI agent teaches the current workspace tab before freeform chat", () => {
  assert.match(contextualAgentDock, /type TabTutorial/);
  assert.match(contextualAgentDock, /title: "How to work Leads"/);
  assert.match(contextualAgentDock, /title: "How to use the Communications Hub"/);
  assert.match(contextualAgentDock, /className="hlc-agent-tutorial"/);
  assert.match(contextualAgentDock, /Learn this tab/);
  assert.match(contextualAgentDock, /Ask \{agent\.name\} about this tab/);
  assert.doesNotMatch(contextualAgentDock, /hlc-agent-greeting/);
});

test("mobile agent remains a bounded sheet with transcript-owned scrolling", () => {
  assert.match(mobileAgentPlacement, /max-height: min\(86dvh, 760px\) !important/);
  assert.match(mobileAgentPlacement, /\.hlc-ai-transcript[\s\S]*flex: 1 1 auto !important/);
  assert.match(mobileAgentPlacement, /\.hlc-ai-transcript[\s\S]*overflow-y: auto !important/);
  assert.match(mobileAgentPlacement, /\.hlc-ai-composer[\s\S]*position: sticky !important/);
  assert.match(mobileAgentPlacement, /\.hlc-ai-composer textarea[\s\S]*min-height: 68px !important/);
});

test("successful text chat never waits for automatic voice generation", () => {
  assert.match(agentChatPanel, /void speak\(response\.reply, false\)/);
  assert.doesNotMatch(agentChatPanel, /await speak\(response\.reply\)/);
  assert.match(agentChatPanel, /if \(reportError\) setError/);
});

test("every canonical agent room gets one proactive spoken greeting per session", () => {
  assert.match(agentChatPanel, /hlc\.agentRoomGreeting\.v1:\$\{agentId\}/);
  assert.match(agentChatPanel, /agents\[agentId\]\.introduction/);
  assert.match(agentChatPanel, /agents\[agentId\]\.question/);
  assert.match(agentChatPanel, /document\.addEventListener\("pointerdown", unlock/);
  assert.match(agentChatPanel, /stopAgentSpeech\(\)/);
});

test("agent voice defaults on and rejects stale overlapping speech generations", () => {
  assert.match(agentVoice, /return \{ enabled: true, autoSpeak: true \}/);
  assert.match(agentVoice, /let speechGeneration = 0/);
  assert.match(agentVoice, /const generation = \+\+speechGeneration/);
  assert.match(agentVoice, /if \(generation !== speechGeneration\) return false/);
  assert.match(agentVoice, /speechGeneration \+= 1/);
});
