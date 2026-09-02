import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { evaluateBillingAccess, resolveEntitlementState } from "../lib/billing/entitlement.ts";

const router=readFileSync(new URL("./AppRouter.tsx",import.meta.url),"utf8");
const layout=readFileSync(new URL("../layouts/WorkspaceLayout.tsx",import.meta.url),"utf8");
const policy=readFileSync(new URL("../lib/billing/entitlement.ts",import.meta.url),"utf8");
const billingApi=readFileSync(new URL("../api/billing.ts",import.meta.url),"utf8");
const webhook=readFileSync(new URL("../../supabase/functions/stripe-webhook/index.ts",import.meta.url),"utf8");
const css=readFileSync(new URL("../styles/e6-trial-entitlements.css",import.meta.url),"utf8");

test("E6 uses real routes instead of duplicate trial pages",()=>{
  assert.doesNotMatch(router,/path="\/trial(?:\/|")/);
  assert.match(layout,/FULL TRIAL PREVIEW/);
  assert.match(layout,/LIMITED MODE/);
});

test("role authorization remains ahead of entitlement decisions",()=>{
  assert.ok(layout.indexOf("if (!canAccessWorkspacePath")<layout.indexOf("const entitlementState = resolveEntitlementState"));
  assert.match(layout,/Your HomeLead Connect role does not allow this area/);
});

test("Stripe webhook evidence remains the only subscription authority",()=>{
  assert.match(billingApi,/from\("workspace_plan_status"\)[\s\S]*?\.select/);
  assert.match(webhook,/constructEventAsync\(rawBody,signature,signingSecret\)/);
  assert.match(webhook,/workspace_plan_status/);
  assert.doesNotMatch(policy,/supabase|fetch\(|localStorage|sessionStorage/i);
});

test("trial expiration never deletes durable user history",()=>{
  const combined=`${policy}\n${layout}`;
  assert.doesNotMatch(combined,/\.delete\(|removeItem\(|truncate|drop table/i);
  for(const promise of ["Saved work","history remain","Existing records remain preserved"]) assert.match(layout,new RegExp(promise,"i"));
});

test("recovery and negative states fail closed without false inactive claims",()=>{
  assert.equal(evaluateBillingAccess({billingEnabled:true,pathname:"/settings/billing",status:null,isActive:null,verificationFailed:true}),"allowed");
  assert.equal(evaluateBillingAccess({billingEnabled:true,pathname:"/jobs",status:"canceled",isActive:false,verificationFailed:false}),"subscription_required");
  assert.equal(resolveEntitlementState({billingEnabled:true,pathname:"/jobs",status:null,isActive:null,verificationFailed:true}),"verification_unavailable");
  assert.match(layout,/Access was not classified as inactive/);
});

test("entitlement notices are accessible and mobile safe",()=>{
  assert.match(layout,/role="status"/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/:focus-visible/);
});
