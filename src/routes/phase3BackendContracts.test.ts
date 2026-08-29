import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(new URL("../../supabase/migrations/20260829112000_phase3_external_user_backend_contracts.sql", import.meta.url), "utf8");

test("phase 3 creates separate portal-safe records instead of weakening internal RLS", () => {
  for (const table of ["resident_provider_matches", "resident_job_payments", "provider_job_progress", "operations_exception_dispositions"]) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`));
    assert.match(migration, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated`));
  }
  assert.doesNotMatch(migration, /disable row level security/i);
});

test("resident matching is portal-linked and does not auto-assign providers", () => {
  assert.match(migration, /get_homeowner_portal_matches/);
  assert.match(migration, /homeowner_decide_provider_match/);
  assert.match(migration, /homeowner_portal_links/);
  assert.doesNotMatch(migration, /insert into public\.job_assignments[\s\S]{0,600}homeowner_decide_provider_match/);
});

test("resident payment stays separate from workspace subscription billing", () => {
  assert.match(migration, /resident_job_payments/);
  assert.match(migration, /create_resident_job_payment_request/);
  assert.match(migration, /attach_resident_job_checkout/);
  assert.match(migration, /set_resident_job_payment_provider_state/);
  assert.doesNotMatch(migration, /(?:from|insert into|update|alter table|delete from) public\.subscriptions/i);
});

test("resident review and referral mutations require portal linkage", () => {
  assert.match(migration, /homeowner_create_review/);
  assert.match(migration, /list_homeowner_review_eligible_jobs/);
  assert.match(migration, /homeowner_create_referral/);
  assert.match(migration, /source_kind/);
  assert.match(migration, /source_lead_id/);
  assert.match(migration, /h\.user_id=auth\.uid\(\)/);
});

test("providers can report progress but cannot self-approve verification or rewrite canonical jobs", () => {
  assert.match(migration, /set_contractor_verification/);
  assert.match(migration, /v_role not in \('owner','manager','admin'\)/);
  assert.match(migration, /contractor_record_job_progress/);
  assert.match(migration, /provider_job_progress/);
  assert.match(migration, /does not directly rewrite crm_jobs/i);
  assert.doesNotMatch(migration, /update public\.crm_jobs[\s\S]{0,400}contractor_record_job_progress/);
});

test("operations exception completion is durable and explicit", () => {
  assert.match(migration, /record_operations_exception_disposition/);
  assert.match(migration, /'resolved','escalated','deferred'/);
  assert.match(migration, /source_type/);
  assert.match(migration, /source_id/);
  assert.match(migration, /affected_route/);
});
