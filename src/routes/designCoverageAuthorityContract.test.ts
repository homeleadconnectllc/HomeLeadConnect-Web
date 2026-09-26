import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const map = readFileSync("docs/design/HCX_COMPLETE_DESIGN_COVERAGE_MAP.md", "utf8");

test("design completion is governed by coverage, not route count", () => {
  assert.match(map, /Visual completion is not a route count/);
  assert.match(map, /navigation entry, submenu, tab, setting, action/);
  assert.match(map, /drawer, modal, mobile surface/);
});

test("communications are a first-class end-to-end design track", () => {
  assert.match(map, /Communications — first-class track/);
  for (const item of ["Unified Inbox", "SMS/Text Composer", "Email Composer", "Call Workspace", "Opt-in/Consent", "Failed Delivery"]) {
    assert.ok(map.includes(item), item);
  }
  assert.match(map, /provider transmission destinations remain server\/compliance resolved/);
});

test("coverage includes governance and non-happy-path states", () => {
  for (const item of ["Role/permission authority", "Entitlement", "Consent/legal implications", "offline", "conflict/version mismatch", "partial-service outage"]) {
    assert.ok(map.includes(item), item);
  }
});

test("personalization authority remains bounded", () => {
  assert.match(map, /HomeLead Connect system rule → organization rule → role permission → individual preference/);
  assert.match(map, /Personal, Organization-managed, and HomeLead Connect-managed/);
});
