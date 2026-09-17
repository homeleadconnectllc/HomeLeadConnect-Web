import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const homeSource = readFileSync("src/pages/HomePage.tsx", "utf8");
const layoutSource = readFileSync("src/routes/AppLayout.tsx", "utf8");
const footerSource = readFileSync("src/components/Footer.tsx", "utf8");
const footerCss = readFileSync("src/styles/public-footer-home-authority-20260916.css", "utf8");
const bootstrapSource = readFileSync("src/main.tsx", "utf8");

test("shared public footers contain no logo while preserving footer branding text", () => {
  assert.equal(homeSource.includes("hlc-public-footer-home-authority"), false, "homepage React page must not own a duplicate footer");
  assert.equal(layoutSource.includes("<Footer />"), true, "AppLayout must render the shared footer without logo state");
  assert.equal(layoutSource.includes("showLogo="), false, "AppLayout must not pass retired footer-logo state");
  assert.equal(footerSource.includes("hlc-public-footer-home-authority__brand"), false, "shared footer must not render a logo node");
  assert.equal(footerSource.includes("homelead-connect-transparent-v2.svg"), false, "shared footer must not reference the transparent logo asset");
  assert.equal(bootstrapSource.includes("hlc-public-footer-home-authority__brand"), false, "parser-seeded homepage must not inject a footer brand node");
  assert.match(footerCss, /no logo is rendered inside any shared public footer/);
  assert.match(footerCss, /content:none!important;display:none!important;background:none!important;background-image:none!important/);
  assert.equal(footerSource.includes("<strong>HomeLead Connect</strong>"), true, "footer text branding must remain");
  assert.equal(footerSource.includes("Connecting Homes. Creating Opportunities."), true, "footer tagline must remain");
});
