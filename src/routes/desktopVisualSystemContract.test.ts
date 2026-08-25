import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const desktopSystem = readFileSync(new URL("../styles/desktop-visual-system.css", import.meta.url), "utf8");
const agentRail = readFileSync(new URL("../styles/desktop-agent-team-rail.css", import.meta.url), "utf8");
const dataWorkspaces = readFileSync(new URL("../styles/desktop-data-workspaces.css", import.meta.url), "utf8");
const archetypes = readFileSync(new URL("../styles/desktop-page-archetypes.css", import.meta.url), "utf8");
const shellRecovery = readFileSync(new URL("../styles/desktop-shell-recovery.css", import.meta.url), "utf8");

const desktopLayers = [desktopSystem, agentRail, dataWorkspaces, archetypes, shellRecovery];

// Desktop authority may use nested upper bounds such as 1240px to tune smaller
// Mac screens, but it must never introduce a breakpoint that reaches the
// protected phone/tablet range at 1024px or below.
const protectedMobileMaxWidth = /@media\s*\([^)]*max-width:\s*(?:[1-9]\d{0,2}|10(?:0\d|1\d|2[0-4]))px[^)]*\)/i;

test("desktop visual-system layers load after launch/mobile authorities", () => {
  const desktopSystemIndex = authenticatedStyles.indexOf("desktop-visual-system.css");
  const agentRailIndex = authenticatedStyles.indexOf("desktop-agent-team-rail.css");
  const dataWorkspaceIndex = authenticatedStyles.indexOf("desktop-data-workspaces.css");
  const archetypeIndex = authenticatedStyles.indexOf("desktop-page-archetypes.css");
  const shellRecoveryIndex = authenticatedStyles.indexOf("desktop-shell-recovery.css");

  assert.ok(desktopSystemIndex > authenticatedStyles.indexOf("final-visual-punch.css"));
  assert.ok(agentRailIndex > desktopSystemIndex);
  assert.ok(dataWorkspaceIndex > agentRailIndex);
  assert.ok(archetypeIndex > dataWorkspaceIndex);
  assert.ok(shellRecoveryIndex > archetypeIndex);
});

test("post-launch Mac authority stays isolated from protected mobile/tablet viewports", () => {
  for (const css of desktopLayers) {
    assert.match(css, /@media\s*\(min-width:\s*1025px\)/i);
    assert.doesNotMatch(css, protectedMobileMaxWidth);
  }
});

test("desktop shell reserves navigation and working-canvas space instead of overlaying records", () => {
  assert.match(desktopSystem, /--hlc-desktop-sidebar-width:\s*288px/);
  assert.match(desktopSystem, /margin-left:\s*var\(--hlc-desktop-sidebar-width\)/);
  assert.match(desktopSystem, /\.hlc-mobile-tabbar[\s\S]*display:\s*none\s*!important/);
  assert.match(shellRecovery, /> nav\.hlc-navbar[\s\S]*width:\s*288px\s*!important/);
  assert.match(shellRecovery, /> \.hlc-route-content[\s\S]*margin:\s*0 0 0 288px\s*!important/);
  assert.match(shellRecovery, /\.hlc-navbar-links\.hlc-desktop-navigation[\s\S]*position:\s*static\s*!important/);
  assert.match(shellRecovery, /pointer-events:\s*auto\s*!important/);
});

test("desktop HLC AI team parity keeps all three agents discoverable without replacing contextual intelligence", () => {
  assert.match(agentRail, /\.hlc-desktop-agent-team/);
  assert.match(agentRail, /\.hlc-desktop-agent-team-link/);
  assert.match(agentRail, /\.hlc-agent-open/);
  assert.match(shellRecovery, /body\.hlc-agent-open/);
});

test("desktop archetypes cover major Mac workspace families", () => {
  assert.match(archetypes, /\.hlc-messages-workspace/);
  assert.match(archetypes, /\.hlc-calendar-workspace/);
  assert.match(archetypes, /\.hlc-community-workspace/);
  assert.match(archetypes, /\.hlc-portal-workspace/);
  assert.match(archetypes, /\.hlc-page-manual-communications/);
  assert.match(archetypes, /\.hlc-page-documents/);
  assert.match(archetypes, /\.hlc-page-settings/);
});
