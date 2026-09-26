import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const read = (path: string) => fs.readFileSync(path, "utf8");

test("system build tracker is mounted as an owner-only HQ route", () => {
  const router = read("src/routes/AppRouter.tsx");
  const policy = read("src/lib/accessPolicy.ts");
  const page = read("src/pages/dashboard/SystemBuildTracker.tsx");

  assert.match(router, /SystemBuildTracker/);
  assert.match(router, /path="\/hq\/build-tracker"/);
  assert.match(policy, /"\/hq\/build-tracker"/);
  assert.match(page, /HCX System Build Tracker/);
  assert.match(page, /Checklist completion only/);
});

test("tracker keeps completion separate from readiness and exposes owner-decision workflow", () => {
  const config = read("src/config/systemBuildTracker.ts");
  const page = read("src/pages/dashboard/SystemBuildTracker.tsx");

  assert.match(config, /completion:/);
  assert.match(config, /readiness:/);
  assert.match(config, /Owner Decision/);
  assert.match(config, /Approve Recommendation/);
  assert.match(config, /Merge \/ Promote Approved/);
  assert.match(config, /reusableForClientBuilds/);

  assert.match(page, /Work continues while pending/);
  assert.match(page, /Server-backed decision persistence will be/);
  assert.match(page, /do not themselves merge/);
});

test("tracker does not pretend local owner choices are production authority", () => {
  const page = read("src/pages/dashboard/SystemBuildTracker.tsx");

  assert.match(page, /stores the selection only on this device as a draft/);
  assert.match(page, /does not merge/);
  assert.match(page, /mutate production/);
});
