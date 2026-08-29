import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { professionalUsageAudit } from "../config/professionalUsageAudit.ts";

const portal = fs.readFileSync(new URL("../pages/portal/ContractorPortal.tsx", import.meta.url), "utf8");
const profile = fs.readFileSync(new URL("../pages/portal/ContractorProfile.tsx", import.meta.url), "utf8");
const services = fs.readFileSync(new URL("../pages/portal/ContractorPortalServices.tsx", import.meta.url), "utf8");

test("professional dashboard prioritizes real next actions and portal-safe tools", () => {
  assert.match(portal, /resolveProfessionalNextStep/);
  assert.match(portal, /WHAT'S NEXT/);
  assert.match(portal, /Complete provider verification/);
  assert.match(portal, /Review your work offer/);
  assert.match(portal, /Prepare for scheduled work/);
  assert.match(portal, /Update active work/);
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

test("professional candidate closes verification service and performance without internal workspace authority", () => {
  for (const stage of ["Onboard", "Availability", "Opportunity", "Service", "Performance"]) {
    const row = professionalUsageAudit.find((item) => item.stage === stage);
    assert.equal(row?.status, "connected", `${stage} should be connected in the candidate`);
    assert.equal(row?.gap, undefined);
  }
  assert.match(portal, /getLinkedProviderVerification/);
  assert.match(portal, /recordContractorJobProgress/);
  assert.match(portal, /getLinkedProviderPerformance/);
  assert.match(portal, /Provider progress is evidence only/);
  assert.doesNotMatch(portal, /to="\/jobs"|to="\/analytics"|to="\/community\/reviews"/);
});

test("professional lifecycle audit covers the canonical provider journey", () => {
  assert.deepEqual(professionalUsageAudit.map((row) => row.stage), ["Onboard", "Availability", "Opportunity", "Service", "Performance"]);
  assert.ok(professionalUsageAudit.every((row) => row.status === "connected"));
});
