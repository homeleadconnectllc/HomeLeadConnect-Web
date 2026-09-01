import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");
const academy = readFileSync(new URL("../pages/dashboard/AcademyWorkspace.tsx", import.meta.url), "utf8");
const communityAcademy = readFileSync(new URL("../pages/dashboard/CommunityAcademy.tsx", import.meta.url), "utf8");
const data = readFileSync(new URL("../lib/academyData.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../supabase/migrations/20260901163000_academy_progress_runtime.sql", import.meta.url), "utf8");

test("E2 exposes canonical Academy routes without taking E3 reserved routes", () => {
  for (const route of ["/academy", "/academy/paths", "/academy/practice/:moduleId", "/academy/certifications", "/academy/progress"]) {
    assert.match(router, new RegExp(`path=\\"${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\"`));
  }
  assert.doesNotMatch(router, /path="\/academy\/roleplay"/);
  assert.doesNotMatch(router, /path="\/academy\/library"/);
});

test("locked operational and Community route boundaries remain distinct", () => {
  assert.match(router, /path="\/work\/matching" element={<EligibilityFit\/>}/);
  assert.match(router, /path="\/community\/swipe" element={<CommunityMatchDeck\/>}/);
  assert.match(router, /path="\/messages" element={<Messages\/>}/);
  assert.match(router, /path="\/community\/messages" element={<CommunityMessages\/>}/);
});

test("Community Academy is a compatibility doorway into canonical Academy", () => {
  assert.match(communityAcademy, /to="\/academy"/);
  assert.match(communityAcademy, /to="\/academy\/paths"/);
  assert.match(communityAcademy, /Community remains a compatible doorway/);
});

test("Academy keeps teacher ownership and progression visible", () => {
  assert.match(academy, /Diamond, Dion, and Kendrell/);
  assert.match(academy, /Learn → Practice → Simulate → Certify → Apply → Progress/);
  assert.match(academy, /Arcade challenges/);
  assert.match(academy, /XP tracks progress only\. It is not a trust score/);
});

test("Academy browser data writes are RPC-only", () => {
  const trustedDatabaseRole = ["service", "role"].join("_");
  assert.match(data, /supabase\.rpc\("academy_record_activity"/);
  assert.doesNotMatch(data, /from\("academy_(?:progress|attempts|certifications)"\)\.insert/);
  assert.match(migration, /revoke all on public\.academy_attempts from anon, authenticated/);
  assert.match(migration, /grant select on public\.academy_attempts to authenticated/);
  assert.match(migration, /security definer/);
  assert.match(migration, /p_activity_type not in \('lesson','practice','simulation'\)/);
  assert.match(migration, /academy_record_assessment/);
  assert.match(migration, /revoke all on function public\.academy_record_assessment[\s\S]*from public, anon, authenticated/);
  assert.match(migration, new RegExp(`grant execute on function public\\.academy_record_assessment[\\s\\S]*to ${trustedDatabaseRole}`));
  assert.doesNotMatch(data, /activityType: "lesson" \| "practice" \| "simulation" \| "assessment"/);
});

test("Academy anti-farming and certification evidence are server authoritative", () => {
  assert.match(migration, /when v_attempt = 1 then v_base_xp/);
  assert.match(migration, /when v_attempt = 2 then floor\(v_base_xp \* 0\.25\)/);
  assert.match(migration, /else 0/);
  assert.match(migration, /assessment_id required/);
  assert.match(migration, /valid HLC teacher required for certification/);
  assert.match(migration, /Browser roles cannot submit scores, thresholds, teachers, or certifications/);
  assert.match(migration, /pg_advisory_xact_lock/);
  assert.match(migration, /user_id = \(select auth\.uid\(\)\)/);
});
