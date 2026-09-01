import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { MATERIAL_STATES, RESOURCE_TRUTH_BOUNDARY, SUPPLIER_RESOURCES } from "../data/resourceCatalog.ts";

const router=readFileSync(new URL("./AppRouter.tsx",import.meta.url),"utf8");
const page=readFileSync(new URL("../pages/dashboard/ResourcesWorkspace.tsx",import.meta.url),"utf8");
const data=readFileSync(new URL("../lib/resourceData.ts",import.meta.url),"utf8");
const migration=readFileSync(new URL("../../supabase/migrations/20260901203000_resources_sourcing_runtime.sql",import.meta.url),"utf8");
const css=readFileSync(new URL("../styles/e4-resources-sourcing.css",import.meta.url),"utf8");

test("E4 canonical resource routes are protected by the workspace boundary",()=>{const boundary=router.indexOf("<Route element={<WorkspaceLayout/>}>");for(const route of ["/resources","/resources/materials","/resources/suppliers","/resources/suppliers/map"]) assert.ok(router.indexOf(`path="${route}"`)>boundary);});
test("supplier cards require honest external verification",()=>{assert.equal(RESOURCE_TRUTH_BOUNDARY.livePriceData,false);assert.equal(RESOURCE_TRUTH_BOUNDARY.liveInventoryData,false);assert.ok(SUPPLIER_RESOURCES.every((item)=>item.summary&&item.website.startsWith("https://")&&item.locator.startsWith("https://")&&item.evidence));assert.match(page,/Check current price & availability/);assert.match(page,/official locator/);assert.doesNotMatch(page,/In stock|Best price|nearest store/i);});
test("material lifecycle is exact and persistence is RPC-only",()=>{assert.deepEqual(MATERIAL_STATES,["needed","considering","purchased","on_site","used","returned"]);assert.match(data,/supabase\.rpc\("resource_set_saved"/);assert.match(data,/supabase\.rpc\("resource_save_material_item"/);assert.doesNotMatch(data,/from\("(?:resource_saves|material_plan_items)"\)\.insert/);});
test("E4 RLS and RPCs fail closed by authenticated owner",()=>{assert.match(migration,/enable row level security/g);assert.match(migration,/user_id = \(select auth\.uid\(\)\)/);assert.match(migration,/security definer set search_path to ''/);assert.match(migration,/revoke all on function[\s\S]*from public,anon,authenticated/);assert.match(migration,/grant execute[\s\S]*to authenticated/);assert.match(migration,/wm\.user_id=v_user_id/);});
test("E4 preserves mobile and accessibility controls",()=>{assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/overflow-x:auto/);assert.match(css,/min-height:48px/);assert.match(page,/aria-pressed/);assert.match(page,/role="status"/);assert.match(page,/DION GUIDANCE/);});
