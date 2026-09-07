import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicAuthority = readFileSync("src/styles/master-visual-system-20260907.css", "utf8");
const authenticatedAuthority = readFileSync("src/styles/master-authenticated-visual-system-20260907.css", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");

test("approved visual master authorities are mounted in public and authenticated cascades", () => {
  assert.match(app, /master-visual-system-20260907\.css/);
  assert.match(authenticatedStyles, /master-authenticated-visual-system-20260907\.css/);
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

test("visual master system does not reintroduce purple authority", () => {
  assert.doesNotMatch(publicAuthority, /\bpurple\b|#a78bfa|#8b5cf6|#7c3aed/i);
  assert.doesNotMatch(authenticatedAuthority, /\bpurple\b|#a78bfa|#8b5cf6|#7c3aed/i);
});
