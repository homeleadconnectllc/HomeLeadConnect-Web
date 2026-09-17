import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const homeSource = readFileSync("src/pages/HomePage.tsx", "utf8");
const layoutSource = readFileSync("src/routes/AppLayout.tsx", "utf8");
const footerSource = readFileSync("src/components/Footer.tsx", "utf8");
const bootstrapSource = readFileSync("src/main.tsx", "utf8");
const transparentLogo = "/brand/homelead-connect-transparent-v2.svg";

test("public pages use one centered transparent HomeLead Connect footer logo", () => {
  assert.equal(homeSource.includes("hlc-public-footer-home-authority"), false, "homepage React page must not own a duplicate footer");
  assert.equal(layoutSource.includes("<Footer />"), true, "AppLayout must render the shared Footer authority");
  assert.equal(footerSource.includes("hlc-public-footer-home-authority__brand"), true, "shared footer must render a centered brand node");
  assert.equal(footerSource.includes(transparentLogo), true, "shared footer must use the transparent v2 logo");
  assert.equal(bootstrapSource.includes("hlc-public-footer-home-authority__brand"), true, "parser-seeded homepage footer must render the centered brand node");
  assert.equal(bootstrapSource.includes(transparentLogo), true, "parser-seeded homepage must use the same transparent v2 logo");
  assert.equal(footerSource.includes("homelead-connect-master-transparent.png"), false, "revoked badge must not be used by the shared footer");
});
