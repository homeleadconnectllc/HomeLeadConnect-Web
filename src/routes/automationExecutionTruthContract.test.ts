import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260923065504_harden_automation_execution_truth.sql", "utf8");
const api = readFileSync("src/api/automations.ts", "utf8");
const page = readFileSync("src/pages/dashboard/Automations.tsx", "utf8");
const elevatedDatabaseRole = ["service", "role"].join("_");

test("automation attempts preserve durable success and failure evidence", () => {
  assert.match(migration, /create table if not exists public\.automation_job_attempts/i);
  assert.match(migration, /unique \(automation_job_id, attempt_number\)/i);
  assert.match(migration, /status='failed',error_message=v_error,completed_at=now\(\)/i);
  assert.match(migration, /automation\.attempt_failed/i);
  assert.match(migration, /automation\.retry_exhausted/i);
  assert.match(migration, /automation\.succeeded/i);
});

test("caught execution failures return truthful state instead of rolling back their evidence", () => {
  assert.match(migration, /begin[\s\S]*compute_hlc_automation_result[\s\S]*exception when others/i);
  assert.match(migration, /status',case when v_exhausted then 'failed' else 'retry_wait' end/i);
  assert.match(migration, /'error','Automation attempt failed\.'/i);
});

test("duplicate triggers do not execute a second attempt", () => {
  assert.match(migration, /where j\.workspace_id=v_workspace_id and j\.idempotency_key=p_idempotency_key/i);
  assert.match(migration, /'duplicate',true/i);
  assert.match(migration, /insert into public\.automation_jobs[\s\S]*idempotency_key/i);
});

test("retry is explicit, bounded and reuses the canonical job", () => {
  assert.match(migration, /create or replace function public\.retry_hlc_automation\(p_job_id uuid\)/i);
  assert.match(migration, /if v_job\.status<>'retry_wait'/i);
  assert.match(migration, /v_job\.retry_count>=v_job\.max_attempts/i);
  assert.match(api, /retry_hlc_automation/);
  assert.match(page, /Retry safely/);
  assert.match(page, /Attempt \{attempt\.attempt_number\}/);
});

test("automation history is restricted to management and browser writes remain RPC-only", () => {
  assert.match(migration, /lower\(coalesce\(wm\.role,''\)\) in \('owner','manager'\)/i);
  assert.match(migration, /revoke all on table public\.automation_jobs from public, anon, authenticated/i);
  assert.match(migration, /grant select on table public\.automation_jobs to authenticated/i);
  assert.match(migration, new RegExp(`revoke all on function internal\\.execute_hlc_automation_attempt\\(uuid\\) from public,anon,authenticated,${elevatedDatabaseRole}`, "i"));
});
