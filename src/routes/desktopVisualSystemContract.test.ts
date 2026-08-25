import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const desktopSystem = readFileSync(new URL("../styles/desktop-visual-system.css", import.meta.url), "utf8");
const agentRail = readFileSync(new URL("../styles/desktop-agent-team-rail.css", import.meta.url), "utf8");
const dataWorkspaces = readFileSync(new URL("../styles/desktop-data-workspaces.css", import.meta.url), "utf8");
const archetypes = readFileSync(new URL("../styles/desktop-page-archetypes.css", import.meta.url), "utf8");

const desktopLayers = [desktopSystem, agentRail, dataWorkspaces, archetypes];

test("desktop visual-system layers load after launch/mobile authorities", () => {
  const desktopSystemIndex = authenticatedStyles.indexOf("desktop-visual-system.css");
  const agentRailIndex = authenticatedStyles.indexOf("desktop-agent-team-rail.css");
  const dataWorkspaceIndex = authenticatedStyles.indexOf("desktop-data-workspaces.css");
  const archetypeIndex = authenticatedStyles.indexOf("desktop-page-archetypes.css");

  assert.ok(desktopSystemIndex > authenticatedStyles.indexOf("final-visual-punch.css"));
  assert.ok(agentRailIndex > desktopSystemIndex);
  assert.ok(dataWorkspaceIndex > agentRailIndex);
  assert.ok(archetypeIndex > dataWorkspaceIndex);
});

test("post-launch Mac authority stays isolated to desktop viewports", () => {
  for (const css of desktopLayers) {
    assert.match(css, /@media\s*\(min-width:\s*1025px\)/i);
    assert.doesNotMatch(css, /@media\s*\(max-width:/i);
  }
});

test("desktop shell reserves navigation and working-canvas space instead of overlaying records", () => {
  assert.match(desktopSystem, /--hlc-desktop-sidebar-width:\s*288px/);
  assert.match(desktopSystem, /margin-left:\s*var\(--hlc-desktop-sidebar-width\)/);
  assert.match(desktopSystem, /\.hlc-mobile-tabbar[\s\S]*display:\s*none\s*!important/);
});

test("desktop HLC AI team parity keeps all three agents discoverable without replacing contextual intelligence", () => {
  assert.match(agentRail, /\.hlc-desktop-agent-team/);
  assert.match(agentRail, /\.hlc-desktop-agent-team-link/);
  assert.match(agentRail, /\.hlc-agent-open/);
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
