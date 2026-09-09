import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const migration = fs.readFileSync(
  new URL("../../supabase/migrations/20260909215000_fix_professional_progress_activity_log.sql", import.meta.url),
  "utf8",
);

test("professional progress logs the job UUID without coercing activity_log.entity_id to text", () => {
  assert.match(migration, /insert into public\.activity_log\(workspace_id,entity_type,entity_id,event_type,payload\)/);
  assert.match(migration, /'job',\s*v_assignment\.job_id,\s*'provider\.progress\.'\|\|p_status/);
  assert.doesNotMatch(migration, /v_assignment\.job_id::text/);
});

test("professional progress repair preserves existing authorization and accepted-assignment guards", () => {
  assert.match(migration, /v_assignment\.status <> 'accepted'/);
  assert.match(migration, /public\.contractor_portal_links/);
  assert.match(migration, /cpl\.user_id=auth\.uid\(\)/);
  assert.match(migration, /cpl\.revoked_at is null/);
  assert.match(migration, /security definer/);
  assert.match(migration, /set search_path to ''/);
});
