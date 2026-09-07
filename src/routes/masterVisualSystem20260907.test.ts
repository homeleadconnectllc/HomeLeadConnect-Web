import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicAuthority = readFileSync("src/styles/master-visual-system-20260907.css", "utf8");
const authenticatedAuthority = readFileSync("src/styles/master-authenticated-visual-system-20260907.css", "utf8");
const finalAuthenticatedAuthority = readFileSync("src/styles/authenticated-shell-navy-source-authority-20260907.css", "utf8");
const publicShell = readFileSync("index.html", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");

test("approved visual master authorities are mounted in public and authenticated cascades", () => {
  assert.match(app, /master-visual-system-20260907\.css/);
  assert.match(authenticatedStyles, /master-authenticated-visual-system-20260907\.css/);
  assert.match(authenticatedStyles, /authenticated-shell-navy-source-authority-20260907\.css/);
  assert.ok(
    authenticatedStyles.indexOf("master-authenticated-visual-system-20260907.css") <
      authenticatedStyles.indexOf("authenticated-shell-navy-source-authority-20260907.css"),
    "the physical navy authority must load after the master authenticated system",
  );
});

test("sign-in visual authority removes marketing competition without changing auth implementation", () => {
  assert.match(publicAuthority, /hlc-page-login[\s\S]*hlc-route-visual-banner/);
  assert.match(publicAuthority, /hlc-page-login[\s\S]*hlc-navbar-toggle/);
  assert.match(publicAuthority, /hlc-page-login[\s\S]*hlc-auth-method-tabs/);
  assert.match(publicAuthority, /hlc-page-login[\s\S]*hlc-auth-form input/);
});

test("dashboard leads jobs and messages share compact work-first visual rules", () => {
  assert.match(authenticatedAuthority, /hlc-page-dashboard[\s\S]*hlc-home-quick-row/);
  assert.match(authenticatedAuthority, /hlc-page-leads[\s\S]*hlc-lead-row/);
  assert.match(authenticatedAuthority, /hlc-page-jobs[\s\S]*hlc-job-row/);
  assert.match(authenticatedAuthority, /hlc-page-messages[\s\S]*hlc-message-inbox-row/);
  assert.match(authenticatedAuthority, /min-height:\s*44px/);
});

test("final physical authority owns the Dashboard palette and prevents split KPI words", () => {
  assert.match(finalAuthenticatedAuthority, /body\.hlc-page-dashboard[\s\S]*\.hlc-home-metric-strip/);
  assert.match(finalAuthenticatedAuthority, /grid-template-columns:\s*repeat\(2,minmax\(0,1fr\)\)!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-home-metric-strip>a>span[\s\S]*width:100%!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-home-metric-strip small[\s\S]*word-break:normal!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-home-metric-strip small[\s\S]*overflow-wrap:normal!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-home-metric-strip small[\s\S]*hyphens:none!important/);
  assert.match(finalAuthenticatedAuthority, /#081426/);
  assert.match(finalAuthenticatedAuthority, /#0d1a2d/);
  assert.match(finalAuthenticatedAuthority, /#10243e/);
});

test("final physical authority removes the Notifications storytelling white island", () => {
  assert.match(
    finalAuthenticatedAuthority,
    /body\.hlc-page-notifications[\s\S]*\.hlc-route-visual-banner\{[\s\S]*display:none!important/,
  );
  assert.match(finalAuthenticatedAuthority, /body\.hlc-page-notifications[\s\S]*\.hlc-notifications-workspace/);
  assert.match(finalAuthenticatedAuthority, /hlc-notifications-header h1[\s\S]*color:#f8fafc!important/);
  assert.match(finalAuthenticatedAuthority, /hlc-notifications-header p[\s\S]*color:#9fb0c5!important/);
});

test("public parser shell uses the full HomeLead Connect brand name", () => {
  assert.doesNotMatch(publicShell, />\s*Open HLC\s*</i);
  assert.match(publicShell, />\s*Open HomeLead Connect\s*</i);
});

test("visual master system does not reintroduce purple authority", () => {
  const purpleAuthority = /\bpurple\b|#a78bfa|#8b5cf6|#7c3aed|#9f8cff|#b8a7ff/i;
  assert.doesNotMatch(publicAuthority, purpleAuthority);
  assert.doesNotMatch(authenticatedAuthority, purpleAuthority);
  assert.doesNotMatch(finalAuthenticatedAuthority, purpleAuthority);
});
