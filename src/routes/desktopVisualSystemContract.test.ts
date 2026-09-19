import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");
const desktopShell = readFileSync(new URL("../styles/desktop-workspace-shell.css", import.meta.url), "utf8");
const publicVisualFamily = readFileSync(new URL("../styles/public-visual-family-20260919.css", import.meta.url), "utf8");
const appLayout = readFileSync(new URL("./AppLayout.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

test("desktop structural shell remains mounted while retired desktop visual snapshots stay disconnected", () => {
  assert.match(authenticatedEntry, /desktop-workspace-shell\.css/);
  for (const retired of [
    "desktop-visual-system.css",
    "desktop-agent-team-rail.css",
    "desktop-data-workspaces.css",
    "desktop-page-archetypes.css",
    "desktop-shell-recovery.css",
    "desktop-core-workspaces.css",
    "desktop-workflow-communications.css",
    "desktop-discovery-community.css",
    "desktop-account-portals-agents.css",
    "authenticated-final-polish.css",
  ]) {
    assert.ok(!authenticatedStyles.includes(retired));
    assert.ok(!authenticatedEntry.includes(retired));
  }
});

test("desktop shell owns geometry without imposing the old navy/card theme", () => {
  assert.match(desktopShell, /@media \(min-width:1025px\)/);
  assert.match(desktopShell, /grid-template-columns:336px minmax\(0,1fr\)/);
  assert.match(desktopShell, /\.hlc-signed-in-shell > \.hlc-navbar[\s\S]*width:336px/);
  assert.match(desktopShell, /\.hlc-navbar-links[\s\S]*overflow-y:auto/);
  assert.doesNotMatch(desktopShell, /linear-gradient|radial-gradient|box-shadow/);
});

test("desktop branding uses the signed-in Navbar as the single workspace logo", () => {
  assert.doesNotMatch(appLayout, /hlc-desktop-page-brand/);
  assert.match(appLayout, /<Navbar\s*\/>/);
  assert.match(appLayout, /<Footer\s+showLogo=\{!signedInWorkspaceShell\s*&&\s*!homepageSurface\}\s*\/>/);
  assert.match(desktopShell, /\.hlc-navbar-logo img[\s\S]*display:block!important/);
  assert.doesNotMatch(authenticatedStyles, /desktop-agent-team-rail\.css/);
});

test("public surfaces keep the current owner-approved visual family separate from authenticated structure", () => {
  assert.doesNotMatch(app, /public-final-flat-authority\.css/);
  assert.match(publicVisualFamily, /OWNER CURRENT PUBLIC PRESENTATION/);
  assert.match(publicVisualFamily, /data-pathway="residents"[\s\S]*#55e6b3/);
  assert.match(publicVisualFamily, /data-pathway="professionals"[\s\S]*#39bfff/);
  assert.match(publicVisualFamily, /data-pathway="partners"[\s\S]*#ffc84e/);
  assert.match(publicVisualFamily, /data-pathway="community"[\s\S]*#c978ff/);
  assert.match(publicVisualFamily, /hlc-kendrell-dedication/);
});
