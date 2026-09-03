import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/Automations.tsx", "utf8");
const styles = readFileSync("src/styles/automations-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("Automations uses a dedicated management control workspace instead of generic card grids", () => {
  assert.match(page, /hlc-automations-workspace/);
  assert.match(page, /MANAGEMENT CONTROL/);
  assert.match(page, /hlc-automation-registry-head/);
  assert.match(page, /hlc-automation-history-row/);
  assert.doesNotMatch(page, /cardStyle/);
  assert.doesNotMatch(page, /gridStyle/);
});

test("Automations preserves scheduled evidence, safe manual runs, registry guardrails and history", () => {
  assert.match(page, /listAutomationJobs\(\)/);
  assert.match(page, /runAutomation\(jobType\)/);
  assert.match(page, /workflow_health_check/);
  assert.match(page, /followup_scan/);
  assert.match(page, /owner_attention_scan/);
  assert.match(page, /Hourly workflow monitor/);
  assert.match(page, /automationRegistry\.map/);
  assert.match(page, /job\.last_error/);
  assert.match(page, /to="\/workflow"/);
});

test("Automations specialization mounts before final authority and keeps dense mobile rows", () => {
  const routeIndex = entry.indexOf("./automations-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-automation-registry-head,\.hlc-automation-rule-row\{display:grid/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-automation-run-row\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-automations-summary\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
});
