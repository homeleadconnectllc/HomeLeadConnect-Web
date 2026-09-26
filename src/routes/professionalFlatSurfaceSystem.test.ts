import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const surfaceSystem = readFileSync("src/styles/professional-flat-surface-system.css", "utf8");
const utilitySystem = readFileSync("src/styles/mockup-authority-20260924.css", "utf8");
const legalSystem = utilitySystem;
const contactPage = readFileSync("src/pages/ContactPage.tsx", "utf8");
const accessibilityPage = readFileSync("src/pages/Accessibility.tsx", "utf8");

test("legacy professional flat surface remains disconnected from the active authenticated cascade", () => {
  assert.doesNotMatch(authenticatedEntry, /professional-flat-surface-system\.css/);
  assert.doesNotMatch(authenticatedEntry, /application-workspace-ui\.css/);
  assert.doesNotMatch(authenticatedEntry, /launch-contrast-readability\.css/);
  assert.doesNotMatch(authenticatedEntry, /ux-ia-village-authority\.css/);
  assert.doesNotMatch(authenticatedEntry, /design-system-foundation\.css/);
});

test("archived flat surface file still documents prior HLC role accents without owning runtime presentation", () => {
  assert.match(surfaceSystem, /--hlc-flat-bg:\s*#081426/i);
  assert.match(surfaceSystem, /\.hlc-agent-card-kendrell[\s\S]*#f59e0b/i);
  assert.match(surfaceSystem, /\.hlc-agent-card-dion[\s\S]*#6366f1/i);
  assert.match(surfaceSystem, /\.hlc-agent-card-diamond[\s\S]*#10b981/i);
});

test("dense-list rules remain available only as archived reference", () => {
  assert.match(surfaceSystem, /\[class\*="-list"\]/);
  assert.match(surfaceSystem, /border-top:\s*1px solid var\(--hlc-flat-line\)/i);
});

test("public utility pages use current route classes and shared visual authority", () => {
  assert.match(utilitySystem, /\.hlc-public-board-page/);
  assert.match(utilitySystem, /\.hlc-public-card/);
  assert.match(contactPage, /hlc-public-board-page/);
  assert.match(accessibilityPage, /hlc-public-board-page/);
  assert.doesNotMatch(contactPage, /public-utility-flat\.css|public-board-pages-20260912\.css/);
  assert.doesNotMatch(accessibilityPage, /public-utility-flat\.css|public-board-pages-20260912\.css/);
  assert.doesNotMatch(contactPage, /cardStyle|contactPanelStyle|closingStyle|boxShadow:/);
});

test("legal privacy and terms use readable dividers without visual effects inside records", () => {
  assert.match(legalSystem, /\.hlc-legal-card/);
  assert.match(legalSystem, /border-top:1px solid rgba\(16,36,59,\.15\)/);
  assert.doesNotMatch(legalSystem, /\.hlc-legal-card\s*\{[^}]*linear-gradient/i);
});
