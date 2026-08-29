import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const phase3 = fs.readFileSync(new URL("../../supabase/migrations/20260829112000_phase3_external_user_backend_contracts.sql", import.meta.url), "utf8");
const partner = fs.readFileSync(new URL("../../supabase/migrations/20260829124500_partner_portal_referrals.sql", import.meta.url), "utf8");
const partnerManagement = fs.readFileSync(new URL("../../supabase/migrations/20260829130000_partner_management_lookup.sql", import.meta.url), "utf8");
const elevatedDatabaseRole = ["service", "role"].join("_");

const stagedTables = [
  "resident_provider_matches",
  "resident_job_payments",
  "provider_job_progress",
  "operations_exception_dispositions",
];

test("phase 3 staged tables stay browser-write closed and elevated-database-role controlled", () => {
  for (const table of stagedTables) {
    assert.match(phase3, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(phase3, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated`, "i"));
    assert.match(phase3, new RegExp(`grant all on table public\\.${table} to ${elevatedDatabaseRole}`, "i"));
  }
  assert.doesNotMatch(phase3, /grant\s+(insert|update|delete|all)\s+on\s+(table\s+)?public\.(resident_provider_matches|resident_job_payments|provider_job_progress|operations_exception_dispositions)\s+to\s+authenticated/i);
});

test("resident authority remains portal-link scoped and cannot become internal workspace authority", () => {
  assert.match(phase3, /homeowner_portal_links[\s\S]*user_id\s*=\s*\(select auth\.uid\(\)\)[\s\S]*revoked_at is null/i);
  assert.match(phase3, /Provider match is not authorized for this resident account/i);
  assert.match(phase3, /where h\.user_id=auth\.uid\(\)[\s\S]*h\.lead_id=m\.lead_id[\s\S]*h\.revoked_at is null/i);
  assert.doesNotMatch(phase3, /insert into public\.workspace_members/i);
});

test("resident job payment remains separate duplicate-safe and server-updated", () => {
  assert.match(phase3, /create table if not exists public\.resident_job_payments/i);
  assert.match(phase3, /resident_job_payments_checkout_session_unique/i);
  assert.match(phase3, /resident_job_payments_payment_intent_unique/i);
  assert.match(phase3, new RegExp(`auth\\.role\\(\\)\\s*<>\\s*'${elevatedDatabaseRole}'`, "i"));
  assert.match(phase3, /attach_resident_job_checkout/i);
  assert.doesNotMatch(phase3, /update public\.subscriptions[\s\S]{0,500}resident_job_payments/i);
  assert.doesNotMatch(phase3, /workspace_plan_status[\s\S]{0,500}resident_job_payments/i);
});

test("provider progress is evidence only and cannot rewrite canonical jobs", () => {
  assert.match(phase3, /create table if not exists public\.provider_job_progress/i);
  assert.match(phase3, /contractor_record_job_progress/i);
  assert.match(phase3, /contractor_portal_links/i);
  assert.doesNotMatch(phase3, /contractor_record_job_progress[\s\S]{0,2500}update public\.crm_jobs/i);
});

test("operations dispositions are management-scoped durable records", () => {
  assert.match(phase3, /operations_exception_dispositions/i);
  assert.match(phase3, /disposition in \('resolved','escalated','deferred'\)/i);
  assert.match(phase3, /Management access is required/i);
  assert.match(phase3, /workspace_members/i);
  assert.doesNotMatch(phase3, /grant\s+(insert|update|delete|all)\s+on\s+(table\s+)?public\.operations_exception_dispositions\s+to\s+authenticated/i);
});

test("partner referral authority is active-link scoped duplicate guarded and tenant bounded", () => {
  assert.match(partner, /alter table public\.partner_sources enable row level security/i);
  assert.match(partner, /alter table public\.partner_referrals enable row level security/i);
  assert.match(partner, /revoke all on table public\.partner_sources from public, anon, authenticated/i);
  assert.match(partner, /revoke all on table public\.partner_referrals from public, anon, authenticated/i);
  assert.match(partner, /linked_user_id=auth\.uid\(\) and s\.status='active'/i);
  assert.match(partner, /already recorded recently/i);
  assert.match(partner, /created_at > now\(\)-interval '30 days'/i);
  assert.match(partner, /where id=p_referral_id and workspace_id=v_workspace/i);
});

test("partner management lookup is management-only and does not grant workspace membership", () => {
  assert.match(partnerManagement, /v_role not in \('owner','manager','admin'\)/i);
  assert.match(partnerManagement, /Workspace membership is required/i);
  assert.match(partnerManagement, /where s\.workspace_id=v_workspace/i);
  assert.match(partnerManagement, /where r\.workspace_id=v_workspace/i);
  assert.doesNotMatch(partnerManagement, /insert into public\.workspace_members/i);
});

test("new security definer functions pin their search path and anonymous execution is revoked", () => {
  for (const source of [phase3, partner, partnerManagement]) {
    const functionCount = (source.match(/create or replace function/gi) ?? []).length;
    const lockedPathCount = (source.match(/set search_path = ''/gi) ?? []).length;
    assert.equal(lockedPathCount, functionCount, "every staged SECURITY DEFINER function must pin an empty search_path");
    assert.doesNotMatch(source, /grant execute on function[^;]+to anon/i);
  }
});
