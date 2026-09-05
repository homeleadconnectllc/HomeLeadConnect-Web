import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pendingPath = "supabase/pending/20260905183000_align_analytics_membership_role_authority.sql";

test("analytics management wrappers use workspace membership role authority", () => {
  const sql = readFileSync(pendingPath, "utf8");

  assert.match(sql, /public\.current_workspace_id\(\)/i);
  assert.match(sql, /public\.current_workspace_role\(\)/i);
  assert.match(sql, /v_role not in \('owner','manager'\)/i);
  assert.doesNotMatch(sql, /select p\.workspace_id[\s\S]*p\.role[\s\S]*from public\.profiles/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path to ''/i);
  assert.match(sql, /revoke all on function public\.get_hlc_analytics_summary\(integer\) from public, anon/i);
  assert.match(sql, /grant execute on function public\.get_hlc_analytics_summary\(integer\) to authenticated, service_role/i);
  assert.match(sql, /revoke all on function public\.get_hlc_business_kpis\(integer\) from public, anon/i);
  assert.match(sql, /revoke all on function public\.get_hlc_growth_summary\(integer\) from public, anon/i);
});
