import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260902002500_membership_role_authority_hardening.sql",
  "utf8",
);

const privilegedMutationFunctions = [
  "create_lead_if_under_limit",
  "create_partner_source",
  "create_partner_source_by_email",
  "create_resident_job_payment_request",
  "create_resident_provider_match",
  "perform_dashboard_action",
  "record_operations_exception_disposition",
  "run_hlc_automation",
  "run_hlc_scheduled_workflow_scan",
  "set_contractor_verification",
  "set_partner_referral_status",
  "transition_crm_job",
];

test("selected workspace is a pointer while membership supplies authority", () => {
  assert.match(migration, /create or replace function public\.current_workspace_id\(\)/i);
  assert.match(migration, /from public\.profiles p\s+join public\.workspace_members wm/i);
  assert.match(migration, /wm\.workspace_id = p\.workspace_id/i);
  assert.match(migration, /wm\.user_id = p\.user_id/i);
  assert.match(migration, /create or replace function public\.current_workspace_role\(\)/i);
  assert.match(migration, /select lower\(coalesce\(wm\.role, ''\)\)/i);
});

test("workspace owner helper trusts membership role, not cached profile role", () => {
  assert.match(migration, /create or replace function public\.hlc_is_workspace_owner\(p_workspace_id uuid\)/i);
  assert.match(migration, /from public\.workspace_members wm/i);
  assert.match(migration, /lower\(coalesce\(wm\.role, ''\)\) = 'owner'/i);
});

test("launch-critical mutating RPCs are explicitly hardened", () => {
  for (const functionName of privilegedMutationFunctions) {
    assert.match(
      migration,
      new RegExp(`create or replace function public\\.${functionName}\\(`, "i"),
      `${functionName} must be redefined by the authority-hardening migration`,
    );
  }
});

test("authority-hardening migration never authorizes from profiles.role", () => {
  assert.doesNotMatch(migration, /p\.role/i);
  assert.doesNotMatch(migration, /profiles[^;]*role/i);
  assert.match(migration, /lower\(coalesce\(wm\.role/gi);
});

test("target-workspace mutations authorize against that workspace membership", () => {
  assert.match(
    migration,
    /create_lead_if_under_limit[\s\S]*wm\.workspace_id = p_workspace_id[\s\S]*wm\.user_id = \(select auth\.uid\(\)\)[\s\S]*wm\.role/i,
  );
  assert.match(
    migration,
    /perform_dashboard_action[\s\S]*wm\.workspace_id=v_lead\.workspace_id[\s\S]*wm\.user_id=\(select auth\.uid\(\)\)[\s\S]*wm\.role/i,
  );
  assert.match(
    migration,
    /transition_crm_job[\s\S]*from public\.workspace_members wm[\s\S]*wm\.workspace_id=v_job\.workspace_id/i,
  );
});
