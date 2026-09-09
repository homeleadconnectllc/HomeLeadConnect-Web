import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260909220500_fix_resident_provider_match_activity_log.sql", import.meta.url),
  "utf8",
);

test("Resident provider-match activity logging uses canonical lead UUIDs", () => {
  assert.ok(migration.includes("create or replace function public.create_resident_provider_match"));
  assert.ok(migration.includes("create or replace function public.homeowner_decide_provider_match"));
  assert.equal(migration.match(/select l\.id_uuid into v_lead_uuid/g)?.length, 2);
  assert.ok(migration.includes("values(v_workspace,'lead',v_lead_uuid,'resident.match.proposed'"));
  assert.ok(migration.includes("values(v_match.workspace_id,'lead',v_lead_uuid,'resident.match.'||lower(p_decision)"));
  assert.equal(migration.includes("p_lead_id::text"), false);
  assert.equal(migration.includes("v_match.lead_id::text"), false);
});
