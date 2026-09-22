import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const supabaseRuntime = readFileSync("src/lib/supabase.ts", "utf8");
const envExample = readFileSync(".env.example", "utf8");

test("consolidation backend targeting is explicit and non-production only", () => {
  assert.match(envExample, /VITE_SUPABASE_TARGET=/);
  assert.match(envExample, /Set to "consolidation" only on an isolated/i);
  assert.match(supabaseRuntime, /VITE_SUPABASE_TARGET/);
  assert.match(supabaseRuntime, /envSupabaseTarget === "consolidation"/);
  assert.match(supabaseRuntime, /!isHostedHlcRuntime\(\) && envSupabaseTarget === "consolidation"/);
  assert.match(supabaseRuntime, /https:\/\/lvpouzxqojgmmmzbnnwv\.supabase\.co/);
  assert.match(supabaseRuntime, /sb_publishable_vkEYuHYM7y1GJaf2ZRpMzg_tBJUBo7p/);
});

test("production and existing reconciliation preview remain pinned by default", () => {
  assert.match(supabaseRuntime, /host === "app\.homeleadconnect\.org"/);
  assert.match(supabaseRuntime, /hostedProductionUrl/);
  assert.match(supabaseRuntime, /e3IsolatedPreviewUrl/);
  assert.match(supabaseRuntime, /homeleadconnect-web\.pages\.dev/);
  assert.match(supabaseRuntime, /\? hostedProductionUrl[\s\S]*: isConsolidationRuntime\(\)/);
  assert.match(supabaseRuntime, /: isCloudflarePreviewRuntime\(\)[\s\S]*\? e3IsolatedPreviewUrl/);
});

test("runtime exposes its selected backend class for truthful diagnostics", () => {
  for (const target of ["production", "consolidation", "reconciliation", "environment"]) {
    assert.match(supabaseRuntime, new RegExp(`"${target}"`));
  }
});
