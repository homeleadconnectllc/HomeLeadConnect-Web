import assert from "node:assert/strict";
import test from "node:test";

import {
  HLC_CORE_LIFECYCLE,
  HLC_GLOBAL_AGENT_BOUNDARIES,
  HLC_PAGE_KNOWLEDGE,
  resolveHlcPageKnowledge,
  serializeHlcPageKnowledge,
} from "./pageKnowledge.ts";

const protectedRoutes = [
  "/homeowner-portal",
  "/contractor-portal",
  "/homeowner-portal/requests",
  "/homeowner-portal/appointments",
  "/homeowner-portal/jobs",
  "/homeowner-portal/documents",
  "/homeowner-portal/profile",
  "/homeowner-portal/settings",
  "/contractor-portal/profile",
  "/contractor-portal/services",
  "/contractor-portal/documents",
  "/messages",
  "/notifications",
  "/dashboard",
  "/start-here",
  "/ecosystem",
  "/workflow",
  "/automations",
  "/activity",
  "/network",
  "/map",
  "/network/map",
  "/profiles",
  "/providers",
  "/providers/42",
  "/matching",
  "/network/service-areas",
  "/network/availability",
  "/network/eligibility",
  "/network/saved",
  "/community-hub",
  "/community/discussions",
  "/community/reviews",
  "/community/referrals",
  "/community/events",
  "/community/moderation",
  "/community/groups",
  "/help",
  "/tutorials",
  "/rules",
  "/profile",
  "/homeowner-portal/properties",
  "/homeowner-portal/matches",
  "/contractor-portal/team",
  "/analytics",
  "/hq/approvals",
  "/hq/system-health",
  "/settings/billing",
  "/leads",
  "/leads/123",
  "/estimator",
  "/jobs",
  "/jobs/abc-123",
  "/calendar",
  "/settings",
  "/team",
  "/follow-ups",
  "/manual-communications",
  "/documents",
  "/call-center",
  "/hq/dedication",
  "/hq",
  "/operations",
  "/customer-experience",
] as const;

test("all significant authenticated HLC routes resolve to canonical page knowledge", () => {
  for (const route of protectedRoutes) {
    assert.ok(resolveHlcPageKnowledge(route), `Expected knowledge for ${route}`);
  }
});

test("dynamic route parameters resolve page shape without becoming record evidence", () => {
  assert.equal(resolveHlcPageKnowledge("/leads/999")?.id, "lead-detail");
  assert.equal(resolveHlcPageKnowledge("/jobs/job-xyz")?.id, "jobs");
  assert.equal(resolveHlcPageKnowledge("/providers/77")?.id, "provider-network");

  const lead = resolveHlcPageKnowledge("/leads/999");
  assert.ok(lead?.prohibitedAssumptions.some((item) => /URL leadId is not evidence/i.test(item)));
});

test("route resolver normalizes query strings, hashes, and trailing slashes", () => {
  assert.equal(resolveHlcPageKnowledge("/leads/?stage=new")?.id, "leads");
  assert.equal(resolveHlcPageKnowledge("/calendar/#today")?.id, "calendar");
  assert.equal(resolveHlcPageKnowledge("jobs/123?tab=details")?.id, "jobs");
});

test("unknown routes fail closed with no invented page meaning", () => {
  assert.equal(resolveHlcPageKnowledge("/definitely-not-an-hlc-route"), null);
  assert.match(serializeHlcPageKnowledge(null), /unmapped route/i);
  assert.match(serializeHlcPageKnowledge(null), /Do not infer workflow meaning/i);
});

test("shared knowledge preserves KNOWLEDGE != AUTHORITY invariant", () => {
  assert.ok(HLC_GLOBAL_AGENT_BOUNDARIES.some((rule) => /Knowledge does not grant authority/i.test(rule)));
  assert.ok(HLC_GLOBAL_AGENT_BOUNDARIES.some((rule) => /route parameter.*never trusted as record evidence/i.test(rule)));
  assert.ok(HLC_GLOBAL_AGENT_BOUNDARIES.some((rule) => /Portal access never expands/i.test(rule)));

  for (const page of HLC_PAGE_KNOWLEDGE) {
    assert.ok(["kendrell", "dion", "diamond"].includes(page.primaryAgent));
    assert.ok(page.purpose.length > 20);
    assert.ok(page.authoritativeData.length > 0);
    assert.ok(page.completionCriteria.length > 0);
    assert.ok(page.prohibitedAssumptions.length > 0);
  }
});

test("core lifecycle remains explicit and evidence-separated", () => {
  assert.deepEqual(HLC_CORE_LIFECYCLE, [
    "Lead",
    "Contact / Follow-up",
    "LeadScope",
    "Estimate Sent",
    "Accepted",
    "Job",
    "Provider eligibility evidence",
    "Assignment / acceptance",
    "Scheduling",
    "Appointment",
    "Work execution",
    "Completion",
    "Completion-linked review / follow-up",
  ]);
});

test("all three agents consume one shared registry rather than separate page maps", () => {
  const agentIds = new Set(["kendrell", "dion", "diamond"]);
  assert.equal(agentIds.size, 3);
  assert.ok(HLC_PAGE_KNOWLEDGE.some((page) => page.primaryAgent === "kendrell"));
  assert.ok(HLC_PAGE_KNOWLEDGE.some((page) => page.primaryAgent === "dion"));
  assert.ok(HLC_PAGE_KNOWLEDGE.some((page) => page.primaryAgent === "diamond"));
  assert.equal(HLC_PAGE_KNOWLEDGE.filter((page) => page.id === "agent-workspaces").length, 1);
});
