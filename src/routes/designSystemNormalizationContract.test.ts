import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mobile = readFileSync(new URL("../styles/mobile-all-screens-certification.css", import.meta.url), "utf8");
const applicationUi = readFileSync(new URL("../styles/application-workspace-ui.css", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");

test("authenticated styling uses modular current authorities without retired global repaint layers", () => {
  for (const current of [
    "desktop-workspace-shell.css",
    "mobile-all-screens-certification.css",
    "signed-in-professional-system.css",
    "application-workspace-ui.css",
  ]) assert.ok(authenticatedEntry.includes(current));

  for (const retired of [
    "design-system-foundation.css",
    "global-workspace-visual-contract.css",
    "launch-contrast-readability.css",
    "ux-ia-village-authority.css",
    "workspace-premium-v3.css",
    "workspace-premium-v4.css",
  ]) assert.ok(!authenticatedEntry.includes(retired));
});

test("mobile specialization remains compact-viewport scoped", () => {
  const compact = mobile.trim();
  assert.match(compact, /@media \(max-width: 760px\)/);
  assert.doesNotMatch(compact, /@media \(min-width:/);
});

test("current application UI keeps routed workspaces flat by default", () => {
  assert.match(applicationUi, /\.hlc-signed-in-shell > \.hlc-route-content > main/);
  assert.match(applicationUi, /background:\s*transparent\s*!important/);
  assert.match(applicationUi, /box-shadow:\s*none\s*!important/);
});

test("semantic cards remain explicit opt-ins instead of a global card wall", () => {
  for (const surface of ["object", "inspector", "dialog"]) {
    assert.ok(applicationUi.includes(`data-ui-surface="${surface}"`));
  }
});

test("mobile specialization still protects core signed-in modules", () => {
  for (const selector of [".hlc-leads-page",".hlc-jobs-page",".hlc-messages-page",".hlc-calendar-page",".hlc-automations-page"]) {
    assert.ok(mobile.includes(selector));
  }
});
