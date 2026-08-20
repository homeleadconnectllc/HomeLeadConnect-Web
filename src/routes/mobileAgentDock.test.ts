import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const dockCss = readFileSync("src/styles/contextual-agent-dock.css", "utf8");
const widthContract = readFileSync("src/styles/agent-panel-width-contract.css", "utf8");
const commandCenter = readFileSync("src/styles/command-center-experience.css", "utf8");
const finalReleaseGuard = readFileSync("src/styles/final-release-guard.css", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8") + readFileSync("src/styles/app-shell-entry.ts", "utf8").replaceAll('import "./', 'import "./styles/');
const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const mobileReleaseFix = readFileSync("src/styles/mobile-release-fix.css", "utf8");
const mobileAgentPlacement = readFileSync("src/styles/mobile-agent-placement-contract.css", "utf8");
const tutorialDock = readFileSync("src/components/tutorials/LiveTutorialDock.tsx", "utf8");
const agentChatPanel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");
const agentPremium = readFileSync("src/styles/agent-premium-v2.css", "utf8");

test("mobile contextual AI uses one compact route-resolved avatar above the work dock", () => {
  assert.match(dock, /const agent = useMemo\(\(\) => resolveAgent\(location\.pathname, access\)/);
  assert.match(dock, /data-agent=\{agent\.id\}/);
  assert.match(dock, /aria-label=\{`\$\{open \? "Close" : "Open"\} \$\{agent\.name\} tab tutorial and assistant`\}/);
  assert.match(dock, /className="hlc-agent-panel-avatar"/);
  assert.match(dockCss, /bottom: calc\(154px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(dockCss, /\.hlc-agent-greeting \{ display: none; \}/);
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock:not\(\.is-open\) \{[\s\S]*width: 54px !important;[\s\S]*max-width: 54px !important;/);
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock:not\(\.is-open\) \.hlc-agent-dock-trigger \{[\s\S]*width: 52px !important;[\s\S]*min-width: 52px !important;/);
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock:not\(\.is-open\) \.hlc-agent-dock-trigger > span \{[\s\S]*display: none !important;/);
});

test("closed mobile agent rail cannot constrain the open viewport agent", () => {
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock:not\(\.is-open\) \{[\s\S]*width: 54px !important;[\s\S]*max-width: 54px !important;/);
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock\.is-open \{[\s\S]*inset: 0 !important;[\s\S]*width: 100vw !important;[\s\S]*max-width: none !important;/);
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock\.is-open \.hlc-agent-dock-panel \{[\s\S]*left: 0 !important;[\s\S]*right: 0 !important;[\s\S]*width: 100vw !important;/);
});

test("agent width contract provides a full mobile sheet and a wide desktop command panel", () => {
  assert.match(authenticatedEntry, /import "\.\/agent-panel-width-contract\.css";/);
  assert.match(authenticatedEntry, /import "\.\/command-center-experience\.css";/);
  assert.match(widthContract, /@media \(min-width: 721px\)[\s\S]*\.hlc-agent-dock\.is-open \{[\s\S]*width: min\(720px, calc\(100vw - 48px\)\)/);
  assert.match(widthContract, /\.hlc-agent-dock\.is-open \.hlc-agent-dock-panel \{[\s\S]*min-width: min\(560px, calc\(100vw - 48px\)\)/);
  assert.match(widthContract, /@media \(max-width: 720px\)[\s\S]*\.hlc-agent-dock\.is-open \{[\s\S]*width: 100vw !important;[\s\S]*min-width: 100vw !important;[\s\S]*max-width: none !important;/);
  assert.match(widthContract, /\.hlc-agent-dock\.is-open \.hlc-agent-dock-panel \{[\s\S]*right: 0 !important;[\s\S]*bottom: 0 !important;[\s\S]*left: 0 !important;[\s\S]*width: 100vw !important;[\s\S]*min-width: 100vw !important;[\s\S]*max-width: none !important;/);
  assert.match(commandCenter, /grid-template-columns:\s*minmax\(180px,\s*220px\)\s*minmax\(0,\s*1fr\)/);
  assert.match(commandCenter, /grid-template-areas:\s*"head head"\s*"context chat"/);
});

test("production mobile overlays are exclusive, viewport-safe, and HLC blue", () => {
  assert.match(mainEntry, /import "\.\/styles\/mobile-release-fix\.css";/);
  assert.match(dock, /document\.body\.classList\.toggle\("hlc-agent-open", open\)/);
  assert.match(tutorialDock, /document\.body\.classList\.toggle\("hlc-tutorial-open", open\)/);
  assert.match(tutorialDock, /aria-modal="true"/);
  assert.match(mobileReleaseFix, /body\.hlc-tutorial-open \.hlc-agent-dock/);
  assert.match(mobileReleaseFix, /body\.hlc-agent-open \.hlc-work-dock/);
  assert.match(mobileReleaseFix, /\.hlc-agent-dock\.is-open \.hlc-agent-dock-trigger \{[\s\S]*display: none !important;/);
  assert.match(mobileReleaseFix, /--chat-agent-accent: #3b82f6 !important;/);
  assert.match(mobileReleaseFix, /\.hlc-agent-dock\.is-open textarea \{[\s\S]*background: #fff !important;[\s\S]*color: #0f172a !important;/);
});

test("mobile agent voice controls remain readable and dictated questions submit immediately", () => {
  assert.match(agentPremium, /\.hlc-ai-settings\[open\] > div \{[\s\S]*position: fixed/);
  assert.match(agentPremium, /right: 16px;[\s\S]*left: 16px;/);
  assert.match(agentPremium, /grid-template-columns: 24px minmax\(0, 1fr\)/);
  assert.match(agentChatPanel, /void sendMessage\(transcript\)/);
  assert.match(agentChatPanel, /Voice input could not start/);
});

test("mobile authentication uses one clean card with Safari-safe bottom space", () => {
  assert.match(mobileReleaseFix, /\.hlc-auth-brand \{[\s\S]*display: none !important;/);
  assert.match(mobileReleaseFix, /padding: 0 0 calc\(132px \+ env\(safe-area-inset-bottom\)\) !important;/);
  assert.match(mobileReleaseFix, /\.hlc-auth-card > :is\(\.hlc-auth-card-brand, h2, \.hlc-auth-card-description\)/);
  assert.match(mobileReleaseFix, /\.hlc-auth-form iframe/);
});

test("full coach and live briefing keep separate bounded mobile placement contracts", () => {
  assert.match(authenticatedEntry, /mobile-agent-placement-contract\.css/);
  assert.match(mobileAgentPlacement, /@media \(max-width: 720px\)/);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \{[\s\S]*inset: 0 !important;[\s\S]*height: 100dvh !important;/);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-agent-dock-panel \{[\s\S]*top: auto !important;[\s\S]*right: max\(10px, env\(safe-area-inset-right\)\) !important;[\s\S]*bottom: max\(12px, env\(safe-area-inset-bottom\)\) !important;[\s\S]*left: max\(10px, env\(safe-area-inset-left\)\) !important;[\s\S]*height: auto !important;[\s\S]*max-height: min\(86dvh, 760px\) !important;/);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-chat \{[\s\S]*flex: 1 1 auto !important;[\s\S]*min-height: 0 !important;[\s\S]*padding-bottom: 8px !important;/);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-transcript \{[\s\S]*flex: 1 1 auto !important;[\s\S]*min-height: 84px !important;[\s\S]*max-height: none !important;[\s\S]*overflow-y: auto !important;/);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-transcript:empty \{[\s\S]*flex: 0 0 12px !important;[\s\S]*max-height: 12px !important;/);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-composer \{[\s\S]*position: sticky !important;[\s\S]*inset-block-end: 0 !important;[\s\S]*margin-top: 0 !important;/);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.has-briefing:not\(\.is-open\) \.hlc-agent-proactive-briefing \{[\s\S]*top: auto !important;[\s\S]*bottom: calc\(154px \+ env\(safe-area-inset-bottom\)\) !important;[\s\S]*max-height: min\(210px, 28dvh\) !important;/);
  assert.doesNotMatch(mobileAgentPlacement, /\.hlc-agent-dock\.is-open \.hlc-agent-dock-panel/);
});

test("Kendrell, Dion, and Diamond share the same full mobile workspace contract", () => {
  assert.match(dock, /kendrell: \{ id: "kendrell"/);
  assert.match(dock, /dion: \{ id: "dion"/);
  assert.match(dock, /diamond: \{ id: "diamond"/);
  assert.match(dock, /data-agent=\{agent\.id\}/);
  assert.doesNotMatch(mobileAgentPlacement, /\[data-agent=(?:"|')?(?:kendrell|dion|diamond)/i);
  assert.match(mobileAgentPlacement, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-agent-dock-panel/);
});
