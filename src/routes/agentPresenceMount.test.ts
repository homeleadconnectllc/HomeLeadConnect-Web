import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");
const protectedLayout = readFileSync("src/layouts/ProtectedLayout.tsx", "utf8");
const universalAiTeamLauncher = readFileSync("src/components/agents/UniversalAITeamLauncher.tsx", "utf8");
const contextualAgentDock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const agentChatPanel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");
const agentVoice = readFileSync("src/lib/agentVoice.ts", "utf8");
const mobileAgentPlacement = readFileSync("src/styles/mobile-agent-placement-contract.css", "utf8");

test("authenticated shell has one universal AI Team launcher without the retired contextual dock", () => {
  assert.match(appLayout, /const UniversalAITeamLauncher = lazy\(\(\) => import\("\.\.\/components\/agents\/UniversalAITeamLauncher"\)\)/);
  assert.match(appLayout, /<UniversalAITeamLauncher \/>/);
  assert.doesNotMatch(appLayout, /ContextualAgentDock/);
  assert.doesNotMatch(protectedLayout, /ContextualAgentDock/);
  assert.doesNotMatch(protectedLayout, /LiveTutorialDock/);
  assert.match(universalAiTeamLauncher, /const \[activeAgentId, setActiveAgentId\] = useState<AgentId \| null>\(null\)/);
  assert.match(universalAiTeamLauncher, /setActiveAgentId\(agent\.id\)/);
  assert.match(universalAiTeamLauncher, /key=\{activeAgent\.id\}/);
});

test("retained contextual agent implementation still teaches the current workspace tab", () => {
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
  assert.match(agentChatPanel, /void speak\(response\.reply, false, responseLocale\)/);
  assert.doesNotMatch(agentChatPanel, /await speak\(response\.reply/);
  assert.match(agentChatPanel, /if \(reportError\) setError/);
});

test("every canonical agent room gets one locale-specific proactive spoken greeting per session after voice opt-in", () => {
  assert.match(agentChatPanel, /hlc\.agentRoomGreeting\.v2:\$\{agentId\}:\$\{activeLocale\}/);
  assert.match(agentChatPanel, /agents\[agentId\]\.introduction/);
  assert.match(agentChatPanel, /agents\[agentId\]\.question/);
  assert.match(agentChatPanel, /speakAgentText\(agentId, greeting, activeLocale\)/);
  assert.match(agentChatPanel, /document\.addEventListener\("pointerdown", unlock/);
  assert.match(agentChatPanel, /stopAgentSpeech\(\)/);
});

test("agent voice stays explicit opt-in and rejects stale overlapping native speech generations", () => {
  assert.match(agentVoice, /return \{ enabled: false, autoSpeak: false \}/);
  assert.match(agentVoice, /let speechGeneration = 0/);
  assert.match(agentVoice, /const generation = \+\+speechGeneration/);
  assert.match(agentVoice, /generation !== speechGeneration/);
  assert.match(agentVoice, /speechGeneration \+= 1/);
  assert.match(agentVoice, /cancelNativeSpeech\(\)/);
  assert.match(agentVoice, /window\.speechSynthesis\?\.cancel\(\)/);
});

test("agent speech uses the free native device engine with clarity controls instead of PCM streaming", () => {
  assert.match(agentVoice, /new SpeechSynthesisUtterance\(nativeSpeechText\(text, locale\)\)/);
  assert.match(agentVoice, /utterance\.lang = locale/);
  assert.match(agentVoice, /utterance\.rate = profile\.rate/);
  assert.match(agentVoice, /utterance\.pitch = profile\.pitch/);
  assert.match(agentVoice, /utterance\.volume = 1/);
  assert.match(agentVoice, /window\.speechSynthesis\.speak\(utterance\)/);
  assert.doesNotMatch(agentVoice, /STREAM_SAMPLE_RATE|schedulePcmChunk|pcm16ToFloat32|hlc-agent-voice/);
});
