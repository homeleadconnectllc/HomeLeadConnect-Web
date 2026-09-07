import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicAuthority = readFileSync("src/styles/master-visual-system-20260907.css", "utf8");
const publicPhysicalAuthority = readFileSync("public/public-home-app-reconciliation-20260907.css", "utf8");
const authenticatedAuthority = readFileSync("src/styles/master-authenticated-visual-system-20260907.css", "utf8");
const finalAuthenticatedAuthority = readFileSync("src/styles/physical-root-authority-20260907.css", "utf8");
const publicShell = readFileSync("index.html", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");

test("approved visual master authorities are mounted in public and authenticated cascades", () => {
  assert.match(app, /master-visual-system-20260907\.css/);
  assert.match(publicShell, /public-home-app-reconciliation-20260907\.css/);
  assert.match(authenticatedStyles, /master-authenticated-visual-system-20260907\.css/);
  assert.match(authenticatedStyles, /physical-root-authority-20260907\.css/);
  assert.ok(
    authenticatedStyles.indexOf("master-authenticated-visual-system-20260907.css") <
      authenticatedStyles.indexOf("physical-root-authority-20260907.css"),
    "the DOM-correct physical root authority must load after the master authenticated system",
  );
  assert.ok(
    authenticatedStyles.trim().lastIndexOf('import "./physical-root-authority-20260907.css";') >
      authenticatedStyles.indexOf("authenticated-shell-navy-source-authority-20260907.css"),
    "physical-root-authority must remain the final authenticated stylesheet import",
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

test("actual final physical authority owns Dashboard geometry at the real shell root", () => {
  assert.match(finalAuthenticatedAuthority, /\.hlc-signed-in-shell\.hlc-page-dashboard[\s\S]*\.hlc-home-metric-strip/);
  assert.match(finalAuthenticatedAuthority, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-home-metric-strip>a>span[\s\S]*width:100%!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-home-metric-strip small[\s\S]*word-break:normal!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-home-metric-strip small[\s\S]*overflow-wrap:normal!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-home-metric-strip small[\s\S]*hyphens:none!important/);
});

test("actual final physical authority removes Notifications white island at the real shell root", () => {
  assert.match(
    finalAuthenticatedAuthority,
    /\.hlc-signed-in-shell\.hlc-page-notifications[\s\S]*\.hlc-route-visual-banner\{display:none!important/,
  );
  assert.match(finalAuthenticatedAuthority, /\.hlc-signed-in-shell\.hlc-page-notifications[\s\S]*\.hlc-notifications-workspace/);
});

test("shared AI workspace root is compact navy rather than card-heavy white or purple", () => {
  assert.match(finalAuthenticatedAuthority, /hlc-page-customer-experience[\s\S]*\.hlc-agent-workspace/);
  assert.match(finalAuthenticatedAuthority, /hlc-page-operations[\s\S]*\.hlc-agent-workspace/);
  assert.match(finalAuthenticatedAuthority, /hlc-page-hq[\s\S]*\.hlc-agent-workspace/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-agent-action-workbench[\s\S]*background:transparent!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-agent-result-rail>section[\s\S]*background:transparent!important/);
  assert.match(finalAuthenticatedAuthority, /\.hlc-agent-history-grid[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);
});

test("public physical authority reconciles the front door with app-family composition", () => {
  assert.match(publicPhysicalAuthority, /#root \.hlc-home>header/);
  assert.match(publicPhysicalAuthority, /content:"HomeLead Connect"/);
  assert.match(publicPhysicalAuthority, /#root \.hlc-home-hero[\s\S]*text-align:left!important/);
  assert.match(publicPhysicalAuthority, /Resident-first front door/);
  assert.match(publicPhysicalAuthority, /nth-child\(3\)\{display:none!important/);
});

test("public parser shell uses the full HomeLead Connect brand name", () => {
  assert.doesNotMatch(publicShell, />\s*Open HLC\s*</i);
  assert.match(publicShell, />\s*Open HomeLead Connect\s*</i);
});

test("final physical authorities do not reintroduce purple system authority", () => {
  const purpleAuthority = /\bpurple\b|#a78bfa|#8b5cf6|#7c3aed|#9f8cff|#b8a7ff/i;
  assert.doesNotMatch(publicPhysicalAuthority, purpleAuthority);
  assert.doesNotMatch(finalAuthenticatedAuthority, purpleAuthority);
});
