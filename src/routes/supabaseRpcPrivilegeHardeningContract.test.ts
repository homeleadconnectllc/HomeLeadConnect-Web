import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hardening = readFileSync("supabase/migrations/20260922202500_harden_non_user_rpc_execute.sql", "utf8");

test("billing resolver removes inherited PUBLIC execute while preserving signed-in access", () => {
  assert.match(hardening, /revoke execute on function public\.resolve_billing_workspace_access\(\) from public, anon/i);
  assert.match(hardening, /grant execute on function public\.resolve_billing_workspace_access\(\) to authenticated/i);
  assert.match(hardening, /grant execute on function public\.resolve_billing_workspace_access\(\) to service_role/i);
});

test("DDL event-trigger function is not exposed as a browser RPC", () => {
  assert.match(hardening, /revoke execute on function public\.rls_auto_enable\(\) from public, anon, authenticated, service_role/i);
});
