import assert from "node:assert/strict";
import test from "node:test";

import { evaluateBillingAccess } from "./entitlement.ts";

test("billing disabled does not gate workspace routes", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: false, pathname: "/jobs", isActive: null, verificationFailed: false }), "allowed");
});

test("webhook-confirmed active entitlement allows workspace access", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/jobs", isActive: true, verificationFailed: false }), "allowed");
});

test("unentitled workspace is gated", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/jobs", isActive: false, verificationFailed: false }), "subscription_required");
});

test("billing verification failure is not mislabeled as unentitled", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/jobs", isActive: null, verificationFailed: true }), "verification_unavailable");
});

test("settings remains available for billing recovery", () => {
  assert.equal(evaluateBillingAccess({ billingEnabled: true, pathname: "/settings", isActive: false, verificationFailed: true }), "allowed");
});
