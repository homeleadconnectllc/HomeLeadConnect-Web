import assert from "node:assert/strict";
import test from "node:test";
import { canAccessWorkspacePath, canRunAutomation, normalizeInternalRole } from "./accessPolicy.ts";

test("normalizes only recognized internal HLC roles", () => {
  assert.equal(normalizeInternalRole(" OWNER "), "owner");
  assert.equal(normalizeInternalRole("manager"), "manager");
  assert.equal(normalizeInternalRole("Technician"), "technician");
  assert.equal(normalizeInternalRole("contractor"), null);
  assert.equal(normalizeInternalRole("homeowner"), null);
  assert.equal(normalizeInternalRole("renter"), null);
  assert.equal(normalizeInternalRole(null), null);
});

test("owner can open command, billing, management and operational routes", () => {
  for (const path of ["/hq", "/hq/system-health", "/settings/billing", "/workflow", "/automations", "/analytics", "/team", "/leads", "/jobs", "/calendar"]) {
    assert.equal(canAccessWorkspacePath("owner", path), true, path);
  }
});

test("manager can open assigned command areas but not owner-only billing authority", () => {
  assert.equal(canAccessWorkspacePath("manager", "/hq"), true);
  assert.equal(canAccessWorkspacePath("manager", "/hq/approvals"), true);
  assert.equal(canAccessWorkspacePath("manager", "/hq/dedication"), true);
  assert.equal(canAccessWorkspacePath("manager", "/settings/billing"), false);
  assert.equal(canAccessWorkspacePath("manager", "/workflow"), true);
  assert.equal(canAccessWorkspacePath("manager", "/automations"), true);
  assert.equal(canAccessWorkspacePath("manager", "/analytics"), true);
  assert.equal(canAccessWorkspacePath("manager", "/team"), true);
  assert.equal(canAccessWorkspacePath("manager", "/leads"), true);
});

test("technician gets operational work but not management control planes", () => {
  for (const path of ["/leads", "/jobs", "/calendar", "/documents", "/call-center", "/manual-communications", "/network", "/providers"]) {
    assert.equal(canAccessWorkspacePath("technician", path), true, path);
  }
  for (const path of ["/hq", "/settings/billing", "/workflow", "/automations", "/analytics", "/settings", "/team", "/operations", "/customer-experience", "/community/moderation"]) {
    assert.equal(canAccessWorkspacePath("technician", path), false, path);
  }
});

test("customer and provider identity labels never unlock internal workspace routes", () => {
  for (const role of ["customer", "homeowner", "renter", "contractor", "provider", "subcontractor", "moderator", undefined]) {
    assert.equal(canAccessWorkspacePath(role, "/dashboard"), false, String(role));
    assert.equal(canAccessWorkspacePath(role, "/leads"), false, String(role));
    assert.equal(canAccessWorkspacePath(role, "/team"), false, String(role));
    assert.equal(canAccessWorkspacePath(role, "/hq"), false, String(role));
    assert.equal(canRunAutomation(role), false, String(role));
  }
});

test("automation execution is management-only", () => {
  assert.equal(canRunAutomation("owner"), true);
  assert.equal(canRunAutomation("manager"), true);
  assert.equal(canRunAutomation("technician"), false);
});
