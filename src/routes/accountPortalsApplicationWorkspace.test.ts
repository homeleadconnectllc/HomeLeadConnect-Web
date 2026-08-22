import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const settings = readFileSync("src/pages/dashboard/Settings.tsx", "utf8");
const profile = readFileSync("src/pages/dashboard/MyProfile.tsx", "utf8");
const resident = readFileSync("src/pages/portal/HomeownerPortal.tsx", "utf8");
const professional = readFileSync("src/pages/portal/ContractorPortal.tsx", "utf8");
const styles = readFileSync("src/styles/account-portals-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("account surfaces use dedicated control workspaces instead of generic cards", () => {
  assert.match(settings, /hlc-account-workspace/);
  assert.match(settings, /ACCOUNT CONTROL/);
  assert.match(profile, /hlc-account-workspace/);
  assert.match(profile, /ACCOUNT IDENTITY/);
  assert.doesNotMatch(settings, /cardStyle|pageStyle/);
  assert.doesNotMatch(profile, /cardStyle|heroStyle/);
});

test("Settings preserves identity workspace business phone alert and billing controls", () => {
  assert.match(settings, /getMyProfile\(\)/);
  assert.match(settings, /getBusinessProfile\(\)/);
  assert.match(settings, /listMyWorkspaces\(\)/);
  assert.match(settings, /switchCurrentWorkspace\(workspaceId\)/);
  assert.match(settings, /updateMyProfile\(personal\)/);
  assert.match(settings, /saveBusinessProfile\(business\)/);
  assert.match(settings, /listBusinessPhones\(\)/);
  assert.match(settings, /DeviceAlertSettings/);
  assert.match(settings, /getBillingStatus\(\)/);
  assert.match(settings, /getBillingOffer\(\)/);
  assert.match(settings, /startSubscriptionCheckout/);
  assert.match(settings, /openBillingPortal/);
  assert.match(settings, /billingConsent/);
});

test("My Profile preserves participant preferences and authorization boundary", () => {
  assert.match(profile, /getParticipantPreferences\(\)/);
  assert.match(profile, /saveParticipantPreferences\(prefs\)/);
  assert.match(profile, /updateMyProfile\(form\)/);
  assert.match(profile, /network_visibility/);
  assert.match(profile, /preferred_contact/);
  assert.match(profile, /accessibility_notes/);
  assert.match(profile, /never overrides workspace membership, portal links, RLS/);
});

test("resident portal preserves shared relationship decisions appointments and documents", () => {
  assert.match(resident, /getHomeownerPortalData\(\)/);
  assert.match(resident, /decideHomeownerEstimate\(id, decision\)/);
  assert.match(resident, /decision: "accepted" \| "rejected"/);
  assert.match(resident, /listDocuments\(\)/);
  assert.match(resident, /getDocumentUrl\(document\.id, document\.storage_path\)/);
  assert.match(resident, /appointment_end_at/);
  assert.match(resident, /hlc-portal-workspace is-resident/);
});

test("professional portal preserves company links offer decisions appointments and documents", () => {
  assert.match(professional, /getContractorPortalData\(\)/);
  assert.match(professional, /decideContractorAssignment\(id, decision\)/);
  assert.match(professional, /decision: "accepted" \| "rejected"/);
  assert.match(professional, /listDocuments\(\)/);
  assert.match(professional, /getDocumentUrl\(document\.id, document\.storage_path\)/);
  assert.match(professional, /appointment_end_at/);
  assert.match(professional, /hlc-portal-workspace is-professional/);
});

test("account portal specialization mounts before final authority and collapses on mobile", () => {
  const routeIndex = entry.indexOf("./account-portals-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-account-console\{display:grid;grid-template-columns:/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-account-field-grid\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-portal-row,.hlc-portal-file-row\{grid-template-columns:1fr/);
  assert.match(styles, /width:min\(100% - 24px,1440px\)/);
});

test("account and portal screens are natively dark with divider-based controls", () => {
  assert.match(styles, /--acct-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-account-field-grid input,[\s\S]*background:var\(--acct-surface-soft\)/);
  assert.match(styles, /\.hlc-account-form-actions button,[\s\S]*background:#112744/);
  assert.match(styles, /\.hlc-portal-row\{[^}]*background:transparent!important/);
  assert.doesNotMatch(styles, /background:(?:#fff|#ffffff|#fbfdff|#eef5fc)/i);
});
