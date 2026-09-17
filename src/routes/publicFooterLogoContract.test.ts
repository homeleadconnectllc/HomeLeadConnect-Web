import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const homeSource = readFileSync("src/pages/HomePage.tsx", "utf8");
const layoutSource = readFileSync("src/routes/AppLayout.tsx", "utf8");
const footerSource = readFileSync("src/components/Footer.tsx", "utf8");
const footerCss = readFileSync("src/styles/public-footer-home-authority-20260916.css", "utf8");
const bootstrapSource = readFileSync("src/main.tsx", "utf8");

test("public pages use one centered official footer logo authority", () => {
  assert.equal(
    homeSource.includes("hlc-public-footer-home-authority"),
    false,
    "homepage React page must not own a second footer"
  );

  assert.equal(
    layoutSource.includes("<Footer />"),
    true,
    "AppLayout must render the shared Footer authority"
  );

  assert.equal(
    footerSource.includes("hlc-public-footer-home-authority__brand"),
    true,
    "shared footer must render the centered brand node"
  );

  assert.equal(
    footerSource.includes('/brand/homelead-connect-master-transparent.png'),
    true,
    "shared footer must use the official master artwork"
  );

  assert.equal(
    footerCss.includes("hlc-public-footer-home-authority:not(:has(.hlc-public-footer-home-authority__brand))::before"),
    true,
    "parser-seeded homepage must receive the footer logo through the shared CSS authority"
  );

  assert.equal(
    footerCss.includes("background-image:url('/brand/homelead-connect-master-transparent.png')"),
    true,
    "parser-seeded homepage footer must use the same official master artwork"
  );

  assert.equal(
    bootstrapSource.includes("hlc-public-footer-home-authority__brand"),
    false,
    "parser-seeded homepage markup must stay lightweight and rely on the shared CSS fallback"
  );

  assert.equal(
    footerSource.includes("HomeLead Connect"),
    true,
    "shared footer must retain HomeLead Connect text branding"
  );
});
