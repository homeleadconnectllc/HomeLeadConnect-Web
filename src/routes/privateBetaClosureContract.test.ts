import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const startHere = readFileSync(new URL("../pages/dashboard/StartHere.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles/mobile-a-plus-private-beta-closure.css", import.meta.url), "utf8");
const drawerStyles = readFileSync(new URL("../styles/mobile-command-menu-rebuild-20260905.css", import.meta.url), "utf8");
const navbar = readFileSync(new URL("../components/Navbar.tsx", import.meta.url), "utf8");
const viewControls = readFileSync(new URL("../components/MobileViewControls.tsx", import.meta.url), "utf8");
const agentChat = readFileSync(new URL("../api/agentChat.ts", import.meta.url), "utf8");
const styleEntry = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");

test("Start Here is a searchable role-aware HLC App Directory", () => {
  assert.match(startHere, /HOMELEAD CONNECT · APP DIRECTORY/);
  assert.match(startHere, /Find anything in HLC/);
  assert.match(startHere, /Search work, people, tools or settings/);
  assert.match(startHere, /canAccessWorkspacePath/);
  assert.match(startHere, /ecosystemNavigation/);
});

test("private beta closure no longer owns retired mobile portal or drawer paint", () => {
  assert.doesNotMatch(styles, /\.hlc-mobile-portal/);
  assert.doesNotMatch(styles, /\.hlc-mobile-drawer-close/);
  assert.match(styles, /body:has\(\[role="dialog"\]\).*overflow:\s*hidden/s);
  assert.match(drawerStyles, /body > \.hlc-drawer-v2\s*\{/);
});

test("private beta closure guarantees readable dark fields and keyboard agent yielding", () => {
  assert.match(styles, /-webkit-text-fill-color:\s*#eef7ff/);
  assert.match(styles, /::placeholder/);
  assert.match(styles, /body\.hlc-keyboard-open \.hlc-agent-dock:not\(\.is-open\)/);
});

test("current mobile command drawer owns the viewport with one scroll surface", () => {
  assert.match(drawerStyles, /body > \.hlc-drawer-v2\s*\{[^}]*position:\s*fixed\s*!important/s);
  assert.match(drawerStyles, /body > \.hlc-drawer-v2\s*\{[^}]*inset:\s*0\s*!important/s);
  assert.match(drawerStyles, /body > \.hlc-drawer-v2\s*\{[^}]*height:\s*100dvh\s*!important/s);
  assert.match(drawerStyles, /\.hlc-drawer-v2-scroll\s*\{[^}]*overflow-y:\s*auto\s*!important/s);
  assert.match(drawerStyles, /\.hlc-drawer-v2-close\s*\{[^}]*min-height:\s*40px\s*!important/s);
});

test("current mobile drawer is rendered as the only portal command surface", () => {
  assert.match(navbar, /createPortal/);
  assert.match(navbar, /hlc-drawer-v2 hlc-mobile-command-sheet/);
  assert.match(navbar, /role="dialog"/);
  assert.match(navbar, /aria-modal="true"/);
  assert.match(navbar, /document\.body/);
  assert.doesNotMatch(styleEntry, /mobile-a-plus-sidebar-final-closure\.css/);
  assert.doesNotMatch(styleEntry, /mobile-a-plus-drawer-root-isolation\.css/);
  assert.doesNotMatch(styleEntry, /mobile-command-sheet-source-authority\.css/);
  assert.doesNotMatch(styleEntry, /version-a-mobile-drawer-premium-rollout-20260904\.css/);
});

test("mobile drawer uses App Directory links instead of duplicate desktop navigation groups", () => {
  assert.match(drawerStyles, /\.hlc-mobile-more-quick/);
  assert.match(navbar, /App Directory/);
  assert.match(startHere, /ecosystemNavigation/);
});

test("mobile view controls target the current command menu natural order", () => {
  assert.match(viewControls, /hlc-mobile-view-controls-host/);
  assert.match(viewControls, /const quickActions = menu\.querySelector<HTMLElement>\("\.hlc-mobile-more-quick"\)/);
  assert.match(viewControls, /insertBefore\(host, quickActions\)/);
  assert.match(viewControls, />Mobile</);
  assert.match(viewControls, />Desktop</);
  assert.match(viewControls, /hlc-mobile-early-signout/);
});

test("current command menu is the authenticated mobile drawer authority", () => {
  const current = styleEntry.lastIndexOf('import "./mobile-command-menu-rebuild-20260905.css"');
  assert.ok(current >= 0);
});

test("agent chat cannot remain in Thinking indefinitely on a stalled client request", () => {
  assert.match(agentChat, /CLIENT_AGENT_TIMEOUT_MS\s*=\s*16_000/);
  assert.match(agentChat, /Promise\.race/);
  assert.match(agentChat, /HLC_AGENT_CLIENT_TIMEOUT/);
  assert.match(agentChat, /hlc-client-timeout-fallback/);
  assert.match(agentChat, /getLocalizedAgentFallback\(agentId, locale\)/);
});

test("current command menu remains the active authenticated mobile drawer authority", () => {
  const current = styleEntry.lastIndexOf('import "./mobile-command-menu-rebuild-20260905.css"');
  assert.ok(current >= 0);
  assert.doesNotMatch(styleEntry, /mobile-a-plus-sidebar-final-closure\.css/);
});
