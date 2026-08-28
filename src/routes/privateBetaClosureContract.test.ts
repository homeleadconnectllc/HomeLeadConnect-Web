import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const startHere = readFileSync(new URL("../pages/dashboard/StartHere.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles/mobile-a-plus-private-beta-closure.css", import.meta.url), "utf8");
const sidebarStyles = readFileSync(new URL("../styles/mobile-a-plus-sidebar-final-closure.css", import.meta.url), "utf8");
const drawerIsolation = readFileSync(new URL("../styles/mobile-a-plus-drawer-root-isolation.css", import.meta.url), "utf8");
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

test("private beta closure owns full-screen mobile drawer and background scroll", () => {
  assert.match(styles, /\.hlc-mobile-portal\s*\{/);
  assert.match(styles, /position:\s*fixed\s*!important/);
  assert.match(styles, /inset:\s*0\s*!important/);
  assert.match(styles, /height:\s*100dvh\s*!important/);
  assert.match(styles, /body:has\(\.hlc-mobile-portal\).*overflow:\s*hidden/s);
  assert.match(styles, /body:has\(\[role="dialog"\]\).*overflow:\s*hidden/s);
});

test("private beta closure guarantees readable dark fields and keyboard agent yielding", () => {
  assert.match(styles, /-webkit-text-fill-color:\s*#eef7ff/);
  assert.match(styles, /::placeholder/);
  assert.match(styles, /body\.hlc-keyboard-open \.hlc-agent-dock:not\(\.is-open\)/);
});

test("physical sidebar keeps one circular identity and one fixed non-overlapping close lane", () => {
  assert.match(sidebarStyles, /html:has\(body > \.hlc-mobile-portal\),[\s\S]*position:\s*fixed\s*!important/);
  assert.match(sidebarStyles, /body:has\(> \.hlc-mobile-portal\)[\s\S]*overflow:\s*hidden\s*!important/);
  assert.match(sidebarStyles, /\.hlc-mobile-drawer-close\s*\{[^}]*position:\s*fixed\s*!important/s);
  assert.match(sidebarStyles, /\.hlc-mobile-drawer-close\s*\{[^}]*right:\s*14px\s*!important/s);
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll::before\s*\{[^}]*border-radius:\s*50%\s*!important/s);
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll::before\s*\{[^}]*background-color:\s*#1355c8\s*!important/s);
  assert.match(sidebarStyles, /background-image:\s*url\("\/hlc-logo-transparent\.png"\)\s*!important/);
  assert.match(sidebarStyles, /\.hlc-mobile-command-search-trigger\s*\{[^}]*margin:\s*0 0 10px\s*!important/s);
});

test("physical sidebar makes the drawer the sole vertical scroll owner", () => {
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll\s*\{[^}]*position:\s*fixed\s*!important/s);
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll\s*\{[^}]*overflow-y:\s*scroll\s*!important/s);
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll\s*\{[^}]*touch-action:\s*pan-y\s*!important/s);
  assert.match(sidebarStyles, /body > \.hlc-mobile-portal ~ \.hlc-mobile-portal\s*\{[^}]*display:\s*none\s*!important/s);
  assert.match(sidebarStyles, /\.hlc-mobile-drawer-close ~ \.hlc-mobile-drawer-close\s*\{[^}]*display:\s*none\s*!important/s);
});

test("physical sidebar uses normal block flow and caps browser safe-area inflation", () => {
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll\s*\{[^}]*display:\s*block\s*!important/s);
  assert.match(sidebarStyles, /padding:\s*calc\(58px \+ min\(env\(safe-area-inset-top\), 10px\)\)/);
  assert.doesNotMatch(sidebarStyles, /justify-content:\s*flex-start\s*!important/);
  assert.doesNotMatch(sidebarStyles, /order:\s*20\s*!important/);
  assert.match(sidebarStyles, /\.hlc-mobile-view-controls-host\s*\{[^}]*margin:\s*0 0 10px\s*!important/s);
});

test("mobile drawer hides the entire underlying authenticated root while portal owns the viewport", () => {
  assert.match(drawerIsolation, /body:has\(> \.hlc-mobile-portal\) > #root\s*\{[^}]*visibility:\s*hidden\s*!important/s);
  assert.match(drawerIsolation, /body:has\(> \.hlc-mobile-portal\) > #root\s*\{[^}]*opacity:\s*0\s*!important/s);
  assert.match(drawerIsolation, /body > \.hlc-mobile-portal\s*\{[^}]*visibility:\s*visible\s*!important/s);
  const isolation = styleEntry.lastIndexOf('import "./mobile-a-plus-drawer-root-isolation.css"');
  const sidebar = styleEntry.lastIndexOf('import "./mobile-a-plus-sidebar-final-closure.css"');
  assert.ok(isolation > sidebar);
});

test("mobile drawer uses App Directory instead of leaking duplicate desktop navigation rows", () => {
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll \.hlc-navbar-groups\s*\{[^}]*display:\s*none\s*!important/s);
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll \.hlc-navbar-groups\s*\{[^}]*height:\s*0\s*!important/s);
  assert.match(startHere, /ecosystemNavigation/);
});

test("mobile view controls are inserted in natural DOM order directly before App Directory", () => {
  assert.match(viewControls, /hlc-mobile-view-controls-host/);
  assert.match(viewControls, /const quickActions = menu\.querySelector<HTMLElement>\("\.hlc-mobile-more-quick"\)/);
  assert.match(viewControls, /insertBefore\(host, quickActions\)/);
  assert.match(viewControls, />Mobile</);
  assert.match(viewControls, />Desktop</);
  assert.match(viewControls, /hlc-mobile-early-signout/);
  assert.match(viewControls, />Sign out</);
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll > \.hlc-nav-logout\s*\{[\s\S]*display:\s*none\s*!important/);
});

test("physical agent composer keeps dark readable ink on its white input", () => {
  assert.match(sidebarStyles, /#root \.hlc-ai-composer textarea/);
  assert.match(sidebarStyles, /color:\s*#0f172a\s*!important/);
  assert.match(sidebarStyles, /-webkit-text-fill-color:\s*#0f172a\s*!important/);
});

test("agent chat cannot remain in Thinking indefinitely on a stalled client request", () => {
  assert.match(agentChat, /CLIENT_AGENT_TIMEOUT_MS\s*=\s*16_000/);
  assert.match(agentChat, /Promise\.race/);
  assert.match(agentChat, /HLC_AGENT_CLIENT_TIMEOUT/);
  assert.match(agentChat, /hlc-client-timeout-fallback/);
  assert.match(agentChat, /getLocalizedAgentFallback\(agentId, locale\)/);
});

test("sidebar closure is the last authenticated mobile authority", () => {
  const sidebar = styleEntry.lastIndexOf('import "./mobile-a-plus-sidebar-final-closure.css"');
  const closure = styleEntry.lastIndexOf('import "./mobile-a-plus-private-beta-closure.css"');
  assert.ok(sidebar > closure);
});
