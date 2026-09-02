import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { operationsUsageAudit } from "../config/operationsUsageAudit.ts";
import { customerExperienceUsageAudit } from "../config/customerExperienceUsageAudit.ts";
import { partnerUsageAudit } from "../config/partnerUsageAudit.ts";

const router = fs.readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");
const dashboard = fs.readFileSync(new URL("../pages/dashboard/Dashboard.tsx", import.meta.url), "utf8");
const settings = fs.readFileSync(new URL("../pages/dashboard/Settings.tsx", import.meta.url), "utf8");
const followUps = fs.readFileSync(new URL("../api/followUps.ts", import.meta.url), "utf8");
const notifications = fs.readFileSync(new URL("../api/notifications.ts", import.meta.url), "utf8");
const automations = fs.readFileSync(new URL("../api/automations.ts", import.meta.url), "utf8");
const operationsExceptions = fs.readFileSync(new URL("../api/operationsExceptions.ts", import.meta.url), "utf8");
const partners = fs.readFileSync(new URL("../api/partners.ts", import.meta.url), "utf8");

test("operations journey has canonical work entry and durable candidate exception closure", () => {
  assert.deepEqual(operationsUsageAudit.map((row) => [row.stage, row.status]), [
    ["Operate", "connected"],
    ["Exception", "connected"],
  ]);
  assert.equal(operationsUsageAudit.find((row) => row.stage === "Exception")?.gap, undefined);
  for (const route of ["/leads", "/jobs", "/calendar", "/follow-ups", "/operations", "/automations", "/notifications"]) {
    assert.ok(router.includes(`path="${route}"`), `missing operations route ${route}`);
  }
});

test("operations exception audit distinguishes disposition acknowledgement and execution outcomes", () => {
  const exception = operationsUsageAudit.find((row) => row.stage === "Exception");
  assert.match(followUps, /status: "completed"/);
  assert.match(followUps, /completed_at/);
  assert.match(notifications, /markNotificationRead/);
  assert.match(automations, /"succeeded"/);
  assert.match(automations, /"failed"/);
  assert.match(automations, /"blocked"/);
  assert.match(operationsExceptions, /record_operations_exception_disposition/);
  assert.match(exception?.evidence || "", /read state remains acknowledgement rather than resolution/i);
  assert.match(exception?.correction || "", /Keep disposition separate from source-system truth/i);
  assert.match(exception?.correction || "", /preserve the affected-record deep link/i);
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

test("partner journey uses dedicated external entry and partner-scoped relationship status", () => {
  assert.deepEqual(partnerUsageAudit.map((row) => [row.stage, row.status]), [
    ["Refer", "connected"],
    ["Relationship", "connected"],
  ]);
  assert.equal(partnerUsageAudit.find((row) => row.stage === "Refer")?.gap, undefined);
  assert.equal(partnerUsageAudit.find((row) => row.stage === "Relationship")?.gap, undefined);
  assert.ok(router.includes('path="/partners"'));
  assert.ok(router.includes('path="/partner-portal"'));
  assert.match(partners, /get_partner_portal_data/);
  assert.match(partners, /partner_create_referral/);
});

test("owner and internal user homes continue to expose attention, schedule, and truthful control state", () => {
  assert.match(dashboard, /Needs attention/);
  assert.match(dashboard, /<h2 id="hlc-home-today-title">Today<\/h2>/);
  assert.match(dashboard, /You’re caught up\./);
  assert.match(settings, /Workspace role remains server-controlled/);
  assert.match(settings, /Setup required/);
});
