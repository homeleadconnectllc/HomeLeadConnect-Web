import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const agentDock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const agentVoice = readFileSync("src/lib/agentVoice.ts", "utf8");
const proactiveCss = readFileSync("src/styles/agent-proactive-briefing.css", "utf8");
const tutorialCss = readFileSync("src/styles/agent-tutorial.css", "utf8");
const mobileDock = readFileSync("src/components/mobile/MobileWorkDock.tsx", "utf8");
const mobileDockCss = readFileSync("src/styles/mobile-work-dock.css", "utf8");

test("agents proactively brief users from verified HLC context without waiting for a prompt", () => {
  assert.match(agentDock, /chatWithAgent\(/);
  assert.match(agentDock, /Open this HLC page proactively/);
  assert.match(agentDock, /what needs attention now/);
  assert.match(agentDock, /single best next action/);
  assert.match(agentDock, /hlc-agent-proactive-briefing/);
  assert.match(agentDock, /sessionStorage/);
});

test("mobile receives one compact session greeting while agent voice remains explicit opt-in", () => {
  assert.match(agentVoice, /return \{ enabled: false, autoSpeak: false \}/);
  assert.match(agentVoice, /hlc\.agentVoicePreferences\.v3/);
  assert.match(agentDock, /hlc\.agentBriefing\.v2:/);
  assert.match(agentDock, /alreadyShown/);
  assert.match(agentDock, /if \(!briefingVisible \|\| !preferences\.enabled \|\| !preferences\.autoSpeak/);
  assert.match(proactiveCss, /@media \(max-width: 720px\)[\s\S]*max-height: min\(248px, 34vh\)/);
  assert.doesNotMatch(proactiveCss, /display: none !important/);
  assert.match(tutorialCss, /-webkit-text-size-adjust: 100%/);
  assert.match(tutorialCss, /max-height: min\(52dvh, 460px\) !important/);
});

test("mobile retains its field-work operational controls independently of desktop agent presentation", () => {
  assert.match(mobileDock, /label: "Call"/);
  assert.match(mobileDock, /label: "Text"/);
  assert.match(mobileDock, /label: "Schedule"/);
  assert.match(mobileDock, /label: "Follow Up"/);
  assert.match(mobileDock, /label: "Voice Note"/);
  assert.match(mobileDockCss, /@media \(max-width: 720px\)/);
  assert.match(proactiveCss, /@media \(max-width: 720px\)/);
  assert.doesNotMatch(agentDock, /label: "Call"|label: "Text"|label: "Schedule"/);
});
