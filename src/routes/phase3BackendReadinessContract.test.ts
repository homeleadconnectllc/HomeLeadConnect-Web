import assert from "node:assert/strict";
import test from "node:test";
import { phase3BackendReadiness } from "../config/phase3BackendReadiness.ts";

const byId = new Map(phase3BackendReadiness.map((item) => [item.id, item]));

test("production-ready contractor portal RPCs are not falsely classified as missing", () => {
  assert.equal(byId.get("contractor-portal-profile-setup")?.state, "ready");
  assert.match(byId.get("contractor-portal-profile-setup")?.productionEvidence || "", /get_linked_provider_profile/);
  assert.match(byId.get("contractor-portal-profile-setup")?.productionEvidence || "", /get_linked_provider_setup/);
});

test("external-user backend work remains explicitly classified until portal-authorized contracts exist", () => {
  for (const id of [
    "resident-provider-matching",
    "resident-job-payment",
    "resident-completion-review",
    "resident-referral",
    "professional-verification",
    "provider-job-progress",
    "provider-performance",
    "operations-exception-resolution",
  ]) {
    assert.equal(byId.get(id)?.state, "missing", `${id} must remain missing until its backend contract exists`);
  }
});

test("production community review workspace linkage is preserved rather than 'fixed' again", () => {
  const review = byId.get("community-review-workspace-linkage");
  assert.equal(review?.state, "hardening");
  assert.match(review?.productionEvidence || "", /j\.workspace_id = community_reviews\.workspace_id/);
  assert.match(review?.productionEvidence || "", /non-production reconciliation project/);
});
