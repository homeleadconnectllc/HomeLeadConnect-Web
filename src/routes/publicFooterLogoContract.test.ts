import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const homeSource = readFileSync("src/pages/HomePage.tsx", "utf8");
const layoutSource = readFileSync("src/routes/AppLayout.tsx", "utf8");
const footerSource = readFileSync("src/components/Footer.tsx", "utf8");
const bootstrapSource = readFileSync("src/main.tsx", "utf8");

test("public homepage uses the shared footer without an extra HomeLead Connect logo", () => {
  assert.equal(
    homeSource.includes("hlc-public-footer-home-authority"),
    false,
    "homepage must not own the legacy duplicate footer"
  );

  assert.equal(
    layoutSource.includes("<Footer />"),
    true,
    "AppLayout must render the shared Footer authority"
  );

  assert.equal(
    footerSource.includes("<img"),
    false,
    "shared footer must not render an image logo"
  );

  assert.equal(
    bootstrapSource.includes("hlc-public-footer-home-authority__brand"),
    false,
    "parser-seeded homepage footer must not render an image-logo brand"
  );

  assert.equal(
    /<footer class="hlc-board-footer hlc-public-footer-home-authority">[^<]*<a[^>]*>[^<]*<img/i.test(bootstrapSource),
    false,
    "parser-seeded homepage footer must remain text/legal branding only"
  );

  assert.equal(
    footerSource.includes("HomeLead Connect"),
    true,
    "shared footer must retain HomeLead Connect text branding"
  );
});
