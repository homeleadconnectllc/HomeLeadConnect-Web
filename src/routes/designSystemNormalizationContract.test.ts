import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const foundation = readFileSync(new URL("../styles/design-system-foundation.css", import.meta.url), "utf8");
const mobile = readFileSync(new URL("../styles/mobile-all-screens-certification.css", import.meta.url), "utf8");
const authenticatedEntry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");

test("authenticated routes load normalized foundation, mobile specialization, visual contract, structural authority, then launch contrast", () => {
  const foundationImport = 'import "./design-system-foundation.css";';
  const mobileImport = 'import "./mobile-all-screens-certification.css";';
  const visualContractImport = 'import "./global-workspace-visual-contract.css";';
  const applicationUiImport = 'import "./application-workspace-ui.css";';
  const contrastImport = 'import "./launch-contrast-readability.css";';

  assert.match(authenticatedEntry, /import "\.\/design-system-foundation\.css";/);
  assert.match(authenticatedEntry, /import "\.\/mobile-all-screens-certification\.css";/);
  assert.match(authenticatedEntry, /import "\.\/global-workspace-visual-contract\.css";/);
  assert.match(authenticatedEntry, /import "\.\/application-workspace-ui\.css";/);
  assert.match(authenticatedEntry, /import "\.\/launch-contrast-readability\.css";/);
  assert.ok(authenticatedEntry.indexOf(foundationImport) < authenticatedEntry.indexOf(mobileImport));
  assert.ok(authenticatedEntry.indexOf(mobileImport) < authenticatedEntry.indexOf(visualContractImport));
  assert.ok(authenticatedEntry.indexOf(visualContractImport) < authenticatedEntry.indexOf(applicationUiImport));
  assert.ok(authenticatedEntry.indexOf(applicationUiImport) < authenticatedEntry.indexOf(contrastImport));
  assert.equal(authenticatedEntry.trim().split("\n").at(-1), contrastImport);
});

test("mobile specialization is strictly scoped to compact viewports", () => {
  const compact = mobile.trim();
  assert.ok(compact.startsWith("/* Mobile-only signed-in normalization."));
  assert.match(compact, /@media \(max-width: 760px\) \{/);
  assert.doesNotMatch(compact, /@media \(min-width:/);
  assert.doesNotMatch(compact, /@media \(width/);
});

test("mobile specialization covers the signed-in modules and safe viewport lanes", () => {
  for (const selector of [
    ".hlc-leads-page",
    ".hlc-jobs-page",
    ".hlc-messages-page",
    ".hlc-calendar-page",
    ".hlc-follow-ups-page",
    ".hlc-automations-page",
    ".hlc-call-center-page",
    ".hlc-provider-directory-page",
    ".hlc-community-page",
    ".hlc-documents-page",
    ".hlc-settings-page",
    ".hlc-profile-page",
    ".hlc-homeowner-portal",
    ".hlc-contractor-portal",
    ".hlc-analytics-page",
    ".hlc-map-page",
    ".hlc-matching-page",
    ".hlc-workflow-page",
    ".hlc-estimator-page",
    ".hlc-notifications-page",
  ]) assert.match(mobile, new RegExp(selector.replaceAll(".", "\\.")));
  assert.match(mobile, /padding-bottom: calc\(92px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(mobile, /height: min\(58dvh, 520px\)/);
  assert.match(mobile, /grid-template-columns: minmax\(0, 1fr\)/);
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
    "--hlc-work-max: 1240px",
    "--hlc-reading-max: 1080px",
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

test("working and decision modules share canonical rails", () => {
  for (const selector of [
    ".hlc-leads-page",
    ".hlc-jobs-page",
    ".hlc-messages-page",
    ".hlc-calendar-page",
    ".hlc-follow-ups-page",
    ".hlc-automations-page",
    ".hlc-call-center-page",
    ".hlc-provider-directory-page",
    ".hlc-community-page",
    ".hlc-documents-page",
    ".hlc-settings-page",
    ".hlc-profile-page",
    ".hlc-homeowner-portal",
    ".hlc-contractor-portal",
  ]) assert.match(foundation, new RegExp(selector.replaceAll(".", "\\.")));
  assert.match(foundation, /var\(--hlc-work-max\)/);
  assert.match(foundation, /var\(--hlc-reading-max\)/);
});

test("records, tables, forms, and status metadata use shared component anatomy", () => {
  assert.match(foundation, /\.hlc-lead-card/);
  assert.match(foundation, /\.hlc-job-card/);
  assert.match(foundation, /thead th/);
  assert.match(foundation, /tbody td/);
  assert.match(foundation, /label \{/);
  assert.match(foundation, /::placeholder/);
  assert.match(foundation, /\.status-badge/);
  assert.match(foundation, /\[class\*="status-chip"\]/);
});

test("dashboard, analytics, and messages are normalized by role rather than generic card styling", () => {
  assert.match(foundation, /\.hlc-metric-grid/);
  assert.match(foundation, /\.hlc-metric-card strong/);
  assert.match(foundation, /\.hlc-business-pulse-grid/);
  assert.match(foundation, /\.hlc-analytics-kpi-grid/);
  assert.match(foundation, /\.hlc-messages-layout/);
  assert.match(foundation, /\.hlc-chat-history-item\.is-selected/);
});

test("desktop navigation and mobile transformations remain part of the canonical system", () => {
  assert.match(foundation, /@media \(min-width: 1025px\)/);
  assert.match(foundation, /\.hlc-navbar-groups/);
  assert.match(foundation, /\.hlc-nav-group summary/);
  assert.match(foundation, /\.hlc-mobile-tabbar/);
  assert.match(foundation, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(foundation, /overflow-x: auto/);
});

test("agent workspace is compact and leaves application context visible", () => {
  assert.match(foundation, /\.hlc-agent-dock:not\(\.is-open\)/);
  assert.match(foundation, /width: min\(480px, calc\(100vw - 32px\)\)/);
  assert.match(foundation, /height: min\(62dvh, 560px\)/);
  assert.doesNotMatch(foundation, /height:\s*100dvh/);
});
