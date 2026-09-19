import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const applicationUi = readFileSync(new URL("../styles/application-workspace-ui.css", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");

test("legacy application workspace painter remains disconnected from the active authenticated cascade", () => {
  assert.doesNotMatch(authenticatedEntry, /application-workspace-ui\.css/);
  assert.doesNotMatch(authenticatedEntry, /launch-contrast-readability\.css/);
  assert.doesNotMatch(authenticatedEntry, /ux-ia-village-authority\.css/);
  assert.doesNotMatch(authenticatedEntry, /global-workspace-visual-contract\.css/);
});

test("archived workspace file remains flat and non-destructive if inspected independently", () => {
  assert.match(applicationUi, /\.hlc-signed-in-shell > \.hlc-route-content > main \{/);
  assert.match(applicationUi, /border: 0 !important;/);
  assert.match(applicationUi, /border-radius: 0 !important;/);
  assert.match(applicationUi, /background: transparent !important;/);
  assert.match(applicationUi, /box-shadow: none !important;/);
});

test("archived structural regions still document semantic surface opt-ins", () => {
  assert.match(applicationUi, /:where\(section, article, form, fieldset\):not\(\.hlc-card\)/);
  assert.match(applicationUi, /:not\(\[data-ui-surface\]\)/);
  for (const surface of ["object", "inspector", "dialog"]) {
    assert.match(applicationUi, new RegExp(`\\[data-ui-surface="${surface}"\\]`));
  }
});
