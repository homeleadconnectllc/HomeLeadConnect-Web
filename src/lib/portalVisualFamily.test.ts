import assert from "node:assert/strict";
import test from "node:test";
import { portalFamilyForPath, resolvePortalVisualFamily } from "./portalVisualFamily.ts";

test("portal routes declare their family without changing authorization", () => {
  assert.equal(portalFamilyForPath("/homeowner-portal/resources"), "resident");
  assert.equal(portalFamilyForPath("/contractor-portal/services"), "professional");
  assert.equal(portalFamilyForPath("/partner-portal"), "partner");
  assert.equal(portalFamilyForPath("/community-hub"), "community");
});

test("shared pages retain an accessible current portal and reject stale identities", () => {
  const resident = { homeowner: true, contractor: false, partner: false, business: false };
  assert.equal(resolvePortalVisualFamily("/messages", resident, "resident"), "resident");
  assert.equal(resolvePortalVisualFamily("/notifications", resident, "partner"), "resident");
  const professional = { homeowner: true, contractor: true, partner: false, business: false };
  assert.equal(resolvePortalVisualFamily("/profile", professional, "professional"), "professional");
  assert.equal(resolvePortalVisualFamily("/profile", professional, "partner"), "resident");
  assert.equal(resolvePortalVisualFamily("/workflow", professional, "resident"), null);
  assert.equal(resolvePortalVisualFamily("/workflow", { ...professional, business: true }, "resident"), "professional");
});
