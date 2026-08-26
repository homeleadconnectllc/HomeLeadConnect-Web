import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const billingPage = readFileSync("src/pages/dashboard/BillingWorkspace.tsx", "utf8");
const ecosystemArea = readFileSync("src/pages/dashboard/EcosystemAreaPage.tsx", "utf8");
const billingApi = readFileSync("src/api/billing.ts", "utf8");

test("billing route renders a dedicated finance workspace instead of redirecting to settings", () => {
  assert.match(ecosystemArea, /import BillingWorkspace from "\.\/BillingWorkspace"/);
  assert.match(ecosystemArea, /page === "billing"\) return <BillingWorkspace \/>/);
  assert.doesNotMatch(ecosystemArea, /page === "billing"\) return <Navigate to="\/settings"/);
});

test("billing workspace reads authoritative plan state and reuses protected provider actions", () => {
  for (const apiCall of ["getBillingStatus", "getBillingOffer", "startSubscriptionCheckout", "openBillingPortal"]) {
    assert.ok(billingPage.includes(apiCall), `billing workspace is missing ${apiCall}`);
  }
  assert.match(billingApi, /from\("workspace_plan_status"\)/);
  assert.match(billingApi, /from\("plans"\)/);
  assert.match(billingApi, /functions\.invoke\("stripe-checkout-session"/);
  assert.match(billingApi, /functions\.invoke\("stripe-billing-portal"/);
});

test("billing workspace preserves explicit trial consent and does not collect card details", () => {
  assert.match(billingPage, /14-day free trial/);
  assert.match(billingPage, /payment method is required/i);
  assert.match(billingPage, /checked=\{consent\}/);
  assert.match(billingPage, /disabled=\{!consent \|\| busy !== null\}/);
  assert.match(billingPage, /does not collect payment-card data/);
  assert.doesNotMatch(billingPage, /type="(?:number|password)"[^>]*(?:card|cvv|cvc)/i);
});

test("billing workspace reports provider dates and cancellation state without inventing revenue metrics", () => {
  for (const field of ["trial_end", "current_period_end", "grace_period_end", "cancel_at_period_end"]) {
    assert.ok(billingPage.includes(field), `billing workspace is missing ${field}`);
  }
  assert.doesNotMatch(billingPage, /MRR|ARR|forecast revenue|projected revenue/i);
});
