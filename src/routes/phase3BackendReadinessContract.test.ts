import assert from "node:assert/strict";
import test from "node:test";
import { phase3BackendReadiness } from "../config/phase3BackendReadiness.ts";

const byId = new Map(phase3BackendReadiness.map((item) => [item.id, item]));

test("production-ready contractor portal RPCs are not falsely classified as missing", () => {
  assert.equal(byId.get("contractor-portal-profile-setup")?.state, "ready");
  assert.match(byId.get("contractor-portal-profile-setup")?.productionEvidence || "", /get_linked_provider_profile/);
  assert.match(byId.get("contractor-portal-profile-setup")?.productionEvidence || "", /get_linked_provider_setup/);
});

test("external-user backend contracts are candidate-ready without claiming production promotion", () => {
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
    const contract = byId.get(id);
    assert.equal(contract?.state, "ready", `${id} must be candidate-ready after rehearsal verification`);
    assert.match(contract?.nextAction || "", /promot/i, `${id} must still require an explicit production-promotion step`);
  }
  assert.match(byId.get("resident-provider-matching")?.productionEvidence || "", /Production does not yet contain/i);
  assert.match(byId.get("resident-job-payment")?.productionEvidence || "", /Production subscription billing remains separate and unchanged/i);
});

test("production community review workspace linkage is preserved rather than 'fixed' again", () => {
  const review = byId.get("community-review-workspace-linkage");
  assert.equal(review?.state, "hardening");
  assert.match(review?.productionEvidence || "", /j\.workspace_id = community_reviews\.workspace_id/);
  assert.match(review?.productionEvidence || "", /non-production reconciliation project/);
});
