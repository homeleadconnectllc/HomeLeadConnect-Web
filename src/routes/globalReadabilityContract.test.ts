import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedStyles = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");
const settings = readFileSync("src/pages/dashboard/Settings.tsx", "utf8");
const notifications = readFileSync("src/components/notifications/RealtimeNotificationCenter.tsx", "utf8");
const readability = readFileSync("src/styles/global-readability-certification.css", "utf8");

test("global readability certification is the final authenticated stylesheet", () => {
  const mobileIndex = authenticatedStyles.indexOf("./mobile-dashboard-certification.css");
  const readabilityIndex = authenticatedStyles.indexOf("./global-readability-certification.css");
  assert.ok(mobileIndex >= 0);
  assert.ok(readabilityIndex > mobileIndex);
  assert.match(app, /lazy\(\(\) => import\("\.\/styles\/AuthenticatedStyles"\)\)/);
});

test("signed-in light and dark surfaces have explicit readable copy contracts", () => {
  assert.match(readability, /\.hlc-command-hero[\s\S]*#f8fafc !important/);
  assert.match(readability, /\.hlc-workspace-copy span[\s\S]*#3f4f66 !important/);
  assert.match(readability, /\.hlc-priority-panel[\s\S]*#f8fafc !important/);
  assert.match(readability, /font-size:\s*16px/);
});

test("desktop workspace sidebar can collapse and keeps sign out reachable", () => {
  assert.match(appLayout, /SIDEBAR_COLLAPSED_KEY/);
  assert.match(appLayout, /hlc-sidebar-is-collapsed/);
  assert.match(appLayout, /hlc-desktop-sidebar-toggle/);
  assert.match(readability, /grid-template-columns:\s*56px minmax\(0, 1fr\)/);
  assert.match(readability, /\.hlc-nav-logout[\s\S]*display:\s*block !important/);
  assert.match(readability, /\.hlc-desktop-navigation[\s\S]*overflow-y:\s*auto !important/);
});

test("device alert setup is owned by Settings instead of the floating notification center", () => {
  assert.match(settings, /<DeviceAlertSettings \/>/);
  assert.match(notifications, /export function DeviceAlertSettings/);
  assert.doesNotMatch(notifications, /className="hlc-device-alert-button"/);
  assert.match(readability, /\.hlc-device-alert-settings/);
});

test("open contextual agent panel is viewport contained", () => {
  assert.match(readability, /\.hlc-agent-dock\.is-open \.hlc-agent-dock-panel/);
  assert.match(readability, /overflow-x:\s*hidden !important/);
  assert.match(readability, /max-width:\s*calc\(100vw - 36px\) !important/);
});
