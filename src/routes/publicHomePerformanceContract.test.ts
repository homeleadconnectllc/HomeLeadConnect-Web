import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const publicAuthority = readFileSync(new URL("../../public/public-home-app-reconciliation-20260907.css", import.meta.url), "utf8");

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

test("public front door has one shared visual authority for parser seed and runtime markup", () => {
  assert.match(indexHtml, /public-home-app-reconciliation-20260907\.css/);
  assert.doesNotMatch(indexHtml, /\.hlc-home-hero h1\{font-size:36px!important/);
  assert.doesNotMatch(main, /\.hlc-home-hero h1 \{ font-size: 36px !important/);
  assert.doesNotMatch(main, /supplementalStyle/);
  assert.match(publicAuthority, /#root \.hlc-home-hero/);
  assert.match(publicAuthority, /#root \.hlc-home-hero h1,#root \.hlc-home-hero-title/);
  assert.match(publicAuthority, /#root \.hlc-home-hero-actions/);
  assert.match(publicAuthority, /@media\(max-width:600px\)/);
});
