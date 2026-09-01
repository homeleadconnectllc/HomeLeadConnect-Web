import assert from "node:assert/strict";
import test from "node:test";

import { evaluateBillingAccess, resolveEntitlementState } from "./entitlement.ts";

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
