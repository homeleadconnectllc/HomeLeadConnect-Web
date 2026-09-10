import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dispatcher = readFileSync("supabase/functions/dispatch-internal-notification/index.ts", "utf8");
const migration = readFileSync("supabase/migrations/20260909010000_internal_notification_routing.sql", "utf8");
const helper = readFileSync("src/api/internalNotifications.ts", "utf8");
const resident = readFileSync("src/api/publicIntake.ts", "utf8");
const professionals = readFileSync("src/api/professionalApplications.ts", "utf8");
const partners = readFileSync("src/api/partners.ts", "utf8");
const messages = readFileSync("src/api/messages.ts", "utf8");
const appointments = readFileSync("src/api/appointments.ts", "utf8");
const followUps = readFileSync("src/api/followUps.ts", "utf8");
const jobs = readFileSync("src/api/jobs.ts", "utf8");

test("internal email routing is centralized and server-side", () => {
  assert.match(dispatcher, /INTERNAL_ALERT_INTAKE_EMAIL/);
  assert.match(dispatcher, /INTERNAL_ALERT_OPERATIONS_EMAIL/);
  assert.match(dispatcher, /INTERNAL_ALERT_SUPPORT_EMAIL/);
  assert.match(dispatcher, /HomeLeadConnect@gmail\.com/);
  assert.match(dispatcher, /Admin\.HomeLeadConnect@gmail\.com/);
  assert.match(dispatcher, /XbGraphicDesigns@gmail\.com/);
  assert.doesNotMatch(resident, /@gmail\.com/i);
  assert.doesNotMatch(professionals, /@gmail\.com/i);
  assert.doesNotMatch(partners, /@gmail\.com/i);
  assert.doesNotMatch(messages, /@gmail\.com/i);
  assert.doesNotMatch(appointments, /@gmail\.com/i);
  assert.doesNotMatch(followUps, /@gmail\.com/i);
  assert.doesNotMatch(jobs, /@gmail\.com/i);
});

test("delivery ledger is server-only and idempotent", () => {
  assert.match(migration, /unique \(event_type, event_key\)/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all on table public\.internal_notification_deliveries from anon, authenticated/i);
  assert.match(migration, /grant all on table public\.internal_notification_deliveries to service_role/i);
  assert.match(dispatcher, /eq\("event_type", eventType\)\.eq\("event_key", eventKey\)/);
  assert.match(dispatcher, /existing\?\.status === "sent" \|\| existing\?\.status === "sending"/);
  assert.match(dispatcher, /"Idempotency-Key": `internal:\$\{eventType\}:\$\{eventKey\}`/);
});

test("business APIs emit only after canonical writes succeed and never await internal email", () => {
  assert.match(resident, /if \(error\) throw error;[\s\S]*void dispatchInternalNotification/);
  assert.match(professionals, /if \(error\) throw error;[\s\S]*void dispatchInternalNotification/);
  assert.match(partners, /if\(error\)throw error;[\s\S]*void dispatchInternalNotification/);
  assert.match(appointments, /if \(error\) throw error;[\s\S]*void dispatchInternalNotification/);
  assert.match(followUps, /if \(error\) throw error;[\s\S]*void dispatchInternalNotification/);
  assert.match(jobs, /if \(error\) throw error;[\s\S]*void dispatchInternalNotification/);
  assert.match(helper, /Best-effort internal alert dispatch/);
  assert.match(helper, /catch \(error\)[\s\S]*console\.warn/);
});

test("Resident and Professional public alerts require canonical request verification", () => {
  assert.match(resident, /verificationToken: input\.requestId/);
  assert.match(professionals, /verificationToken: input\.requestId/);
  assert.match(dispatcher, /clean\(lead\.request_id\) !== verificationToken/);
  assert.match(dispatcher, /clean\(lead\.source\) !== "public_website"/);
  assert.match(dispatcher, /clean\(application\.request_id\) !== verificationToken/);
  assert.match(dispatcher, /clean\(application\.status\) !== "submitted"/);
});

test("locked event families map to their intended internal lanes", () => {
  assert.match(resident, /eventType: "resident_request\.created"/);
  assert.match(professionals, /eventType: "professional_application\.created"/);
  assert.match(partners, /eventType:"partner_referral\.created"/);
  assert.match(messages, /eventType: "message\.incoming"/);
  assert.match(appointments, /eventType: "appointment\.scheduled"/);
  assert.match(appointments, /eventType: "appointment\.rescheduled"/);
  assert.match(appointments, /"appointment\.cancelled"/);
  assert.match(appointments, /"appointment\.no_show"/);
  assert.match(followUps, /eventType: "follow_up\.created"/);
  assert.match(jobs, /eventType: "job\.status_changed"/);
});

test("message routing suppresses HomeLead Connect's own outbound/internal replies", () => {
  assert.match(dispatcher, /workspace_members/);
  assert.match(dispatcher, /if \(membership\) return json\(200, \{ skipped: true, reason: "internal_sender" \}\)/);
  assert.match(messages, /sendPortalEmail[\s\S]*send-communication/);
});

test("appointment and follow-up noise controls match the sprint", () => {
  assert.doesNotMatch(appointments, /eventType: "appointment\.completed"/);
  assert.match(appointments, /if \(status === "cancelled" \|\| status === "no_show"\)/);
  assert.doesNotMatch(followUps, /completeFollowUp[\s\S]*dispatchInternalNotification/);
});

test("Professional approval and applicant invitation path remains intact", () => {
  assert.match(professionals, /approve_professional_application/);
  assert.match(professionals, /select\("email"\)/);
  assert.match(professionals, /supabase\.auth\.signInWithOtp/);
  assert.match(professionals, /email: intendedEmail/);
});
