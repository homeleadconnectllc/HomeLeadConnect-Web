import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const startHere = readFileSync(new URL("../pages/dashboard/StartHere.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles/mobile-a-plus-private-beta-closure.css", import.meta.url), "utf8");
const sidebarStyles = readFileSync(new URL("../styles/mobile-a-plus-sidebar-final-closure.css", import.meta.url), "utf8");
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

test("physical sidebar uses corner identity instead of a full-width masthead", () => {
  assert.match(sidebarStyles, /body:has\(\.hlc-mobile-portal\) #root \.hlc-navbar/);
  assert.match(sidebarStyles, /\.hlc-mobile-drawer-close\s*\{[\s\S]*position:\s*fixed\s*!important/);
  assert.match(sidebarStyles, /\.hlc-mobile-drawer-close\s*\{[\s\S]*right:\s*14px\s*!important/);
  assert.match(sidebarStyles, /\.hlc-mobile-portal-scroll::before\s*\{[\s\S]*hlc-logo-transparent\.png/);
  assert.match(sidebarStyles, /\.hlc-mobile-menu-heading\s*\{[\s\S]*display:\s*none\s*!important/);
  assert.doesNotMatch(sidebarStyles, /\.hlc-mobile-drawer-close\s*\{[\s\S]*width:\s*100%\s*!important/);
  assert.match(sidebarStyles, /touch-action:\s*pan-y/);
});

test("mobile view controls keep sign out reachable before long navigation groups", () => {
  assert.match(viewControls, /hlc-mobile-view-controls-host/);
  assert.match(viewControls, /insertBefore\(host, groups\)/);
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
