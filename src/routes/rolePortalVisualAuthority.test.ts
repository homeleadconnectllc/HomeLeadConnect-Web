import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/account-portals-application-workspace.css", "utf8");
const lockedStyles = readFileSync("src/styles/hcx-locked-visual-authority-20260924.css", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const signedInProfessionalSystem = readFileSync("src/styles/signed-in-professional-system.css", "utf8");
const resident = readFileSync("src/pages/portal/HomeownerPortal.tsx", "utf8");
const partner = readFileSync("src/pages/portal/PartnerPortal.tsx", "utf8");
const accessProvider = readFileSync("src/context/AccountAccessProvider.tsx", "utf8");
const accessContext = readFileSync("src/context/account-access-context.ts", "utf8");

test("role portals use the owner-approved light pathway visual authority", () => {
  assert.match(styles, /Dashboard Version A portal authority/);
  assert.match(styles, /\.hlc-portal-workspace\{--acct-line:#d7e0ea;/);
  assert.match(styles, /--acct-surface:#ffffff/);
  assert.match(styles, /--acct-text:#172033/);
  // 2026-09-24 owner authority: role portals remain light, but are no longer
  // forced into one pure-white environment. Each pathway owns its soft visual field.
  assert.match(lockedStyles, /\.hlc-portal-workspace\.is-resident/);
  assert.match(lockedStyles, /\.hlc-portal-workspace\.is-professional/);
  assert.match(lockedStyles, /\.hlc-portal-workspace\.is-partner/);
  assert.match(lockedStyles, /#16866a/);
  assert.match(lockedStyles, /#1479b8/);
  assert.match(lockedStyles, /#9a6a0a/);
  assert.match(lockedStyles, /#8449ae/);
  assert.match(lockedStyles, /linear-gradient/);
  assert.match(lockedStyles, /prefers-reduced-motion/);
  // signed-in-professional-system.css must NOT be imported at runtime anymore
  assert.doesNotMatch(authenticatedStyles, /signed-in-professional-system\.css/);
  assert.match(authenticatedStyles, /hcx-locked-visual-authority-20260924\.css/);

  // The file may still exist for history, but must not be imported or have runtime authority
  assert.match(signedInProfessionalSystem, /hlc-signed-in-shell/);
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
