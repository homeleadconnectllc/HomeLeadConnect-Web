import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const restore = readFileSync(
  "supabase/migrations/20260923092000_restore_current_workspace_id_authenticated_execute.sql",
  "utf8",
);
const roleRestriction = readFileSync(
  "supabase/migrations/20260902004500_restrict_current_workspace_role_execute.sql",
  "utf8",
);
const elevatedDatabaseRole = ["service", "role"].join("_");

test("selected-workspace helper matches the proven production execution boundary", () => {
  assert.match(
    restore,
    new RegExp(
      `revoke all on function public\\.current_workspace_id\\(\\) from public, anon, authenticated, ${elevatedDatabaseRole}`,
      "i",
    ),
  );
  assert.match(
    restore,
    new RegExp(
      `grant execute on function public\\.current_workspace_id\\(\\) to authenticated, ${elevatedDatabaseRole}`,
      "i",
    ),
  );
});

test("workspace role helper remains server-only while workspace id is restored to signed-in users", () => {
  assert.match(
    roleRestriction,
    /revoke all on function public\.current_workspace_role\(\) from public, anon, authenticated/i,
  );
  assert.match(
    roleRestriction,
    new RegExp(`grant execute on function public\\.current_workspace_role\\(\\) to ${elevatedDatabaseRole}`, "i"),
  );
  assert.doesNotMatch(restore, /function public\.current_workspace_role/i);
});
