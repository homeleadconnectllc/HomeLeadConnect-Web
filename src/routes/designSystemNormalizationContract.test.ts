import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mobileShell = readFileSync(new URL("../styles/authenticated-mobile-shell-authority.css", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");
const appShellEntry = readFileSync(new URL("../styles/app-shell-entry.ts", import.meta.url), "utf8");
const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");

test("authenticated styling uses structural modules with one final signed-in visual authority", () => {
  assert.ok(authenticatedEntry.includes("desktop-workspace-shell.css"));
  assert.doesNotMatch(authenticatedEntry, /professional-flat-surface-system\.css/);
  assert.doesNotMatch(authenticatedEntry, /application-workspace-ui\.css/);
  assert.ok(authenticatedStyles.includes("signed-in-professional-system.css"));
  assert.ok(
    authenticatedStyles.indexOf("signed-in-professional-system.css") >
      authenticatedStyles.indexOf("dashboard-context-hero.css"),
    "current signed-in visual authority must load after legacy route/closure layers",
  );
  assert.match(appShellEntry, /authenticated-mobile-shell-authority\.css/);

  for (const retired of [
    "design-system-foundation.css",
    "global-workspace-visual-contract.css",
    "launch-contrast-readability.css",
    "ux-ia-village-authority.css",
    "workspace-premium-v3.css",
    "workspace-premium-v4.css",
    "mobile-all-screens-certification.css",
    "desktop-visual-system.css",
    "desktop-agent-team-rail.css",
    "desktop-data-workspaces.css",
    "desktop-page-archetypes.css",
    "desktop-core-workspaces.css",
    "desktop-workflow-communications.css",
    "desktop-discovery-community.css",
    "desktop-account-portals-agents.css",
  ]) {
    assert.ok(!authenticatedEntry.includes(retired));
    assert.ok(!authenticatedStyles.includes(retired));
  }
});

test("mobile shell remains compact-viewport scoped and structural", () => {
  assert.match(mobileShell, /@media \(max-width: 1024px\)/);
  assert.match(mobileShell, /box-sizing: border-box !important/);
  assert.match(mobileShell, /max-height: 76px !important/);
  assert.doesNotMatch(mobileShell, /linear-gradient|box-shadow/);
});
