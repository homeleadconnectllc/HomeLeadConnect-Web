import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationFiles = readdirSync("supabase/migrations").filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
const stagedUnpromotedFiles = [
  "20260829112000_phase3_external_user_backend_contracts.sql",
  "20260829124500_partner_portal_referrals.sql",
  "20260829130000_partner_management_lookup.sql",
  "20260829133000_phase3_external_user_performance_indexes.sql",
  "20260830234000_harden_partner_management_membership.sql",
  "20260831042000_workflow_integrity_hardening.sql",
  "20260901131500_community_member_relationship_foundation.sql",
  "20260901142500_community_private_messenger.sql",
  "20260901144500_community_rpc_privilege_hardening.sql",
  "20260901163000_academy_progress_runtime.sql",
  "20260901193000_connect_roleplay_runtime.sql",
  "20260901203000_resources_sourcing_runtime.sql",
  "20260904031500_resident_capability_and_leadscope_projects.sql",
];
const productionPlanFiles = migrationFiles.filter((name) => !stagedUnpromotedFiles.includes(name));
const plan = readFileSync("supabase/RELEASE_MIGRATION_PLAN.md", "utf8");
const plannedFiles = [...plan.matchAll(/^\d+\. `([^`]+\.sql)`$/gm)].map((match) => match[1]);

test("production release plan lists every production migration exactly once and in filename order", () => {
  assert.deepEqual(plannedFiles, productionPlanFiles);
  assert.equal(new Set(plannedFiles).size, plannedFiles.length);
});

test("unpromoted migrations remain explicitly staged until promotion is authorized", () => {
  for (const file of stagedUnpromotedFiles) assert.ok(migrationFiles.includes(file), `${file} is missing`);
  for (const file of stagedUnpromotedFiles) assert.ok(!plannedFiles.includes(file), `${file} must not enter the production release plan before promotion approval`);
});

test("phase 3 external-user foreign keys have covering indexes before promotion", () => {
  const migration = readFileSync(
    "supabase/migrations/20260829133000_phase3_external_user_performance_indexes.sql",
    "utf8",
  );
  for (const indexName of [
    "resident_provider_matches_lead_id_idx",
    "resident_provider_matches_contractor_id_idx",
    "resident_job_payments_job_id_idx",
    "provider_job_progress_job_id_idx",
    "provider_job_progress_contractor_id_idx",
  ]) assert.match(migration, new RegExp(indexName, "i"));
});

test("all pending SQL migrations are non-empty", () => {
  for (const file of migrationFiles) {
    assert.ok(readFileSync(`supabase/migrations/${file}`, "utf8").trim().length > 0, `${file} is empty`);
  }
});

test("LeadScope migration keeps participant entitlement separate from workspace billing and enforces resident ownership", () => {
  const migration = readFileSync(
    "supabase/migrations/20260904031500_resident_capability_and_leadscope_projects.sql",
    "utf8",
  );
  assert.match(migration, /create table if not exists public\.portal_capability_entitlements/i);
  assert.match(migration, /create or replace function public\.has_portal_capability\(p_workspace_id uuid/i);
  assert.match(migration, /e\.workspace_id = p_workspace_id/i);
  assert.match(migration, /from public\.workspace_members wm/i);
  assert.match(migration, /create table if not exists public\.leadscope_projects/i);
  assert.match(migration, /references public\.resident_properties\(id\)/i);
  assert.match(migration, /user_id = \(select auth\.uid\(\)\)/i);
  assert.match(migration, /public\.has_portal_capability\(workspace_id,'resident','leadscope'\)/i);
  assert.match(migration, /LeadScope project identity mismatch/i);
  assert.doesNotMatch(migration, /workspace_plan_status|public\.subscriptions|estimate_lines|public\.estimates/i);
});

test("Community Matching updates retain authenticated ownership and workspace membership", () => {
  const migration = readFileSync(
    "supabase/migrations/20260817110528_enforce_community_match_update_ownership.sql",
    "utf8",
  );

  assert.match(migration, /for update\s+to authenticated/i);
  assert.match(migration, /with check\s*\([\s\S]*user_id\s*=\s*\(select auth\.uid\(\)\)/i);
  assert.match(migration, /with check\s*\([\s\S]*from public\.workspace_members/i);
  assert.match(migration, /with check\s*\([\s\S]*from public\.contractors/i);
});

test("Community Matching policies and foreign keys remain advisor-ready", () => {
  const migration = readFileSync(
    "supabase/migrations/20260817111337_optimize_community_match_rls_and_indexes.sql",
    "utf8",
  );

  assert.match(migration, /community_match_decisions_contractor_id_idx/i);
  assert.match(migration, /community_match_decisions_user_id_idx/i);
  assert.doesNotMatch(migration, /(?<!select )auth\.uid\(\)/i);
  assert.equal((migration.match(/to authenticated/gi) ?? []).length, 3);
});

test("internal lead creation preserves the single-writer and tenant boundary", () => {
  const migration = readFileSync(
    "supabase/migrations/20260818124500_internal_workspace_lead_creation.sql",
    "utf8",
  );

  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path to ''/i);
  assert.match(migration, /from public\.workspace_members/i);
  assert.match(migration, /wm\.workspace_id = v_workspace_id/i);
  assert.match(migration, /wm\.user_id = v_user_id/i);
  assert.match(migration, /v_role not in \('owner', 'manager', 'technician'\)/i);
  assert.match(migration, /public\.can_insert_lead\(v_workspace_id\)/i);
  assert.match(migration, /causal\.ingest_lead\(/i);
  assert.match(migration, /revoke all on function public\.create_workspace_lead[\s\S]*from public, anon/i);
  assert.match(migration, /grant execute on function public\.create_workspace_lead[\s\S]*to authenticated/i);
  assert.doesNotMatch(migration, /grant\s+insert\s+on\s+(table\s+)?public\.leads/i);
});

test("internal lead upsert fix keeps required insert defaults non-null", () => {
  const migration = readFileSync(
    "supabase/migrations/20260818131500_fix_internal_workspace_lead_upsert_defaults.sql",
    "utf8",
  );

  assert.match(migration, /p_priority\s*=>\s*'medium'/i);
  assert.match(migration, /p_archived\s*=>\s*false/i);
  assert.doesNotMatch(migration, /p_priority\s*=>\s*case[\s\S]*else\s+null/i);
  assert.doesNotMatch(migration, /p_archived\s*=>\s*case[\s\S]*else\s+null/i);
  assert.match(migration, /causal\.ingest_lead\(/i);
  assert.doesNotMatch(migration, /grant\s+insert\s+on\s+(table\s+)?public\.leads/i);
});

test("causal lead writer keeps locked search path and schema-qualified pgcrypto", () => {
  const migration = readFileSync(
    "supabase/migrations/20260818133000_schema_qualify_causal_lead_digest.sql",
    "utf8",
  );

  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path to 'public'/i);
  assert.match(migration, /extensions\.digest\(/i);
  assert.doesNotMatch(migration, /(?<!extensions\.)digest\(/i);
  assert.match(migration, /from public\.workspace_members/i);
  assert.match(migration, /insert into causal\.leads_state/i);
});

test("canonical new-lead status migration fixes only the historical uppercase NEW variant", () => {
  const migration = readFileSync(
    "supabase/migrations/20260822124500_canonicalize_new_lead_status.sql",
    "utf8",
  );

  assert.match(migration, /update public\.leads[\s\S]*set status = 'new'[\s\S]*where status = 'NEW'/i);
  assert.match(migration, /add constraint leads_status_no_uppercase_new/i);
  assert.match(migration, /status is null or status <> 'NEW'/i);
  assert.doesNotMatch(migration, /set status = lower\(status\)/i);
  assert.doesNotMatch(migration, /lower\(status\).*check/i);
});

test("job lifecycle keeps linked leads booked or closed without regressing completed work", () => {
  const migration = readFileSync(
    "supabase/migrations/20260822133000_sync_job_and_lead_lifecycle.sql",
    "utf8",
  );

  assert.match(migration, /update public\.leads[\s\S]*set stage = 'new'[\s\S]*where stage = 'NEW'/i);
  assert.match(migration, /add constraint leads_stage_no_uppercase_new/i);
  assert.match(migration, /create or replace function internal\.sync_lead_lifecycle_from_job\(\)/i);
  assert.match(migration, /security definer[\s\S]*set search_path to ''/i);
  assert.match(migration, /revoke all on function internal\.sync_lead_lifecycle_from_job\(\) from public, anon, authenticated/i);
  assert.match(migration, /after insert or update of status, lead_id, workspace_id on public\.crm_jobs/i);
  assert.match(migration, /new\.status = 'completed'[\s\S]*v_target_state := 'closed'/i);
  assert.match(migration, /new\.status in \('pending', 'active'\)[\s\S]*v_target_state := 'booked'/i);
  assert.match(migration, /not exists \([\s\S]*completed_job[\s\S]*status = 'completed'/i);
  assert.doesNotMatch(migration, /set status = lower\(status\)/i);
});
