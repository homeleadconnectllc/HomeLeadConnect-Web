import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const surfaceSystem = readFileSync("src/styles/professional-flat-surface-system.css", "utf8");

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
