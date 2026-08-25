import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const desktopSystem = readFileSync(new URL("../styles/desktop-visual-system.css", import.meta.url), "utf8");
const agentRail = readFileSync(new URL("../styles/desktop-agent-team-rail.css", import.meta.url), "utf8");
const dataWorkspaces = readFileSync(new URL("../styles/desktop-data-workspaces.css", import.meta.url), "utf8");
const archetypes = readFileSync(new URL("../styles/desktop-page-archetypes.css", import.meta.url), "utf8");
const shellRecovery = readFileSync(new URL("../styles/desktop-shell-recovery.css", import.meta.url), "utf8");
const coreWorkspaces = readFileSync(new URL("../styles/desktop-core-workspaces.css", import.meta.url), "utf8");
const workflowComms = readFileSync(new URL("../styles/desktop-workflow-communications.css", import.meta.url), "utf8");
const discoveryCommunity = readFileSync(new URL("../styles/desktop-discovery-community.css", import.meta.url), "utf8");
const accountPortalsAgents = readFileSync(new URL("../styles/desktop-account-portals-agents.css", import.meta.url), "utf8");
const finalPolish = readFileSync(new URL("../styles/authenticated-final-polish.css", import.meta.url), "utf8");
const publicPolish = readFileSync(new URL("../styles/public-final-flat-authority.css", import.meta.url), "utf8");
const appLayout = readFileSync(new URL("./AppLayout.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

const desktopLayers = [
  desktopSystem,
  agentRail,
  dataWorkspaces,
  archetypes,
  shellRecovery,
  coreWorkspaces,
  workflowComms,
  discoveryCommunity,
  accountPortalsAgents,
];

const protectedMobileMaxWidth = /@media\s*\([^)]*max-width:\s*(?:[1-9]\d{0,2}|10(?:0\d|1\d|2[0-4]))px[^)]*\)/i;

test("desktop visual-system layers load after launch/mobile authorities", () => {
  const desktopSystemIndex = authenticatedStyles.indexOf("desktop-visual-system.css");
  const agentRailIndex = authenticatedStyles.indexOf("desktop-agent-team-rail.css");
  const dataWorkspaceIndex = authenticatedStyles.indexOf("desktop-data-workspaces.css");
  const archetypeIndex = authenticatedStyles.indexOf("desktop-page-archetypes.css");
  const shellRecoveryIndex = authenticatedStyles.indexOf("desktop-shell-recovery.css");
  const coreWorkspacesIndex = authenticatedStyles.indexOf("desktop-core-workspaces.css");
  const workflowCommsIndex = authenticatedStyles.indexOf("desktop-workflow-communications.css");
  const discoveryCommunityIndex = authenticatedStyles.indexOf("desktop-discovery-community.css");
  const accountPortalsAgentsIndex = authenticatedStyles.indexOf("desktop-account-portals-agents.css");
  const finalPolishIndex = authenticatedStyles.indexOf("authenticated-final-polish.css");

  assert.ok(desktopSystemIndex > authenticatedStyles.indexOf("final-visual-punch.css"));
  assert.ok(agentRailIndex > desktopSystemIndex);
  assert.ok(dataWorkspaceIndex > agentRailIndex);
  assert.ok(archetypeIndex > dataWorkspaceIndex);
  assert.ok(shellRecoveryIndex > archetypeIndex);
  assert.ok(coreWorkspacesIndex > shellRecoveryIndex);
  assert.ok(workflowCommsIndex > coreWorkspacesIndex);
  assert.ok(discoveryCommunityIndex > workflowCommsIndex);
  assert.ok(accountPortalsAgentsIndex > discoveryCommunityIndex);
  assert.ok(finalPolishIndex > accountPortalsAgentsIndex);
});

test("post-launch Mac authority stays isolated from protected mobile/tablet viewports", () => {
  for (const css of desktopLayers) {
    assert.match(css, /@media\s*\(min-width:\s*1025px\)/i);
    assert.doesNotMatch(css, protectedMobileMaxWidth);
  }
});

test("desktop shell reserves navigation and returns the full canvas when collapsed", () => {
  assert.match(shellRecovery, /--hlc-desktop-sidebar-width:\s*252px/);
  assert.match(shellRecovery, /--hlc-desktop-sidebar-collapsed-width:\s*0px/);
  assert.match(shellRecovery, /> nav\.hlc-navbar[\s\S]*width:\s*var\(--hlc-desktop-sidebar-width\)\s*!important/);
  assert.match(shellRecovery, /hlc-sidebar-is-collapsed[\s\S]*width:\s*0\s*!important/);
  assert.match(shellRecovery, /hlc-sidebar-is-collapsed > \.hlc-route-content[\s\S]*margin-left:\s*0\s*!important/);
  assert.match(shellRecovery, /\.hlc-navbar-links\.hlc-desktop-navigation[\s\S]*position:\s*static\s*!important/);
  assert.match(shellRecovery, /pointer-events:\s*auto\s*!important/);
  assert.match(desktopSystem, /\.hlc-mobile-tabbar[\s\S]*display:\s*none\s*!important/);
});

