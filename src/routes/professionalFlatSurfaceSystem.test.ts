import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const surfaceSystem = readFileSync("src/styles/professional-flat-surface-system.css", "utf8");
const utilitySystem = readFileSync("src/styles/public-visual-family-20260919.css", "utf8");
const legalSystem = utilitySystem;
const contactPage = readFileSync("src/pages/ContactPage.tsx", "utf8");
const accessibilityPage = readFileSync("src/pages/Accessibility.tsx", "utf8");

test("professional flat surface system loads beneath structural contrast and UX IA authorities", () => {
  const lines = authenticatedEntry.trim().split("\n");
  const flatIndex = lines.indexOf('import "./professional-flat-surface-system.css";');
  const structuralIndex = lines.indexOf('import "./application-workspace-ui.css";');
  const contrastIndex = lines.indexOf('import "./launch-contrast-readability.css";');
  const uxIaIndex = lines.indexOf('import "./ux-ia-village-authority.css";');
  assert.ok(flatIndex >= 0);
  assert.ok(flatIndex < structuralIndex);
  assert.ok(structuralIndex < contrastIndex);
  assert.ok(contrastIndex < uxIaIndex);
  assert.equal(lines.at(-1), 'import "./ux-ia-village-authority.css";');
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

test("public utility pages use the canonical light public visual family without legacy dark shells", () => {
  assert.match(utilitySystem, /--hlc-public-bg:\s*#f7fbff/i);
  assert.match(utilitySystem, /\.hlc-public-card[\s\S]*background:transparent\s*!important/i);
  assert.match(contactPage, /public-visual-family-20260919\.css/);
  assert.match(accessibilityPage, /public-visual-family-20260919\.css/);
  assert.doesNotMatch(contactPage, /public-utility-flat\.css|public-board-pages-20260912\.css/);
  assert.doesNotMatch(accessibilityPage, /public-utility-flat\.css|public-board-pages-20260912\.css/);
  assert.doesNotMatch(contactPage, /cardStyle|contactPanelStyle|closingStyle|boxShadow:/);\n  assert.doesNotMatch(utilitySystem, /--hlc-public-bg:\\s*#071a2d|--hlc-public-bg-2:\\s*#0b2845|background:\\s*#03111f/i);
});

test("legal privacy and terms remain divider-led within the canonical public visual family", () => {
  assert.match(legalSystem, /\.hlc-legal-card[^{]*\{[^}]*border-bottom:\s*1px solid var\(--hlc-public-line\)\s*!important/i);
  assert.match(legalSystem, /\.hlc-legal-card\{max-width:900px!important;text-align:left!important\}/i);
  assert.doesNotMatch(legalSystem, /\.hlc-legal-card\{[^}]*linear-gradient/i);
});
