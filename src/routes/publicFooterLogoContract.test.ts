import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const homeSource = readFileSync("src/pages/HomePage.tsx", "utf8");
const layoutSource = readFileSync("src/routes/AppLayout.tsx", "utf8");
const footerSource = readFileSync("src/components/Footer.tsx", "utf8");
const footerCss = readFileSync("src/styles/public-footer-home-authority-20260916.css", "utf8");
const bootstrapSource = readFileSync("src/main.tsx", "utf8");
const transparentLogo = "/brand/homelead-connect-transparent-v2.svg";

test("public pages use one centered transparent HomeLead Connect footer logo", () => {
  assert.equal(homeSource.includes("hlc-public-footer-home-authority"), false, "homepage React page must not own a duplicate footer");
  assert.equal(layoutSource.includes("<Footer showLogo={!signedInWorkspaceShell && !homepageSurface} />"), true, "AppLayout must keep the shared footer logo public-only while suppressing it on the homepage, where the approved homepage composition owns the single bottom logo");
  assert.equal(footerSource.includes("hlc-public-footer-home-authority__brand"), true, "shared footer must render a centered brand node when enabled");
  assert.equal(footerSource.includes("showLogo = true"), true, "shared footer must support suppressing its logo on signed-in workspaces");
  assert.equal(footerSource.includes(transparentLogo), true, "shared footer must use the transparent v2 logo");
  assert.equal(bootstrapSource.includes("hlc-public-footer-home-authority__brand"), false, "parser-seeded homepage stays lightweight and uses CSS fallback");
  assert.equal(footerCss.includes("hlc-public-footer-home-authority:not(:has(.hlc-public-footer-home-authority__brand))::before"), true, "parser-seeded homepage must receive the centered footer logo fallback");
  assert.equal(footerCss.includes(transparentLogo), true, "footer fallback must use the transparent v2 logo");
  assert.equal(footerSource.includes("homelead-connect-master-transparent.png"), false, "revoked badge must not be used by the shared footer");
});
