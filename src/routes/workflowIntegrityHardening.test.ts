import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const estimatesApi = readFileSync("src/api/estimates.ts", "utf8");
const jobsApi = readFileSync("src/api/jobs.ts", "utf8");
const jobsPage = readFileSync("src/pages/dashboard/Jobs.tsx", "utf8");
const jobCard = readFileSync("src/components/jobs/JobCard.tsx", "utf8");
const migration = readFileSync(
  "supabase/migrations/20260831042000_workflow_integrity_hardening.sql",
  "utf8",
);

test("LeadScope saves use one transactional RPC instead of header/delete/line browser writes", () => {
  assert.match(estimatesApi, /rpc\("save_estimate_with_lines"/);
  assert.doesNotMatch(estimatesApi, /from\("estimate_lines"\)\s*\.delete/);
  assert.doesNotMatch(estimatesApi, /from\("estimate_lines"\)\s*\.insert/);
  assert.match(migration, /create or replace function public\.save_estimate_with_lines/i);
  assert.match(migration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(migration, /delete from public\.estimate_lines[\s\S]*insert into public\.estimate_lines/i);
});

test("canonical job status changes go through the authorized lifecycle RPC", () => {
  assert.match(jobsApi, /rpc\("transition_crm_job"/);
  assert.doesNotMatch(jobsApi, /from\("crm_jobs"\)\s*\.update/);
  assert.match(migration, /v_role not in \('owner', 'manager'\)/i);
  assert.match(migration, /ja\.status = 'accepted'/i);
  assert.match(migration, /a\.status in \('scheduled', 'completed'\)/i);
  assert.match(migration, /a\.status = 'completed'/i);
  assert.match(migration, /drop policy if exists crm_jobs_update_workspace_members/i);
  assert.match(migration, /insert into public\.activity_log/i);
});

test("job UI exposes lifecycle changes only to manager or owner and only along allowed state edges", () => {
  assert.match(jobsPage, /account\.role === "owner" \|\| account\.role === "manager"/);
  assert.match(jobCard, /allowedJobStatusTransitions\(job\.status\)/);
  assert.doesNotMatch(jobCard, /\["pending", "active", "completed", "cancelled"\]/);
  assert.match(jobsApi, /pending: \["active", "cancelled"\]/);
  assert.match(jobsApi, /active: \["completed", "cancelled"\]/);
  assert.match(jobsApi, /completed: \[\]/);
  assert.match(jobsApi, /cancelled: \[\]/);
});

test("browser estimate mutations are closed after the atomic RPC boundary is installed", () => {
  for (const policy of [
    "estimates_insert_workspace_members",
    "estimates_update_workspace_members",
    "estimates_delete_workspace_members",
    "estimate_lines_insert_workspace_members",
    "estimate_lines_update_workspace_members",
    "estimate_lines_delete_workspace_members",
  ]) {
    assert.match(migration, new RegExp(`drop policy if exists ${policy}`, "i"));
  }
  assert.match(estimatesApi, /rpc\("set_estimate_status"/);
});
