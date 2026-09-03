import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const router=fs.readFileSync(new URL("./AppRouter.tsx",import.meta.url),"utf8");
const portals=fs.readFileSync(new URL("../api/portals.ts",import.meta.url),"utf8");
const resident=fs.readFileSync(new URL("../pages/portal/HomeownerPortal.tsx",import.meta.url),"utf8");
const professional=fs.readFileSync(new URL("../pages/portal/ContractorPortal.tsx",import.meta.url),"utf8");
const partner=fs.readFileSync(new URL("../pages/portal/PartnerPortal.tsx",import.meta.url),"utf8");
const partnerApi=fs.readFileSync(new URL("../api/partners.ts",import.meta.url),"utf8");
const notifications=fs.readFileSync(new URL("../pages/dashboard/Notifications.tsx",import.meta.url),"utf8");
const phase3=fs.readFileSync(new URL("../../supabase/migrations/20260829112000_phase3_external_user_backend_contracts.sql",import.meta.url),"utf8");
const partnerMigration=fs.readFileSync(new URL("../../supabase/migrations/20260829124500_partner_portal_referrals.sql",import.meta.url),"utf8");

test("resident portal owns match payment review and referral actions",()=>{
  for(const rpc of ["get_homeowner_portal_matches","homeowner_decide_provider_match","get_homeowner_portal_payments","list_homeowner_review_eligible_jobs","homeowner_create_review","homeowner_create_referral"]){assert.ok(portals.includes(rpc),`missing resident RPC ${rpc}`);}
  assert.match(resident,/Provider matches/);assert.match(resident,/Job payments/);assert.match(resident,/Completed-service reviews/);assert.match(resident,/Help someone else/);
  assert.match(phase3,/homeowner_portal_links/);
});

test("professional portal reports verification progress and performance without canonical job mutation",()=>{
  for(const rpc of ["get_linked_provider_verification","contractor_record_job_progress","get_contractor_portal_progress","get_linked_provider_performance"]){assert.ok(portals.includes(rpc),`missing professional RPC ${rpc}`);}
  assert.match(professional,/Verification/);assert.match(professional,/Your reported updates/);assert.match(professional,/Recorded service history/);
  assert.match(professional,/does not|authority over the canonical job lifecycle/i);
  assert.doesNotMatch(phase3,/update public\.crm_jobs[\s\S]{0,300}contractor_record_job_progress/);
});

test("partner journey has dedicated public entry and portal-safe referral status",()=>{
  assert.ok(router.includes('path="/partners"'));assert.ok(router.includes('path="/partner-portal"'));
  assert.match(partner,/Refer a resident or professional/);assert.match(partner,/Referral history/);
  assert.match(partnerApi,/get_partner_portal_data/);assert.match(partnerApi,/partner_create_referral/);
  assert.match(partnerMigration,/linked_user_id=auth\.uid\(\)/);assert.match(partnerMigration,/status='active'/);
  assert.doesNotMatch(partnerMigration,/grant .*partner_referrals.*authenticated/i);
});

test("operations exceptions expose durable disposition without equating read state with resolution",()=>{
  assert.match(notifications,/recordOperationsExceptionDisposition/);assert.match(notifications,/resolved/);assert.match(notifications,/escalated/);assert.match(notifications,/deferred/);
  assert.match(notifications,/does not pretend the source record changed/);
  assert.match(phase3,/operations_exception_dispositions/);
});

test("resident journey exposes explicit recovery for payment and action failures",()=>{
  assert.match(resident,/Payment needs attention/);
  assert.match(resident,/failed/);
  assert.match(resident,/Retry secure checkout/);
  assert.match(resident,/Unable to start secure checkout/);
  assert.match(resident,/Unable to complete that action/);
  assert.match(resident,/Report an issue|Messages|Message/i);
});

test("professional journey preserves recovery handoffs instead of silently changing canonical jobs",()=>{
  assert.match(professional,/Unable to load professional work/);
  assert.match(professional,/Unable to complete that action/);
  assert.match(professional,/Message about work/);
  assert.match(professional,/blocked/);
  assert.match(professional,/Provider progress is evidence only/);
  assert.match(professional,/HomeLead Connect operations retains authority over the canonical job lifecycle/);
});

test("external persona routes remain separated from internal workspace authority",()=>{
  assert.ok(router.includes('path="/homeowner-portal"'));
  assert.ok(router.includes('path="/contractor-portal"'));
  assert.ok(router.includes('path="/partner-portal"'));
  assert.doesNotMatch(resident,/to="\/operations"|to="\/analytics"|to="\/community\/reviews"/);
  assert.doesNotMatch(professional,/to="\/jobs"|to="\/operations"|to="\/analytics"/);
  assert.doesNotMatch(partner,/to="\/operations"|to="\/analytics"|to="\/community\/referrals"/);
});
