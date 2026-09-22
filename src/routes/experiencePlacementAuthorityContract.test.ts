import assert from "node:assert/strict";
import test from "node:test";
import {
  experiencePlacementAuthority,
  relationshipMatrix,
  experienceDomainsMustRemainDistinct,
} from "../config/experiencePlacementAuthority.ts";

test("every capability has one governed primary home and complete placement metadata", () => {
  const ids = new Set<string>();
  for (const item of experiencePlacementAuthority) {
    assert.ok(!ids.has(item.id), `duplicate placement id: ${item.id}`);
    ids.add(item.id);
    assert.ok(item.primaryHome.trim(), `${item.id} missing primary home`);
    assert.ok(item.permissionRule.trim(), `${item.id} missing permission rule`);
    assert.ok(item.mobileSurface.trim(), `${item.id} missing mobile surface`);
    assert.ok(item.workflowRelationship.trim(), `${item.id} missing workflow relationship`);
    assert.ok(item.action.trim(), `${item.id} missing reconciliation action`);
  }
});

test("placement authority prevents a feature-wall dashboard", () => {
  const dashboardPrimary = experiencePlacementAuthority.filter((item) => item.primaryHome === "/dashboard");
  assert.deepEqual(dashboardPrimary.map((item) => item.id), ["daily-attention"]);
  for (const forbidden of ["referrals","qr-system","statistics-analytics","manuals-scripts","appearance","growth-campaigns","rewards-credits"]) {
    assert.notEqual(experiencePlacementAuthority.find((item) => item.id === forbidden)?.primaryHome, "/dashboard");
  }
});

test("operational and community communication remain distinct", () => {
  const operational = experiencePlacementAuthority.find((item) => item.id === "operational-messages");
  const community = experiencePlacementAuthority.find((item) => item.id === "community-messages");
  assert.equal(operational?.primaryHome, "/messages");
  assert.equal(community?.primaryHome, "/community/messages");
  assert.notEqual(operational?.domain, community?.domain);
});

test("profile architecture separates private identity from canonical/public directory presentation", () => {
  const profile = experiencePlacementAuthority.find((item) => item.id === "member-profile");
  assert.equal(profile?.action, "SPLIT");
  assert.match(profile?.duplicateRisk ?? "", /different responsibilities/i);
});

test("relationship directions are explicit and asymmetric where authority differs", () => {
  const residentToPro = relationshipMatrix.find((item) => item.direction === "resident->professional");
  const proToResident = relationshipMatrix.find((item) => item.direction === "professional->resident");
  assert.equal(residentToPro?.serviceRequest, true);
  assert.equal(proToResident?.serviceRequest, false);
  assert.ok(residentToPro?.request.includes("Request Service"));
  assert.ok(proToResident?.request.includes("Respond to Request"));
  assert.equal(proToResident?.discovery, false);
});

test("community relationships never imply unrestricted private or CRM access", () => {
  for (const item of relationshipMatrix.filter((rule) => rule.direction.endsWith("->community") || rule.direction === "resident->resident")) {
    assert.notEqual(item.directMessage, "authorized");
    assert.notEqual(item.documentSharing, "record-scoped");
  }
});

test("experience domains that carry different authority stay explicitly separate", () => {
  assert.ok(experienceDomainsMustRemainDistinct.length >= 6);
  assert.ok(experienceDomainsMustRemainDistinct.some(([a,b]) => a === "messages" && b === "community"));
  assert.ok(experienceDomainsMustRemainDistinct.some(([a,b]) => a === "community" && b === "work"));
});
