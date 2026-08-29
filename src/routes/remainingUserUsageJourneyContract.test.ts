import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { operationsUsageAudit } from "../config/operationsUsageAudit.ts";
import { customerExperienceUsageAudit } from "../config/customerExperienceUsageAudit.ts";
import { partnerUsageAudit } from "../config/partnerUsageAudit.ts";

const router = fs.readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");
const dashboard = fs.readFileSync(new URL("../pages/dashboard/Dashboard.tsx", import.meta.url), "utf8");
const settings = fs.readFileSync(new URL("../pages/dashboard/Settings.tsx", import.meta.url), "utf8");

test("operations journey has canonical work entry and truthful exception closure status", () => {
  assert.deepEqual(operationsUsageAudit.map((row) => [row.stage, row.status]), [
    ["Operate", "connected"],
    ["Exception", "partial"],
  ]);
  assert.equal(operationsUsageAudit.find((row) => row.stage === "Exception")?.gap, "missing_completion_state");
  for (const route of ["/leads", "/jobs", "/calendar", "/follow-ups", "/operations", "/automations", "/notifications"]) {
    assert.ok(router.includes(`path="${route}"`), `missing operations route ${route}`);
  }
});

test("customer experience journey keeps assistance and trust inside internal evidence-backed workspaces", () => {
  assert.deepEqual(customerExperienceUsageAudit.map((row) => [row.stage, row.status]), [
    ["Assist", "connected"],
    ["Trust", "connected"],
  ]);
  for (const route of ["/messages", "/network", "/community-hub", "/help", "/customer-experience", "/community/reviews", "/community/referrals", "/community/moderation"]) {
    assert.ok(router.includes(`path="${route}"`), `missing customer-experience route ${route}`);
  }
});

test("partner journey is not falsely certified through internal community tooling", () => {
  assert.deepEqual(partnerUsageAudit.map((row) => [row.stage, row.status]), [
    ["Refer", "partial"],
    ["Relationship", "blocked"],
  ]);
  assert.equal(partnerUsageAudit.find((row) => row.stage === "Refer")?.gap, "missing_entry");
  assert.equal(partnerUsageAudit.find((row) => row.stage === "Relationship")?.gap, "broken_handoff");
  assert.ok(router.includes('path="/request-service"'));
  assert.ok(router.includes('path="/professional-application"'));
  assert.ok(router.includes('path="/contact"'));
  assert.doesNotMatch(router, /path="\/partner(?:\/|")/);
});

test("owner and internal user homes continue to expose attention and truthful control state", () => {
  assert.match(dashboard, /Priority today/);
  assert.match(dashboard, /You’re caught up\./);
  assert.match(settings, /Workspace role remains server-controlled/);
  assert.match(settings, /Setup required/);
});
