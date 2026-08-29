import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { residentUsageAudit } from "../config/residentUsageAudit.ts";

const portal = fs.readFileSync(new URL("../pages/portal/HomeownerPortal.tsx", import.meta.url), "utf8");
const sections = fs.readFileSync(new URL("../pages/portal/HomeownerPortalSection.tsx", import.meta.url), "utf8");

test("resident overview always exposes a real next action instead of a dead-end dashboard", () => {
  assert.match(portal, /resolveResidentNextStep/);
  assert.match(portal, /to="\/request-service">New request/);
  assert.match(portal, /WHAT'S NEXT/);
  assert.match(portal, /Review your estimate/);
  assert.match(portal, /Review your provider match/);
  assert.match(portal, /Payment needs attention/);
  assert.match(portal, /Share your completed-service review/);
  assert.match(portal, /Your visit is scheduled/);
  assert.match(portal, /Track your active service/);
});

test("resident request appointment and job sections keep contextual handoffs visible", () => {
  assert.match(sections, /to="\/request-service">New request/);
  assert.match(sections, /Message about this visit/);
  assert.match(sections, /Open appointments/);
  assert.match(sections, /<strong>Next:<\/strong>/);
  assert.match(sections, /Add information/);
});

test("resident qualification completion is conservative and evidence-backed", () => {
  const qualify = residentUsageAudit.find((row) => row.stage === "Qualify");
  assert.equal(qualify?.status, "connected");
  assert.equal(qualify?.gap, undefined);
  assert.match(sections, /function resolveQualificationState/);
  assert.match(sections, /relationship\.estimates\.length > 0 \|\| relationship\.jobs\.length > 0/);
  assert.match(sections, /Information review complete/);
  assert.match(sections, /Information review in progress/);
});

test("resident completed jobs expose a truthful completion and issue path", () => {
  const complete = residentUsageAudit.find((row) => row.stage === "Complete");
  assert.equal(complete?.status, "connected");
  assert.equal(complete?.gap, undefined);
  assert.match(sections, /job\.status === "completed"/);
  assert.match(sections, /Service complete/);
  assert.match(sections, /Report an issue with this service/);
  assert.match(sections, /without silently changing the recorded job status/);
});

test("resident candidate closes match payment review and referral inside portal authority", () => {
  for (const stage of ["Match", "Payment", "Review", "Referral / Repeat"]) {
    const row = residentUsageAudit.find((item) => item.stage === stage);
    assert.equal(row?.status, "connected", `${stage} should be connected in the candidate`);
    assert.equal(row?.gap, undefined);
  }
  assert.match(portal, /getHomeownerPortalMatches/);
  assert.match(portal, /decideHomeownerProviderMatch/);
  assert.match(portal, /createResidentJobCheckout/);
  assert.match(portal, /createHomeownerReview/);
  assert.match(portal, /createHomeownerReferral/);
  assert.doesNotMatch(portal, /to="\/matching"|to="\/community\/reviews"|to="\/community\/referrals"/);
});

test("resident lifecycle audit covers every canonical stage exactly once", () => {
  assert.deepEqual(residentUsageAudit.map((row) => row.stage), [
    "Request", "Qualify", "Estimate", "Match", "Schedule", "Job", "Complete", "Payment", "Review", "Referral / Repeat",
  ]);
  assert.ok(residentUsageAudit.every((row) => row.status === "connected"));
});
