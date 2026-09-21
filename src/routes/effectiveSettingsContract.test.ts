import assert from "node:assert/strict";
import test from "node:test";
import { resolveEffectiveSetting } from "../lib/effectiveSettings.ts";

const base = {
  key: "notifications.quiet_hours",
  controlClass: "personal_operating" as const,
  scope: "workspace" as const,
  roleAllowed: true,
  entitlementAllowed: true,
  contextAllowed: true,
  defaultValue: false,
};

test("system authority overrides organization and personal values", () => {
  const result = resolveEffectiveSetting({ ...base, system: { value: true }, organization: { value: false }, personal: false });
  assert.equal(result.value, true);
  assert.equal(result.source, "system");
  assert.equal(result.owner, "hcx");
  assert.equal(result.editable, false);
});

test("organization authority overrides personal values", () => {
  const result = resolveEffectiveSetting({ ...base, organization: { value: true }, personal: false });
  assert.equal(result.value, true);
  assert.equal(result.source, "organization");
  assert.equal(result.editable, false);
});

test("role, entitlement and context restrictions cannot be personalized around", () => {
  assert.equal(resolveEffectiveSetting({ ...base, roleAllowed: false, personal: true }).editable, false);
  assert.equal(resolveEffectiveSetting({ ...base, entitlementAllowed: false, personal: true }).editable, false);
  assert.equal(resolveEffectiveSetting({ ...base, contextAllowed: false, personal: true }).editable, false);
});

test("personal values apply only after higher authorities allow them", () => {
  const result = resolveEffectiveSetting({ ...base, personal: true });
  assert.equal(result.value, true);
  assert.equal(result.source, "personal");
  assert.equal(result.editable, true);
});

test("controlled rules are never personally editable", () => {
  const result = resolveEffectiveSetting({ ...base, controlClass: "controlled_rule" as const, personal: true });
  assert.equal(result.editable, false);
  assert.equal(result.owner, "hcx");
});