test("desktop brand is centered above the page instead of riding inside the sidebar", () => {
  assert.match(appLayout, /hlc-desktop-page-brand/);
  assert.match(shellRecovery, /\.hlc-navbar-brand[\s\S]*display:\s*none\s*!important/);
  assert.match(shellRecovery, /\.hlc-desktop-page-brand[\s\S]*left:\s*50%\s*!important/);
  assert.match(shellRecovery, /transform:\s*translateX\(-50%\)\s*!important/);
});

test("desktop sidebar exposes an obvious mid-edge collapse handle", () => {
  assert.match(shellRecovery, /\.hlc-desktop-sidebar-toggle[\s\S]*top:\s*50%\s*!important/);
  assert.match(shellRecovery, /height:\s*86px\s*!important/);
  assert.match(shellRecovery, /cursor:\s*pointer\s*!important/);
});

test("dashboard agent status does not cover agent photography", () => {
  assert.match(shellRecovery, /\.hlc-agent-portrait-wrap \.hlc-agent-status[\s\S]*display:\s*none\s*!important/);
  assert.match(shellRecovery, /\.hlc-agent-role::after[\s\S]*Online/);
});

test("signed-in routes share the final dark readable form and alert contract", () => {
  assert.match(finalPolish, /#07111f/);
  assert.match(finalPolish, /text-align:\s*center\s*!important/);
  assert.match(finalPolish, /textarea[\s\S]*text-align:\s*left\s*!important/);
  assert.match(finalPolish, /role="alert"|\[role="alert"\]/);
  assert.match(finalPolish, /rgba\(248,\s*113,\s*113/);
});

test("public and trial surfaces load one final flat dark authority", () => {
  assert.match(app, /public-final-flat-authority\.css/);
  assert.match(publicPolish, /\.hlc-public-card[\s\S]*border-radius:\s*0\s*!important/);
  assert.match(publicPolish, /\.hlc-auth-card[\s\S]*background:\s*transparent\s*!important/);
  assert.match(publicPolish, /hlc-page-about[\s\S]*Kendrell_Locked_HLC\.png/);
  assert.match(publicPolish, /input:not\(\[type="checkbox"\]/);
});

test("core desktop workspaces use continuous rows and flat command surfaces", () => {
  assert.match(coreWorkspaces, /\.hlc-page-dashboard/);
  assert.match(coreWorkspaces, /\.hlc-page-leads/);
  assert.match(coreWorkspaces, /\.hlc-page-jobs/);
  assert.match(coreWorkspaces, /\.hlc-page-follow-ups/);
  assert.match(coreWorkspaces, /\.hlc-page-notifications/);
  assert.match(coreWorkspaces, /\.hlc-page-documents/);
  assert.match(coreWorkspaces, /border-radius:\s*0\s*!important/);
});

test("workflow and communications routes use dedicated desktop workspace authority", () => {
  assert.match(workflowComms, /\.hlc-page-estimator/);
  assert.match(workflowComms, /\.hlc-page-calendar/);
  assert.match(workflowComms, /\.hlc-page-messages/);
  assert.match(workflowComms, /\.hlc-page-call-center/);
  assert.match(workflowComms, /\.hlc-page-manual-communications/);
});

test("network and community route families use dedicated desktop workspace authority", () => {
  assert.match(discoveryCommunity, /\.hlc-page-network/);
  assert.match(discoveryCommunity, /\.hlc-page-map/);
  assert.match(discoveryCommunity, /\.hlc-page-providers/);
  assert.match(discoveryCommunity, /\.hlc-page-matching/);
  assert.match(discoveryCommunity, /\.hlc-page-community-hub/);
  assert.match(discoveryCommunity, /\.hlc-page-community-discussions/);
});

test("account portal and agent route families use dedicated desktop workspace authority", () => {
  assert.match(accountPortalsAgents, /\.hlc-page-settings/);
  assert.match(accountPortalsAgents, /\.hlc-page-profile/);
  assert.match(accountPortalsAgents, /\.hlc-page-homeowner-portal/);
  assert.match(accountPortalsAgents, /\.hlc-page-contractor-portal/);
  assert.match(accountPortalsAgents, /\.hlc-page-hq/);
  assert.match(accountPortalsAgents, /\.hlc-page-operations/);
  assert.match(accountPortalsAgents, /\.hlc-page-customer-experience/);
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
