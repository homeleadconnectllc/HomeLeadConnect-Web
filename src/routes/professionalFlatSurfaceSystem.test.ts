import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const surfaceSystem = readFileSync("src/styles/professional-flat-surface-system.css", "utf8");
const utilitySystem = readFileSync("src/styles/public-utility-flat.css", "utf8");
const legalSystem = readFileSync("src/styles/legal.css", "utf8");
const contactPage = readFileSync("src/pages/ContactPage.tsx", "utf8");
const accessibilityPage = readFileSync("src/pages/Accessibility.tsx", "utf8");

test("professional flat surface system loads beneath structural and contrast authorities", () => {
  const lines = authenticatedEntry.trim().split("\n");
  const flatIndex = lines.indexOf('import "./professional-flat-surface-system.css";');
  const structuralIndex = lines.indexOf('import "./application-workspace-ui.css";');
  const contrastIndex = lines.indexOf('import "./launch-contrast-readability.css";');
  assert.ok(flatIndex >= 0);
  assert.ok(flatIndex < structuralIndex);
  assert.ok(structuralIndex < contrastIndex);
  assert.equal(lines.at(-1), 'import "./launch-contrast-readability.css";');
});

test("approved workspace direction removes floating card chrome without removing HLC role accents", () => {
  assert.match(surfaceSystem, /--hlc-flat-bg:\s*#081426/i);
  assert.match(surfaceSystem, /box-shadow:\s*none\s*!important/i);
  assert.match(surfaceSystem, /border-radius:\s*10px\s*!important/i);
  assert.match(surfaceSystem, /\.hlc-metric-grid[\s\S]*gap:\s*0\s*!important/i);
  assert.match(surfaceSystem, /\.hlc-business-pulse-section[\s\S]*background:\s*transparent\s*!important/i);
  assert.match(surfaceSystem, /\.hlc-agent-card-kendrell[\s\S]*#f59e0b/i);
  assert.match(surfaceSystem, /\.hlc-agent-card-dion[\s\S]*#6366f1/i);
  assert.match(surfaceSystem, /\.hlc-agent-card-diamond[\s\S]*#10b981/i);
});

test("dense lists and tables use separators instead of nested bright boxes", () => {
  assert.match(surfaceSystem, /\[class\*="-list"\]/);
  assert.match(surfaceSystem, /border-top:\s*1px solid var\(--hlc-flat-line\)/i);
  assert.match(surfaceSystem, /table[\s\S]*border-radius:\s*8px\s*!important/i);
  assert.match(surfaceSystem, /thead[\s\S]*rgba\(47, 128, 255, \.055\)/i);
});

test("public utility pages use the same flat navy HLC language instead of a bright card wall", () => {
  assert.match(utilitySystem, /\.hlc-utility-page\{[^}]*#081426/i);
  assert.match(utilitySystem, /\.hlc-utility-section\{[^}]*border-bottom:[^}]*background:transparent[^}]*border-radius:0[^}]*box-shadow:none/i);
  assert.match(utilitySystem, /\.hlc-utility-path\{[^}]*border-bottom:/i);
  assert.match(contactPage, /public-utility-flat\.css/);
  assert.match(accessibilityPage, /public-utility-flat\.css/);
  assert.doesNotMatch(contactPage, /cardStyle|contactPanelStyle|closingStyle|boxShadow:/);
  assert.doesNotMatch(accessibilityPage, /hlc-public-card/);
});

test("legal privacy and terms are professional divider sections rather than stacked rounded cards", () => {
  assert.match(legalSystem, /\.hlc-legal-card\{[^}]*border-bottom:[^}]*border-radius:0[^}]*background:transparent[^}]*box-shadow:none/i);
  assert.match(legalSystem, /\.hlc-legal-hero\{[^}]*border-radius:0[^}]*background:transparent[^}]*box-shadow:none/i);
  assert.doesNotMatch(legalSystem, /\.hlc-legal-card\{[^}]*linear-gradient/i);
});
