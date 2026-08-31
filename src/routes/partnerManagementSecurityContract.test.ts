import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260830234000_harden_partner_management_membership.sql",
  "utf8",
);

function functionBody(name: string) {
  const marker = `function public.${name}`;
  const start = migration.indexOf(marker);
  assert.notEqual(start, -1, `${name} must be defined by the hardening migration`);
  const next = migration.indexOf("create or replace function public.", start + marker.length);
  return migration.slice(start, next === -1 ? migration.length : next);
}

test("partner management queue requires active workspace membership in addition to management role", () => {
  const body = functionBody("list_partner_management_queue");
  assert.match(body, /auth\.uid\(\) is null/);
  assert.match(body, /v_role not in \('owner','manager','admin'\)/);
  assert.match(body, /from public\.workspace_members wm/);
  assert.match(body, /wm\.workspace_id = v_workspace/);
  assert.match(body, /wm\.user_id = auth\.uid\(\)/);
  assert.match(body, /Workspace membership is required\./);
});

test("partner referral status mutation rejects stale profile authority without membership", () => {
  const body = functionBody("set_partner_referral_status");
  assert.match(body, /auth\.uid\(\) is null/);
  assert.match(body, /v_role not in \('owner','manager','admin'\)/);
  assert.match(body, /from public\.workspace_members wm/);
  assert.match(body, /wm\.workspace_id = v_workspace/);
  assert.match(body, /wm\.user_id = auth\.uid\(\)/);
  assert.match(body, /where id = p_referral_id\s+and workspace_id = v_workspace/);
});

test("operations exception history rejects stale management profile authority without membership", () => {
  const body = functionBody("list_operations_exception_dispositions");
  assert.match(body, /auth\.uid\(\) is null/);
  assert.match(body, /v_role not in \('owner','manager','admin'\)/);
  assert.match(body, /from public\.workspace_members wm/);
  assert.match(body, /wm\.workspace_id = v_workspace/);
  assert.match(body, /wm\.user_id = auth\.uid\(\)/);
  assert.match(body, /where d\.workspace_id = v_workspace/);
});
