import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");
const settings = readFileSync("src/pages/dashboard/Settings.tsx", "utf8");
const notifications = readFileSync("src/components/notifications/RealtimeNotificationCenter.tsx", "utf8");
const finalGuard = readFileSync("src/styles/final-release-guard.css", "utf8");

test("retired global readability presentation layer stays disconnected", () => {
  assert.doesNotMatch(authenticatedEntry, /global-readability-certification\.css/);
  assert.doesNotMatch(authenticatedEntry, /mobile-dashboard-certification\.css/);
  assert.match(app, /lazy\(\(\) => import\("\.\/styles\/AuthenticatedStyles"\)\)/);
});

test("structural readability safeguards remain global without imposing colors", () => {
  assert.match(finalGuard, /overflow-wrap:anywhere/);
  assert.match(finalGuard, /font-size:max\(16px,1em\)/);
  assert.doesNotMatch(finalGuard, /background:|color:/);
});

test("desktop workspace sidebar can collapse and keeps sign out behavior in the app shell", () => {
  assert.match(appLayout, /SIDEBAR_COLLAPSED_KEY/);
  assert.match(appLayout, /hlc-sidebar-is-collapsed/);
  assert.match(appLayout, /hlc-desktop-sidebar-toggle/);
});

test("device alert setup is owned by Settings instead of the floating notification center", () => {
  assert.match(settings, /<DeviceAlertSettings \/>/);
  assert.match(notifications, /export function DeviceAlertSettings/);
  assert.doesNotMatch(notifications, /className="hlc-device-alert-button"/);
});
