import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const agentDock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const agentVoice = readFileSync("src/lib/agentVoice.ts", "utf8");
const proactiveCss = readFileSync("src/styles/agent-proactive-briefing.css", "utf8");
const tutorialCss = readFileSync("src/styles/agent-tutorial.css", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");
const desktopContract = readFileSync("src/styles/desktop-shell-contract-v2.css", "utf8");
const readabilityContract = readFileSync("src/styles/global-readability-certification.css", "utf8");
const authenticatedStyles = readFileSync("src/styles/authenticated-entry.ts", "utf8");

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
  assert.match(agentVoice, /hlc\.agentVoicePreferences\.v4/);
  assert.match(agentDock, /hlc\.agentBriefing\.v2:/);
  assert.match(agentDock, /alreadyShown/);
  assert.match(agentDock, /if \(!briefingVisible \|\| !preferences\.enabled \|\| !preferences\.autoSpeak/);
  assert.match(proactiveCss, /@media \(max-width: 720px\)[\s\S]*max-height: min\(248px, 34vh\)/);
  assert.doesNotMatch(proactiveCss, /display: none !important/);
  assert.match(tutorialCss, /-webkit-text-size-adjust: 100%/);
  assert.match(tutorialCss, /max-height: min\(52dvh, 460px\) !important/);
});

test("mobile field-work navigation remains canonical while agent presentation stays contextual", () => {
  assert.match(navbar, /className="hlc-mobile-tabbar"/);
  assert.match(navbar, /label:\s*"Home",[\s\S]*?route:\s*"\/dashboard"/);
  assert.match(navbar, /label:\s*"Work",[\s\S]*?route:\s*"\/leads"/);
  assert.match(navbar, /label:\s*"Network",[\s\S]*?route:\s*"\/network"/);
  assert.match(navbar, /label:\s*"Community",[\s\S]*?route:\s*"\/community-hub"/);
  assert.match(navbar, /aria-label=\{mobileOpen \? "Close all HLC areas" : "Open all HLC areas"\}/);
  assert.match(navbar, /<span>More<\/span>/);
  assert.match(proactiveCss, /@media \(max-width: 720px\)/);
  assert.doesNotMatch(agentDock, /label: "Call"|label: "Text"|label: "Schedule"/);
  assert.doesNotMatch(appLayout, /MobileWorkDock/);
});

test("normal laptop widths keep desktop workspace navigation available with an explicit collapse control", () => {
  assert.match(appLayout, /SIDEBAR_COLLAPSED_KEY/);
  assert.match(appLayout, /sidebarCollapsed/);
  assert.match(appLayout, /hlc-desktop-sidebar-toggle/);
  assert.match(desktopContract, /@media \(min-width: 900px\)/);
  assert.match(desktopContract, /grid-template-columns: 300px minmax\(0, 1fr\) !important/);
  assert.match(desktopContract, /\.hlc-signed-in-shell > \.hlc-navbar[\s\S]*transform: none !important/);
  assert.match(desktopContract, /\.hlc-mobile-tabbar[\s\S]*display: none !important/);
  assert.match(desktopContract, /\.hlc-agent-proactive-briefing[\s\S]*display: none !important/);
  assert.match(desktopContract, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\) !important/);
  assert.match(readabilityContract, /hlc-sidebar-is-collapsed/);
  assert.match(readabilityContract, /grid-template-columns: 56px minmax\(0, 1fr\) !important/);
  assert.match(readabilityContract, /\.hlc-signed-in-shell > \.hlc-desktop-sidebar-toggle/);
  assert.match(authenticatedStyles, /workspace-route-cleanup\.css";\s*import "\.\/desktop-shell-contract-v2\.css";/);
  assert.match(authenticatedStyles, /global-readability-certification\.css/);
});
