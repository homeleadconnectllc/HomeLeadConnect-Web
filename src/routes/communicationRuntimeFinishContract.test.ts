import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260923151034_communication_runtime_finish_truth.sql", "utf8");
const sender = readFileSync("supabase/functions/send-communication/index.ts", "utf8");
const twilio = readFileSync("supabase/functions/twilio-webhook/index.ts", "utf8");
const voice = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const manualLog = readFileSync("supabase/migrations/20260812111500_manual_communication_transport_logging.sql", "utf8");
const proof = readFileSync("docs/sprints/HCX_COMMUNICATION_RUNTIME_FINISH_PROOF.sql", "utf8");

test("callbacks correlate to accepted attempts and preserve delivered state", () => {
  assert.match(migration, /a\.provider_reference=p_provider_reference[\s\S]*t\.provider_name=lower\(p_provider_name\)/);
  assert.match(migration, /if v_tx\.status='delivered' then[\s\S]*v_status:='delivered'/);
  assert.match(migration, /if v_tx\.provider_reference=p_provider_reference then/);
  assert.match(proof, /Late failure overwrote delivered/);
  assert.match(proof, /Callback replay changed state/);
});

test("due retries are server-only, rechecked under a row lock, and unknown outcomes require review", () => {
  assert.match(migration, /list_due_communication_retries[\s\S]*next_retry_at<=now\(\)/);
  assert.match(migration, /quarantine_stale_communication_attempts[\s\S]*PROVIDER_OUTCOME_UNKNOWN/);
  assert.match(migration, /dispatch_token[\s\S]*enabled boolean not null default false/);
  assert.match(migration, /revoke all on function public\.run_hlc_communication_retry_pickup\(\) from public,anon,authenticated/);
  assert.match(sender, /body\.transmissionId && !worker/);
  assert.match(sender, /list_due_communication_retries/);
  assert.match(sender, /begin_communication_delivery_attempt/);
  assert.match(proof, /Due retry worker did not enqueue exactly one pickup/);
});

test("ambiguous inbound never attaches a person and retains provider evidence and STOP suppression", () => {
  const stop = twilio.indexOf("Recipient opt-out keyword");
  const resolve = twilio.indexOf('admin.rpc("resolve_communication_subject"');
  assert.ok(stop > 0 && resolve > stop);
  assert.match(twilio, /unmatched_reason: subject\?\.status === "ambiguous" \? "ambiguous_contact"/);
  assert.match(migration, /alter table public\.communication_provider_events[\s\S]*unmatched_content text/);
  assert.match(proof, /Shared phone was attached to a subject/);
});

test("Google Voice remains an operator-reported manual handoff", () => {
  assert.match(voice, /transport=|google_voice/);
  assert.match(voice, /beginPendingManualCall/);
  assert.match(voice, /logManualCommunicationActivity/);
  assert.match(manualLog, /'manually_logged','operator_reported'/);
  assert.doesNotMatch(sender, /providerName === "google_voice" &&.*fetch/s);
});
