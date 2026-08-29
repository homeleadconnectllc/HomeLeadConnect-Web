import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { professionalUsageAudit } from "../config/professionalUsageAudit.ts";

const portal = fs.readFileSync(new URL("../pages/portal/ContractorPortal.tsx", import.meta.url), "utf8");
const profile = fs.readFileSync(new URL("../pages/portal/ContractorProfile.tsx", import.meta.url), "utf8");
const services = fs.readFileSync(new URL("../pages/portal/ContractorPortalServices.tsx", import.meta.url), "utf8");
const router = fs.readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");
const workspaceLayout = fs.readFileSync(new URL("../layouts/WorkspaceLayout.tsx", import.meta.url), "utf8");

test("professional dashboard prioritizes real next actions and portal-safe tools", () => {
  assert.match(portal, /resolveProfessionalNextStep/);
  assert.match(portal, /WHAT'S NEXT/);
  assert.match(portal, /Review your work offer/);
  assert.match(portal, /Prepare for scheduled work/);
  assert.match(portal, /Keep your work profile ready/);
  assert.match(portal, /to="\/contractor-portal\/documents">Documents/);
});

test("professional profile and setup stay inside portal authorization", () => {
  assert.match(profile, /to="\/contractor-portal\/documents">Documents/);
  assert.doesNotMatch(profile, /to="\/documents">Documents/);
  assert.match(profile, /Continue to services & availability/);
  assert.match(services, /Currently accepting HLC work/);
  assert.match(services, /Save availability/);
});

test("professional usage audit does not certify internal workspace pages as provider-safe", () => {
  const service = professionalUsageAudit.find((row) => row.stage === "Service");
  const performance = professionalUsageAudit.find((row) => row.stage === "Performance");
  assert.equal(service?.status, "partial");
  assert.equal(service?.gap, "missing_completion_state");
  assert.equal(performance?.status, "blocked");
  assert.equal(performance?.gap, "broken_handoff");
  assert.match(router, /<Route element=\{<WorkspaceLayout\/>\}>/);
  assert.match(workspaceLayout, /if \(resolution\.destination !== "\/dashboard"\) return <Navigate/);
});

test("professional lifecycle audit covers the canonical provider journey", () => {
  assert.deepEqual(professionalUsageAudit.map((row) => row.stage), [
    "Onboard",
    "Availability",
    "Opportunity",
    "Service",
    "Performance",
  ]);
});
