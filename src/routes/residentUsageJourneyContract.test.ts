import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { residentUsageAudit } from "../config/residentUsageAudit.ts";

const portal = fs.readFileSync(new URL("../pages/portal/HomeownerPortal.tsx", import.meta.url), "utf8");
const sections = fs.readFileSync(new URL("../pages/portal/HomeownerPortalSection.tsx", import.meta.url), "utf8");
const router = fs.readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");
const workspaceLayout = fs.readFileSync(new URL("../layouts/WorkspaceLayout.tsx", import.meta.url), "utf8");

test("resident overview always exposes a real next action instead of a dead-end dashboard", () => {
  assert.match(portal, /resolveResidentNextStep/);
  assert.match(portal, /to="\/request-service">New request/);
  assert.match(portal, /WHAT'S NEXT/);
  assert.match(portal, /Review your estimate/);
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

test("usage audit does not misclassify internal workspace routes as resident-safe", () => {
  const match = residentUsageAudit.find((row) => row.stage === "Match");
  const review = residentUsageAudit.find((row) => row.stage === "Review");
  const referral = residentUsageAudit.find((row) => row.stage === "Referral / Repeat");
  assert.equal(match?.status, "blocked");
  assert.equal(match?.gap, "broken_handoff");
  assert.equal(review?.status, "blocked");
  assert.equal(review?.gap, "broken_handoff");
  assert.equal(referral?.status, "partial");
  assert.equal(referral?.gap, "broken_handoff");
  assert.match(router, /<Route element=\{<WorkspaceLayout\/>\}>/);
  assert.match(workspaceLayout, /if \(resolution\.destination !== "\/dashboard"\) return <Navigate/);
});

test("resident lifecycle audit covers every canonical stage exactly once", () => {
  assert.deepEqual(residentUsageAudit.map((row) => row.stage), [
    "Request",
    "Qualify",
    "Estimate",
    "Match",
    "Schedule",
    "Job",
    "Complete",
    "Payment",
    "Review",
    "Referral / Repeat",
  ]);
});
