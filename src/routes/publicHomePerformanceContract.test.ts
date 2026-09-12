import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const v2Authority = readFileSync(new URL("../styles/v2-cinematic-community-homepage-20260911.css", import.meta.url), "utf8");

test("public home stays outside the authenticated application bundle while retaining route delivery", () => {
  assert.match(main, /isPublicHome/);
  assert.doesNotMatch(main, /BrowserRouter/);
  assert.match(main, /import\("\.\/App\.tsx"\)/);
  assert.doesNotMatch(home, /react-router-dom/);
  assert.doesNotMatch(footer, /react-router-dom/);
});

test("public home renders without paying React startup cost", () => {
  assert.doesNotMatch(main, /^import .* from "react"/m);
  assert.doesNotMatch(main, /^import .* from "react-dom\/client"/m);
  assert.doesNotMatch(main, /^import HomePage /m);
  assert.match(main, /rootElement\.innerHTML = publicHomeMarkup\(\)/);
  assert.match(main, /import\("react"\)/);
  assert.match(main, /import\("react-dom\/client"\)/);
  assert.match(main, /https:\/\/app\.homeleadconnect\.org\/request-service/);
  assert.match(main, /https:\/\/professionals\.homeleadconnect\.org\//);
});

test("no-React public root uses the official full logo and V2 cinematic identity", () => {
  assert.match(main, /src="\/hlc-logo-transparent\.png"/);
  assert.doesNotMatch(main, /src="\/hlc-logo-ui\.png"/);
  assert.match(main, /class="hlc-v2-home"/);
  assert.match(main, /Real People\.<br \/><span>Real Opportunity\.<\/span>/);
  assert.match(main, /One Platform\.<br \/>Four Pathways\./);
  assert.match(main, /Connecting Homes\.<br \/>Creating <span/);
});

test("parser-seeded public hero preserves the optimized V2 first-paint contract", () => {
  assert.match(indexHtml, /src="\/hlc-logo-transparent\.png"/);
  assert.match(indexHtml, /hlc-v2-home hlc-v2-parser-seed/);
  assert.match(indexHtml, /Real People\.<br \/><span style="color:#79bdff!important">Real Opportunity\.<\/span>/);
  assert.match(indexHtml, /hlc-frontdoor-resident-hero-v2\.webp/);
  assert.match(indexHtml, /rel="preload" as="image" href="\/hlc-frontdoor-resident-hero-v2\.webp" fetchpriority="high"/);
});

test("public front door keeps shared parser authority while adding the V2 visual layer", () => {
  assert.match(indexHtml, /public-home-app-reconciliation-20260907\.css/);
  assert.match(main, /v2-cinematic-community-homepage-20260911\.css/);
  assert.match(v2Authority, /\.hlc-v2-home/);
  assert.match(v2Authority, /\.hlc-v2-hero/);
  assert.match(v2Authority, /\.hlc-v2-pathways/);
  assert.match(v2Authority, /@media/);
});

test("V2 public front door remains complete beyond the hero", () => {
  for (const expected of [
    "One Platform.",
    "Four Pathways.",
    "A Stronger Community Builds a Brighter Future.",
    "The HLC app puts the power of HomeLead Connect in your hands.",
    "Connecting Homes.",
    "Creating",
    "Infinite impact.",
    "HomeLead Connect LLC",
    "Harrisburg, Pennsylvania",
    "info@homeleadconnect.org",
  ]) {
    assert.match(main, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(main, /hlc-v2-card--resident/);
  assert.match(main, /hlc-v2-card--professional/);
  assert.match(main, /hlc-v2-card--partner/);
  assert.match(main, /hlc-v2-card--community/);
  assert.match(main, /hlc-v2-horizon-band/);
  assert.match(main, /href="mailto:info@homeleadconnect\.org">info@homeleadconnect\.org<\/a>/);
});
