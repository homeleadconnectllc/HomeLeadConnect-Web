import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const dockCss = readFileSync("src/styles/contextual-agent-dock.css", "utf8");
const widthContract = readFileSync("src/styles/agent-panel-width-contract.css", "utf8");
const commandCenter = readFileSync("src/styles/command-center-experience.css", "utf8");
const finalDevice = readFileSync("src/styles/mobile-a-plus-final-device-corrections.css", "utf8");
const appShellEntry = readFileSync("src/styles/app-shell-entry.ts", "utf8");
const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const mobileAgentPlacement = readFileSync("src/styles/mobile-agent-placement-contract.css", "utf8");
const tutorialDock = readFileSync("src/components/tutorials/LiveTutorialDock.tsx", "utf8");
const agentChatPanel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");
const agentPremium = readFileSync("src/styles/agent-premium-v2.css", "utf8");

test("mobile contextual AI uses one route-resolved avatar with a 60px structural hit target", () => {
  assert.match(dock, /const agent = useMemo\(\(\) => resolveAgent\(location\.pathname, access\)/);
  assert.match(dock, /data-agent=\{agent\.id\}/);
  assert.match(dock, /className="hlc-agent-panel-avatar"/);
  assert.match(dockCss, /\.hlc-agent-greeting \{ display: none; \}/);
  assert.match(finalDevice, /\.hlc-agent-dock:not\(\.is-open\)/);
  assert.match(finalDevice, /width:60px!important/);
  assert.match(finalDevice, /height:60px!important/);
  assert.match(finalDevice, /max-width:60px!important/);
  assert.match(finalDevice, /\.hlc-agent-dock-trigger > span[\s\S]*display:none!important/);
});

test("open mobile agent uses viewport geometry without depending on the release guard", () => {
  assert.match(finalDevice, /\.hlc-agent-dock\.is-open/);
  assert.match(finalDevice, /width:var\(--hlc-visual-viewport-width,100vw\)!important/);
  assert.match(finalDevice, /height:var\(--hlc-visual-viewport-height,100dvh\)!important/);
  assert.match(finalDevice, /max-width:none!important/);
  assert.match(finalDevice, /\.hlc-agent-dock\.is-open \.hlc-agent-dock-panel/);
  assert.doesNotMatch(appShellEntry, /mobile-release-fix\.css/);
});

test("agent width contract still provides desktop and mobile panel geometry", () => {
  assert.match(authenticatedEntry, /import "\.\/agent-panel-width-contract\.css";/);
  assert.match(authenticatedEntry, /import "\.\/command-center-experience\.css";/);
  assert.match(widthContract, /@media \(min-width: 721px\)/);
  assert.match(widthContract, /width: min\(720px, calc\(100vw - 48px\)\)/);
  assert.match(widthContract, /@media \(max-width: 720px\)/);
  assert.match(widthContract, /width: 100vw !important/);
  assert.match(commandCenter, /grid-template-columns:/);
});

test("mobile overlay state remains functional without retired release-theme CSS", () => {
  assert.match(dock, /document\.body\.classList\.toggle\("hlc-agent-open", open\)/);
  assert.match(tutorialDock, /document\.body\.classList\.toggle\("hlc-tutorial-open", open\)/);
  assert.match(tutorialDock, /aria-modal="true"/);
  assert.match(finalDevice, /body\.hlc-agent-open \.hlc-mobile-tabbar/);
  assert.match(finalDevice, /body\.hlc-keyboard-open \.hlc-agent-dock:not\(\.is-open\)/);
  assert.doesNotMatch(appShellEntry, /mobile-release-fix\.css/);
});

test("mobile agent voice controls remain readable and dictated questions submit immediately", () => {
  assert.match(agentPremium, /\.hlc-ai-settings\[open\] > div \{/);
  assert.match(agentChatPanel, /void sendMessage\(transcript\)/);
  assert.match(agentChatPanel, /Voice input could not start/);
});

test("full coach and live briefing keep separate bounded mobile placement contracts", () => {
  assert.match(authenticatedEntry, /mobile-agent-placement-contract\.css/);
  assert.match(mobileAgentPlacement, /@media \(max-width: 720px\)/);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\)/);
  assert.match(mobileAgentPlacement, /height: 100dvh !important/);
  assert.match(mobileAgentPlacement, /\.hlc-ai-transcript/);
  assert.match(mobileAgentPlacement, /overflow-y: auto !important/);
});

test("Kendrell, Dion, and Diamond share the same mobile workspace contract", () => {
  assert.match(dock, /kendrell: \{ id: "kendrell"/);
  assert.match(dock, /dion: \{ id: "dion"/);
  assert.match(dock, /diamond: \{ id: "diamond"/);
  assert.match(dock, /data-agent=\{agent\.id\}/);
  assert.doesNotMatch(mobileAgentPlacement, /\[data-agent=(?:"|')?(?:kendrell|dion|diamond)/i);
});
