import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync(new URL("../styles/dashboard-application-workspace.css", import.meta.url), "utf8");
const mobileLiveAuthority = readFileSync(new URL("../styles/mobile-dashboard-live-authority.css", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");

test("dashboard specialization is mounted before structural contrast and UX IA authorities", () => {
  const dashboardImport = 'import "./dashboard-application-workspace.css";';
  const applicationImport = 'import "./application-workspace-ui.css";';
  const mobileLiveImport = 'import "./mobile-dashboard-live-authority.css";';
  const contrastImport = 'import "./launch-contrast-readability.css";';
  const uxIaImport = 'import "./ux-ia-village-authority.css";';
  assert.match(authenticatedEntry, /import "\.\/dashboard-application-workspace\.css";/);
  assert.ok(authenticatedEntry.indexOf(dashboardImport) < authenticatedEntry.indexOf(applicationImport));
  assert.ok(authenticatedEntry.indexOf(applicationImport) < authenticatedEntry.indexOf(mobileLiveImport));
  assert.ok(authenticatedEntry.indexOf(mobileLiveImport) < authenticatedEntry.indexOf(contrastImport));
  assert.ok(authenticatedEntry.indexOf(contrastImport) < authenticatedEntry.indexOf(uxIaImport));
  assert.equal(authenticatedEntry.trim().split("\n").at(-1), uxIaImport);
});

test("dashboard metrics are a divider-based KPI rail instead of cards", () => {
  assert.match(dashboard, /\.hlc-command-center \.hlc-metric-grid/);
  assert.match(dashboard, /gap: 0;/);
  assert.match(dashboard, /\.hlc-command-center \.hlc-metric-card \{/);
  assert.match(dashboard, /border-radius: 0;/);
  assert.match(dashboard, /background: transparent;/);
  assert.match(dashboard, /box-shadow: none;/);
});

test("dashboard quick actions behave like a toolbar", () => {
  assert.match(dashboard, /\.hlc-command-center \.hlc-quick-actions/);
  assert.match(dashboard, /overflow: hidden;/);
  assert.match(dashboard, /\.hlc-command-center \.hlc-quick-action \{/);
  assert.match(dashboard, /border-right: 1px solid var\(--dashboard-divider\)/);
});

test("dashboard priority, pulse, workspace, and agent sections use rows instead of floating cards", () => {
  for (const selector of [
    ".hlc-priority-panel",
    ".hlc-pulse-card",
    ".hlc-workspace-card",
    ".hlc-agent-card",
  ]) {
    assert.match(dashboard, new RegExp(selector.replaceAll(".", "\\.")));
  }
  assert.match(dashboard, /border-bottom: 1px solid var\(--dashboard-divider\)/);
  assert.match(dashboard, /background: var\(--dashboard-row-hover\)/);
});

test("dashboard mobile layout preserves compact KPI and action rails", () => {
  assert.match(dashboard, /@media \(max-width: 720px\)/);
  assert.match(dashboard, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(dashboard, /@media \(max-width: 430px\)/);
});

test("real-device mobile dashboard and analytics reject legacy light card islands", () => {
  assert.match(mobileLiveAuthority, /@media \(max-width: 760px\)/);
  assert.match(mobileLiveAuthority, /\.hlc-signed-in-shell \.hlc-command-center \.hlc-metric-card[\s\S]*border-radius:\s*0 !important[\s\S]*background:\s*transparent !important[\s\S]*box-shadow:\s*none !important/i);
  assert.match(mobileLiveAuthority, /\.hlc-signed-in-shell \.hlc-command-center :is\(\.hlc-dashboard-section,\.hlc-agent-team-section,\.hlc-business-pulse-section,\.hlc-priority-panel\)[\s\S]*background:\s*transparent !important/i);
  assert.match(mobileLiveAuthority, /\.hlc-signed-in-shell \.hlc-analytics-page \.hlc-analytics-kpi[\s\S]*border-radius:\s*0 !important[\s\S]*background:\s*transparent !important[\s\S]*box-shadow:\s*none !important/i);
  assert.match(mobileLiveAuthority, /\.hlc-signed-in-shell \.hlc-analytics-page \.hlc-analytics-detail-grid > article,[\s\S]*background:\s*transparent !important/i);
  assert.doesNotMatch(mobileLiveAuthority, /background:\s*(?:#fff(?:fff)?|white)\b/i);
});
