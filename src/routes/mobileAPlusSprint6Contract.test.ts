import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/mobile-a-plus-sprint-6-account-portals-resources.css", "utf8");
const styleEntry = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const settings = readFileSync("src/pages/dashboard/Settings.tsx", "utf8");
const residentPortal = readFileSync("src/pages/portal/HomeownerPortal.tsx", "utf8");
const resources = readFileSync("src/pages/dashboard/OperationalGuide.tsx", "utf8");

test("Sprint 6 mounts after Sprint 5 as compact-only authority", () => {
  const sprint5 = styleEntry.indexOf("./mobile-a-plus-sprint-5-community-participation.css");
  const sprint6 = styleEntry.indexOf("./mobile-a-plus-sprint-6-account-portals-resources.css");
  assert.ok(sprint5 >= 0);
  assert.ok(sprint6 > sprint5);
  assert.match(styles, /@media \(max-width: 760px\)/);
});

test("Sprint 6 preserves server-controlled workspace and billing authority", () => {
  assert.match(settings, /switchCurrentWorkspace/);
  assert.match(settings, /Workspace role remains server-controlled/);
  assert.match(settings, /getBillingStatus/);
  assert.match(settings, /billingConsent/);
  assert.match(settings, /startSubscriptionCheckout/);
  assert.match(settings, /No authoritative Stripe subscription is recorded/);
});

test("Sprint 6 makes account and portal forms touch and keyboard safe", () => {
  assert.match(styles, /\.hlc-account-workspace input,[\s\S]*min-height: 44px/);
  assert.match(styles, /font-size: 16px/);
  assert.match(styles, /\.hlc-account-form-actions[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(styles, /safe-area-inset-bottom/);
});

test("Sprint 6 keeps resident portal actions and evidence canonical", () => {
  assert.match(residentPortal, /decideHomeownerEstimate/);
  assert.match(residentPortal, /getHomeownerPortalData/);
  assert.match(residentPortal, /getDocumentUrl/);
  assert.match(styles, /\.hlc-portal-actions[\s\S]*grid-template-columns: minmax\(0, 1fr\)/);
});

test("Sprint 6 makes long-form resources readable and navigable on mobile", () => {
  assert.match(resources, /hlc-resources-commandbar/);
  assert.match(resources, /hlc-resource-row/);
  assert.match(resources, /hlc-manual-row/);
  assert.match(styles, /\.hlc-resources-commandbar[\s\S]*overflow-x: auto/);
  assert.match(styles, /overflow-wrap: anywhere/);
  assert.match(styles, /\.hlc-resource-actions a[\s\S]*min-height: 44px/);
});
