import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationFiles = readdirSync("supabase/migrations").filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
const plan = readFileSync("supabase/RELEASE_MIGRATION_PLAN.md", "utf8");
const plannedFiles = [...plan.matchAll(/^\d+\. `([^`]+\.sql)`$/gm)].map((match) => match[1]);

test("release plan lists every local launch migration exactly once and in filename order", () => {
  assert.deepEqual(plannedFiles, migrationFiles);
  assert.equal(new Set(plannedFiles).size, plannedFiles.length);
});

test("all pending SQL migrations are non-empty", () => {
  for (const file of migrationFiles) {
    assert.ok(readFileSync(`supabase/migrations/${file}`, "utf8").trim().length > 0, `${file} is empty`);
  }
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
