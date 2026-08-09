import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateEvidenceQuality,
  createEvidence,
  createPropertyIntelligenceProfile,
  determineQualificationReadiness,
  determineSiteAssessment,
} from "./domain.ts";

test("known evidence", () => {
  const result = createEvidence("123 Main St", "known");

  assert.equal(result.state, "known");
  assert.equal(result.value, "123 Main St");
});

test("unknown evidence", () => {
  const result = createEvidence(null, "unknown");

  assert.equal(result.state, "unknown");
  assert.equal(result.value, null);
});

test("assumption evidence", () => {
  const result = createEvidence("residential", "assumption");

  assert.equal(result.state, "assumption");
});

test("unverifiable evidence", () => {
  const result = createEvidence(null, "unverifiable");

  assert.equal(result.state, "unverifiable");
});

test("evidence quality", () => {
  const result = calculateEvidenceQuality([
    createEvidence("known", "known"),
    createEvidence(null, "unknown"),
    createEvidence("assumed", "assumption"),
    createEvidence(null, "unverifiable"),
  ]);

  assert.equal(result.total, 4);
  assert.equal(result.known, 1);
  assert.equal(result.unknown, 1);
  assert.equal(result.assumption, 1);
  assert.equal(result.unverifiable, 1);
  assert.equal(result.knownRatio, 0.25);
});

test("empty site evidence is undetermined", () => {
  assert.equal(determineSiteAssessment([]), "undetermined");
});

test("unknown evidence means insufficient site evidence", () => {
  assert.equal(
    determineSiteAssessment([
      createEvidence("known", "known"),
      createEvidence(null, "unknown"),
    ]),
    "insufficient_evidence",
  );
});

test("unverifiable evidence means insufficient site evidence", () => {
  assert.equal(
    determineSiteAssessment([
      createEvidence("known", "known"),
      createEvidence(null, "unverifiable"),
    ]),
    "insufficient_evidence",
  );
});

test("all known evidence supports site assessment", () => {
  assert.equal(
    determineSiteAssessment([
      createEvidence("known", "known"),
      createEvidence("known", "known"),
    ]),
    "supported",
  );
});

test("empty qualification evidence is undetermined", () => {
  assert.equal(
    determineQualificationReadiness([]),
    "undetermined",
  );
});

test("unresolved evidence is not ready", () => {
  assert.equal(
    determineQualificationReadiness([
      createEvidence("known", "known"),
      createEvidence(null, "unknown"),
    ]),
    "not_ready",
  );
});

test("all known evidence reaches domain review readiness", () => {
  assert.equal(
    determineQualificationReadiness([
      createEvidence("known", "known"),
      createEvidence("known", "known"),
    ]),
    "ready_for_domain_review",
  );
});

test("property intelligence profile derives states", () => {
  const profile = createPropertyIntelligenceProfile({
    leadId: "lead-1",
    workspaceId: "workspace-1",
    propertyAddress: createEvidence("123 Main St", "known"),
    propertyType: createEvidence("Residential", "known"),
    measurements: createEvidence(
      { livingAreaSqFt: 1800 },
      "known",
    ),
    siteConditions: createEvidence(
      "Exterior conditions observed",
      "assumption",
    ),
    scopeDescription: createEvidence(
      "Roof replacement",
      "known",
    ),
  });

  assert.equal(profile.leadId, "lead-1");
  assert.equal(profile.workspaceId, "workspace-1");
  assert.equal(profile.siteAssessment, "supported");
  assert.equal(
    profile.qualificationReadiness,
    "ready_for_domain_review",
  );
});
