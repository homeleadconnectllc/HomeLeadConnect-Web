import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const applicationUi = readFileSync(new URL("../styles/application-workspace-ui.css", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");

test("application workspace UI remains the final structural authority beneath launch contrast", () => {
  const applicationImport = 'import "./application-workspace-ui.css";';
  const contrastImport = 'import "./launch-contrast-readability.css";';
  assert.match(authenticatedEntry, /import "\.\/application-workspace-ui\.css";/);
  assert.match(authenticatedEntry, /import "\.\/launch-contrast-readability\.css";/);
  assert.ok(authenticatedEntry.indexOf(applicationImport) < authenticatedEntry.indexOf(contrastImport));
  assert.equal(authenticatedEntry.trim().split("\n").at(-1), contrastImport);
});

test("the routed workspace shell is flat instead of a giant card", () => {
  assert.match(applicationUi, /\.hlc-signed-in-shell > \.hlc-route-content > main \{/);
  assert.match(applicationUi, /border: 0 !important;/);
  assert.match(applicationUi, /border-radius: 0 !important;/);
  assert.match(applicationUi, /background: transparent !important;/);
  assert.match(applicationUi, /box-shadow: none !important;/);
});

test("structural regions are layout primitives unless they explicitly opt into a semantic surface", () => {
  assert.match(applicationUi, /:where\(section, article, form, fieldset\):not\(\.hlc-card\)/);
  assert.match(applicationUi, /:not\(\[data-ui-surface\]\)/);
  assert.match(applicationUi, /background-image: none !important;/);
});

test("cards are semantic opt-ins for objects, inspectors, and dialogs", () => {
  for (const surface of ["object", "inspector", "dialog"]) {
    assert.match(applicationUi, new RegExp(`\\[data-ui-surface="${surface}"\\]`));
  }
  assert.match(applicationUi, /border-radius: 12px !important;/);
  assert.match(applicationUi, /box-shadow: none !important;/);
});

test("dense application surfaces favor rows, dividers, and compact mobile rails", () => {
  assert.match(applicationUi, /tbody tr:hover/);
  assert.match(applicationUi, /\[role="list"\] > \* \+ \*/);
  assert.match(applicationUi, /@media \(max-width: 430px\)/);
  assert.match(applicationUi, /width: 100% !important;/);
});
