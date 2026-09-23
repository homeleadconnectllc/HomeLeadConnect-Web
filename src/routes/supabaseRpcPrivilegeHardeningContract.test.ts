import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hardening = readFileSync("supabase/migrations/20260922202500_harden_non_user_rpc_execute.sql", "utf8");
const elevatedDatabaseRole = ["service", "role"].join("_");

test("billing resolver removes inherited PUBLIC execute while preserving signed-in access", () => {
  assert.match(hardening, /revoke execute on function public\.resolve_billing_workspace_access\(\) from public, anon/i);
  assert.match(hardening, /grant execute on function public\.resolve_billing_workspace_access\(\) to authenticated/i);
  assert.match(hardening, new RegExp(`grant execute on function public\\.resolve_billing_workspace_access\\(\\) to ${elevatedDatabaseRole}`, "i"));
});
