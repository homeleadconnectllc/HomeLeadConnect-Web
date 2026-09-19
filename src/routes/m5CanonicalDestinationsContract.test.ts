import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const nav = readFileSync("src/components/Navbar.tsx", "utf8");

test("M5 protects canonical cross-surface destinations", () => {
  for (const route of [
    "/homeowner-portal",
    "/contractor-portal",
    "/partner-portal",
    "/leads",
    "/jobs",
    "/calendar",
    "/follow-ups",
    "/messages",
    "/hq",
    "/operations",
    "/customer-experience",
  ]) {
    assert.ok(router.includes(route), "Missing canonical destination " + route);
  }
});

test("M5 protects role-aware navigation destinations", () => {
  assert.match(nav, /homeowner-portal/);
  assert.match(nav, /contractor-portal/);
  assert.match(nav, /partner-portal/);
});
