import assert from "node:assert/strict";
import test from "node:test";

import { evaluateBillingAccess, resolveEntitlementState } from "./entitlement.ts";
import { chooseEntitledWorkspaceRecovery, hasVerifiedWorkspaceAccess } from "./workspaceRecovery.ts";

test("billing disabled does not gate workspace routes", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: false, pathname: "/jobs", isActive: null, verificationFailed: false }), "allowed");
});

test("webhook-confirmed active entitlement allows workspace access", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/jobs", status: "active", isActive: true, verificationFailed: false }), "allowed");
});

test("unentitled workspace is gated", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/jobs", isActive: false, verificationFailed: false }), "subscription_required");
});

test("billing verification failure is not mislabeled as unentitled", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/jobs", isActive: null, verificationFailed: true }), "verification_unavailable");
});

test("settings remains available for billing recovery", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/settings", isActive: false, verificationFailed: true }), "allowed");
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/settings/billing", isActive: false, verificationFailed: true }), "allowed");
});

test("Stripe-backed subscription states map to five truthful entitlement states", () => {
  assert.equal(resolveEntitlementState({ billingEnabled: true, pathname: "/jobs", status: "trialing", isActive: true, verificationFailed: false }), "full_trial_preview");
  assert.equal(resolveEntitlementState({ billingEnabled: true, pathname: "/jobs", status: "active", isActive: true, verificationFailed: false }), "full_paid_access");
  assert.equal(resolveEntitlementState({ billingEnabled: true, pathname: "/jobs", status: "past_due", isActive: true, verificationFailed: false }), "limited_mode");
  assert.equal(resolveEntitlementState({ billingEnabled: true, pathname: "/jobs", status: "canceled", isActive: false, verificationFailed: false }), "membership_gate");
  assert.equal(resolveEntitlementState({ billingEnabled: true, pathname: "/jobs", status: null, isActive: null, verificationFailed: true }), "verification_unavailable");
});

test("unknown active provider status fails down to limited mode", () => {
  assert.equal(resolveEntitlementState({ billingEnabled: true, pathname: "/jobs", status: "provider_pending", isActive: true, verificationFailed: false }), "limited_mode");
});

test("selected-workspace recovery accepts only webhook-confirmed active trial or live grace access", () => {
  const now = new Date("2026-09-04T15:00:00Z");
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "active", status: "active", is_active: true }, now), true);
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "trial", status: "trialing", is_active: true }, now), true);
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "grace", status: "past_due", is_active: true, grace_period_end: "2026-09-05T15:00:00Z" }, now), true);
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "expired", status: "past_due", is_active: true, grace_period_end: "2026-09-03T15:00:00Z" }, now), false);
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "canceled", status: "canceled", is_active: true }, now), false);
  assert.equal(hasVerifiedWorkspaceAccess({ workspace_id: "inactive", status: "active", is_active: false }, now), false);
});

test("selected-workspace recovery switches only when exactly one other workspace is entitled", () => {
  const now = new Date("2026-09-04T15:00:00Z");
  const recovered = chooseEntitledWorkspaceRecovery("stale", [
    { workspace_id: "stale", status: null, is_active: false },
    { workspace_id: "paid", status: "active", is_active: true },
    { workspace_id: "inactive", status: "canceled", is_active: false },
  ], now);
  assert.equal(recovered?.workspace_id, "paid");

  const ambiguous = chooseEntitledWorkspaceRecovery("stale", [
    { workspace_id: "paid-a", status: "active", is_active: true },
    { workspace_id: "paid-b", status: "trialing", is_active: true },
  ], now);
  assert.equal(ambiguous, null);
});
