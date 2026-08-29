import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("public home stays outside the authenticated application bundle while retaining route delivery", () => {
  assert.match(main, /isPublicHome/);
  assert.doesNotMatch(main, /BrowserRouter/);
  assert.match(main, /import\("\.\/App\.tsx"\)/);
  assert.doesNotMatch(home, /react-router-dom/);
  assert.doesNotMatch(footer, /react-router-dom/);
  assert.match(home, /href="\/pricing"/);
  assert.match(home, /data-route-to="\/request-service"/);
  assert.match(home, /data-route-to="\/app"/);
  assert.match(home, /data-route-to="\/community"/);
  assert.match(home, /loading="lazy"/);
  assert.doesNotMatch(footer, /hlc-logo-final\.png/);
});

test("public home renders without paying React startup cost", () => {
  assert.doesNotMatch(main, /^import .* from "react"/m);
  assert.doesNotMatch(main, /^import .* from "react-dom\/client"/m);
  assert.doesNotMatch(main, /^import HomePage /m);
  assert.match(main, /rootElement\.innerHTML = publicHomeMarkup\(\)/);
  assert.match(main, /import\("react"\)/);
  assert.match(main, /import\("react-dom\/client"\)/);
  assert.match(main, /data-route-to="\/request-service"/);
  assert.match(main, /data-route-to="\/app"/);
  assert.match(main, /data-route-to="\/community"/);
  assert.match(main, /aria-label="Legal and accessibility"/);
});

test("no-React public root uses the canonical transparent HLC mark and rejects legacy logo files", () => {
  assert.match(main, /src="\/hlc-logo-transparent\.png"/);
  assert.doesNotMatch(main, /hlc-logo-final\.png/);
  assert.doesNotMatch(main, /src="\/hlc-icon\.jpeg"/);
  assert.match(main, /width="40" height="40"/);
  assert.match(main, /width="28" height="28"/);
});

test("parser-seeded public hero cannot promote the oversized canonical logo into the critical LCP lane", () => {
  assert.match(indexHtml, /src="\/hlc-logo-transparent\.png"[^>]*fetchpriority="low"/s);
  assert.match(indexHtml, /width="40" height="40"/);
});

test("parser-seeded mobile hero geometry matches the supplemental public-home authority", () => {
  assert.match(indexHtml, /\.hlc-home-hero h1\{font-size:36px!important;line-height:1\.06!important;letter-spacing:-1\.2px!important;max-width:390px\}/);
  assert.match(indexHtml, /\.hlc-home-hero p\{font-size:17px!important\}/);
  assert.match(indexHtml, /\.hlc-home-hero-actions\{margin-top:22px!important\}/);
  assert.match(main, /\.hlc-home-hero h1 \{ font-size: 36px !important; line-height: 1\.06 !important; letter-spacing: -1\.2px !important; max-width: 390px; \}/);
  assert.match(main, /\.hlc-home-hero p \{ font-size: 17px !important; \}/);
  assert.match(main, /\.hlc-home-hero-actions \{ margin-top: 22px !important; \}/);
});
