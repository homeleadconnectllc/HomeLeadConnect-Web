import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const settings = readFileSync("src/pages/dashboard/Settings.tsx", "utf8");
const connections = readFileSync("src/components/settings/IntegrationsConnectionsPanel.tsx", "utf8");
const profile = readFileSync("src/pages/dashboard/MyProfile.tsx", "utf8");
const resident = readFileSync("src/pages/portal/HomeownerPortal.tsx", "utf8");
const professional = readFileSync("src/pages/portal/ContractorPortal.tsx", "utf8");
const partner = readFileSync("src/pages/portal/PartnerPortal.tsx", "utf8");
const styles = readFileSync("src/styles/account-portals-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("account surfaces use dedicated control workspaces instead of generic cards", () => {
  assert.match(settings, /hlc-account-workspace/);
  assert.match(settings, /ACCOUNT CONTROL/);
  assert.match(profile, /hlc-account-workspace/);
  assert.match(profile, /ACCOUNT · PROFILE/);
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

test("Integrations and Connections reports evidence-backed state instead of invented connectivity", () => {
  assert.match(settings, /IntegrationsConnectionsPanel/);
  assert.match(settings, /getIntegrationEvidence\(profile\.workspace_id\)/);
  assert.match(connections, /Integrations & Connections/);
  assert.match(connections, /Phone \/ SMS providers/);
  assert.match(connections, /Stripe/);
  assert.match(connections, /Email delivery/);
  assert.match(connections, /Google Calendar sync/);
  assert.match(connections, /HLC document storage/);
  assert.match(connections, /OCR \/ document processing/);
  assert.match(connections, /Maps \/ routing/);
  assert.match(connections, /API & webhooks/);
  assert.match(connections, /Statuses below are evidence-based/);
  assert.match(connections, /emailConnection\?\.status === "connected"/);
  assert.match(connections, /syncedCalendarMappings > 0/);
  assert.match(connections, /Provider delivery-event proof is still pending/);
  assert.match(connections, /User OAuth and bidirectional reconciliation are not claimed/);
  assert.match(connections, /state: "Not verified"/);
  assert.match(connections, /state: "Setup required"/);
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

test("resident portal preserves shared relationship decisions appointments documents and Resources access", () => {
  assert.match(resident, /getHomeownerPortalData\(\)/);
  assert.match(resident, /decideHomeownerEstimate\(est\.id,"accepted"\)/);
  assert.match(resident, /decideHomeownerEstimate\(est\.id,"rejected"\)/);
  assert.match(resident, /listDocuments\(\)/);
  assert.match(resident, /getDocumentUrl\(document\.id,document\.storage_path\)/);
  assert.match(resident, /appointment_date/);
  assert.match(resident, /homeowner-portal\/resources/);
  assert.match(resident, /hlc-portal-workspace is-resident/);
});

test("professional portal preserves company links offer decisions appointments documents and Resources access", () => {
  assert.match(professional, /getContractorPortalData\(\)/);
  assert.match(professional, /decideContractorAssignment\(assignment\.id,"accepted"\)/);
  assert.match(professional, /decideContractorAssignment\(assignment\.id,"rejected"\)/);
  assert.match(professional, /listDocuments\(\)/);
  assert.match(professional, /getDocumentUrl\(document\.id,document\.storage_path\)/);
  assert.match(professional, /appointment_date/);
  assert.match(professional, /contractor-portal\/resources/);
  assert.match(professional, /hlc-portal-workspace is-professional/);
});

test("partner portal exposes role-appropriate Resources without internal workspace access", () => {
  assert.match(partner, /partner-portal\/resources/);
  assert.match(partner, /Contact HomeLead Connect/);
  assert.doesNotMatch(partner, /\/resources\/playbook/);
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

test("account controls remain dark while role portals use the approved Dashboard Version A light authority", () => {
  assert.match(styles, /--acct-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-account-field-grid input,[\s\S]*background:var\(--acct-surface-soft\)/);
  assert.match(styles, /\.hlc-account-form-actions button,[\s\S]*background:#112744/);
  assert.match(styles, /Dashboard Version A portal authority/);
  assert.match(styles, /\.hlc-portal-workspace\{[^}]*--acct-surface:#ffffff[^}]*--acct-text:#172033/);
  assert.match(styles, /\.hlc-portal-workspace \.hlc-portal-header\{[^}]*background:#fff[^}]*border:1px solid #e2e8f0/);
  assert.match(styles, /\.hlc-portal-workspace \.hlc-portal-row\{[^}]*background:#fff/);
});
