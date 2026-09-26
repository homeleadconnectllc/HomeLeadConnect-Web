import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260923134940_harden_communication_action_time_truth.sql", "utf8");
const sender = readFileSync("supabase/functions/send-communication/index.ts", "utf8");
const resend = readFileSync("supabase/functions/resend-webhook/index.ts", "utf8");
const twilio = readFileSync("supabase/functions/twilio-webhook/index.ts", "utf8");
const settings = readFileSync("src/components/settings/CommunicationPolicySettings.tsx", "utf8");
const manual = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const elevatedDatabaseRole = ["service", "role"].join("_");

test("action-time policy snapshots business hours and quiet hours on every compliance decision", () => {
  assert.match(migration, /create table public\.communication_action_policies/i);
  assert.match(migration, /within_business_hours/i);
  assert.match(migration, /within_quiet_hours/i);
  assert.match(migration, /quiet_hours_active/i);
  assert.match(migration, /outside_business_hours/i);
  assert.match(migration, /email_marketing_consent_not_proven/i);
});

test("provider delivery has durable bounded attempts rather than queue-state assumptions", () => {
  assert.match(migration, /create table public\.communication_delivery_attempts/i);
  assert.match(migration, /unique\(transmission_id,attempt_number\)/i);
  assert.match(migration, /status=case when v_terminal then 'failed' else 'retry_wait' end/i);
  assert.match(migration, /interval '1 minute'\*power\(2/i);
  assert.match(sender, /begin_communication_delivery_attempt/);
  assert.match(sender, /complete_communication_delivery_attempt/);
});

test("provider callbacks are idempotent evidence and update CRM history separately from notifications", () => {
  assert.match(migration, /record_communication_provider_outcome/i);
  assert.match(migration, /communication_provider_events%rowtype/i);
  assert.match(migration, /communication_'\|\|lower\(p_outcome\)/i);
  assert.match(migration, /notification_type,title,body,related_entity_type/i);
  assert.match(migration, /communication_failed/i);
  assert.match(resend, /record_communication_provider_outcome/);
  assert.match(twilio, /record_communication_provider_outcome/);
});

test("browser users can read governed evidence but provider mutation remains server-only", () => {
  assert.match(migration, /communication_delivery_attempts_internal_select/i);
  assert.match(migration, /lower\(wm\.role\) in \('owner','manager'\)/i);
  assert.match(migration, new RegExp(`grant execute on function public\\.begin_communication_delivery_attempt\\(uuid\\) to ${elevatedDatabaseRole}`, "i"));
  assert.match(migration, /revoke all on function public\.begin_communication_delivery_attempt\(uuid\) from public,anon,authenticated/i);
});

test("organization settings and manual presentation expose the policy without treating it as delivery", () => {
  assert.match(settings, /Every outbound attempt will evaluate this policy again at action time/);
  assert.match(settings, /Personal preferences cannot weaken them/);
  assert.match(manual, /Review required/);
  assert.match(manual, /quiet-hours window is active/i);
});
