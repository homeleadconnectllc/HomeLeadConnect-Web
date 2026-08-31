import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const navigationAccessibility = readFileSync("src/components/accessibility/MobileNavigationDialogAccessibility.tsx", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");

test("authenticated shell mounts the mobile navigation accessibility guard", () => {
  assert.match(authenticatedStyles, /MobileNavigationDialogAccessibility/);
  assert.match(authenticatedStyles, /return <MobileNavigationDialogAccessibility \/>/);
});

test("accessibility guard targets the current mobile drawer implementation", () => {
  assert.match(navbar, /className="hlc-drawer-v2" role="dialog" aria-modal="true"/);
  assert.match(navigationAccessibility, /\.hlc-drawer-v2\[role="dialog"\]\[aria-modal="true"\]/);
});

test("mobile modal navigation owns keyboard focus until it closes", () => {
  assert.match(navigationAccessibility, /event\.key === "Escape"/);
  assert.match(navigationAccessibility, /event\.key !== "Tab"/);
  assert.match(navigationAccessibility, /event\.shiftKey/);
  assert.match(navigationAccessibility, /last\.focus\(\)/);
  assert.match(navigationAccessibility, /first\.focus\(\)/);
});

test("mobile modal navigation restores focus to the invoking navigation control", () => {
  assert.match(navigationAccessibility, /previousFocus/);
  assert.match(navigationAccessibility, /document\.contains\(previousFocus\)/);
  assert.match(navigationAccessibility, /\.hlc-navbar-toggle/);
  assert.match(navigationAccessibility, /target\?\.focus\(\)/);
});
