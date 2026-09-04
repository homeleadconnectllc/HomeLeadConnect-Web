import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/account-portals-application-workspace.css", "utf8");
const resident = readFileSync("src/pages/portal/HomeownerPortal.tsx", "utf8");
const partner = readFileSync("src/pages/portal/PartnerPortal.tsx", "utf8");
const accessProvider = readFileSync("src/context/AccountAccessProvider.tsx", "utf8");
const accessContext = readFileSync("src/context/account-access-context.ts", "utf8");

test("role portals use the approved Dashboard Version A light visual authority", () => {
  assert.match(styles, /Dashboard Version A portal authority/);
  assert.match(styles, /\.hlc-portal-workspace\{--acct-line:#d7e0ea;/);
  assert.match(styles, /--acct-surface:#ffffff/);
  assert.match(styles, /--acct-text:#172033/);
  assert.match(styles, /\.hlc-portal-workspace \.hlc-portal-project\{[^}]*background:#fff!important/);
  assert.match(styles, /\.hlc-portal-workspace\.is-resident/);
  assert.match(styles, /\.hlc-portal-workspace\.is-professional/);
  assert.match(styles, /\.hlc-portal-workspace\.is-partner/);
});

test("resident service estimates remain distinct from LeadScope", () => {
  assert.match(resident, /<h3>Service estimates<\/h3>/);
  assert.doesNotMatch(resident, /<h3>LeadScope estimates<\/h3>/);
});

test("partner portal has an explicit role marker and shared access signal", () => {
  assert.match(partner, /hlc-portal-workspace is-partner/);
  assert.match(accessContext, /partner: boolean/);
  assert.match(accessProvider, /get_partner_portal_data/);
  assert.match(accessProvider, /partner: !failed && !partnerDenied && Boolean\(partner\.data\)/);
});
