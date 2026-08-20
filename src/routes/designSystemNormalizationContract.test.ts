import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const foundation = readFileSync(new URL("../styles/design-system-foundation.css", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");

test("authenticated routes load the design-system foundation last", () => {
  assert.match(authenticatedEntry, /import "\.\/design-system-foundation\.css";/);
  assert.equal(authenticatedEntry.trim().split("\n").at(-1), 'import "./design-system-foundation.css";');
});

test("design system exposes canonical spacing, type, geometry, control, and layout tokens", () => {
  for (const token of [
    "--hlc-space-1: 4px",
    "--hlc-space-4: 16px",
    "--hlc-space-9: 64px",
    "--hlc-text-base: 16px",
    "--hlc-text-4xl: 36px",
    "--hlc-radius-sm: 8px",
    "--hlc-radius-xl: 20px",
    "--hlc-control-md: 44px",
    "--hlc-content-max: 1440px",
  ]) assert.match(foundation, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("design system standardizes shell, controls, surfaces, and mobile layout", () => {
  assert.match(foundation, /width: min\(100%, var\(--hlc-content-max\)\)/);
  assert.match(foundation, /border: 1px solid var\(--hlc-border-subtle\)/);
  assert.match(foundation, /min-height: var\(--hlc-control-md\)/);
  assert.match(foundation, /@media \(max-width: 760px\)/);
  assert.match(foundation, /padding-inline: var\(--hlc-space-4\)/);
});

test("brand color remains concentrated in intentional command surfaces", () => {
  assert.match(foundation, /\.hlc-command-hero/);
  assert.match(foundation, /linear-gradient\(135deg, var\(--hlc-navy\)/);
  assert.match(foundation, /\.hlc-priority-panel/);
  assert.match(foundation, /\.hlc-agent-card/);
});
