import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/CallCenter.tsx", "utf8");
const styles = readFileSync("src/styles/call-center-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("Call Center uses a dedicated call-operations workspace instead of inline card composition", () => {
  assert.match(page, /hlc-call-center-workspace/);
  assert.match(page, /DEVICE & PROVIDER HANDOFF/);
  assert.match(page, /OPTIONAL CONNECTED CARRIER/);
  assert.match(page, /hlc-call-line-row/);
  assert.match(page, /hlc-call-ledger-row/);
  assert.doesNotMatch(page, /CSSProperties|companionStyle|actionStyle|statusGridStyle/);
});

test("Call Center preserves provider-neutral handoff, persisted sessions and intelligent outcome mutations", () => {
  assert.match(page, /listBusinessPhones\(\)/);
  assert.match(page, /listCallSessions\(\)/);
  assert.match(page, /recordCallDisposition/);
  assert.match(page, /transport=device_native&direction=outbound/);
  assert.match(page, /transport=device_native&direction=inbound/);
  assert.match(page, />Call Log</);
  assert.match(page, />Call History</);
  assert.match(page, /Save intelligent disposition/);
  assert.match(page, /Human confirmation required/);
  assert.match(page, /https:\/\/voice\.google\.com\//);
  assert.match(page, /transport=google_voice&direction=outbound/);
  assert.match(page, /transport=google_voice&direction=inbound/);
  assert.match(page, /tel:\$\{phone\.phone_number\}/);
  assert.match(page, /does not provide embedded Answer, Hold, Transfer, Hang Up controls/);
});

test("Call Center specialization mounts before final authority and becomes one-column on mobile", () => {
  const routeIndex = entry.indexOf("./call-center-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-call-ledgers\{display:grid;grid-template-columns:1fr 1fr/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-call-line-row\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-call-ledger-row\{grid-template-columns:1fr/);
});

test("Call Center is natively dark and reserves contained treatment for the disposition inspector", () => {
  assert.match(styles, /--call-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-call-carrier-lane\{[^}]*background:transparent/);
  assert.match(styles, /\.hlc-call-line-row\{[^}]*background:transparent/);
  assert.match(styles, /\.hlc-call-disposition\{[^}]*background:var\(--call-surface\)/);
  assert.doesNotMatch(styles, /background:(?:#fff|#ffffff|#f8fafc|#f8fbff)/i);
});
