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

test("no-React public root uses the responsive HLC UI mark and approved front-door geometry", () => {
  assert.match(main, /src="\/hlc-logo-ui\.png"/);
  assert.doesNotMatch(main, /src="\/hlc-logo-transparent\.png"/);
  assert.doesNotMatch(main, /hlc-logo-final\.png/);
  assert.doesNotMatch(main, /src="\/hlc-icon\.jpeg"/);
  assert.match(main, /width="58" height="58"/);
  assert.match(main, /Home help should feel easier\./);
  assert.match(main, /Home services, connected better/i);
});

test("parser-seeded public hero uses the approved front-door authority", () => {
  assert.match(indexHtml, /src="\/hlc-logo-ui\.png"/);
  assert.match(indexHtml, /width="58" height="58"/);
  assert.match(indexHtml, /Home help should feel easier\./);
  assert.match(indexHtml, /hlc-frontdoor-resident-hero-final\.jpg/);
  assert.match(indexHtml, /rel="preload" as="image" href="\/hlc-frontdoor-resident-hero-final\.jpg" fetchpriority="high"/);
});

test("public front door has one shared visual authority for parser seed and runtime markup", () => {
  assert.match(indexHtml, /public-home-app-reconciliation-20260907\.css/);
  assert.doesNotMatch(indexHtml, /One front door\./);
  assert.doesNotMatch(main, /One front door\./);
  assert.doesNotMatch(main, /supplementalStyle/);
  assert.match(publicAuthority, /\.hlc-frontdoor-site/);
  assert.match(publicAuthority, /\.hlc-frontdoor-hero/);
  assert.match(publicAuthority, /\.hlc-frontdoor-actions/);
  assert.match(publicAuthority, /@media\(max-width:560px\)/);
});

test("approved public front door remains complete beyond the hero", () => {
  for (const expected of [
    "Renters included",
    "Start with the need, not the paperwork.",
    "A clearer conversation from the start.",
    "Four simple steps.",
    "Better service starts before the job begins.",
    "Tell us what your home needs.",
    "Start My Request",
  ]) {
    assert.match(main, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(main, /hlc-frontdoor-people-first\.webp/);
  assert.match(main, /hlc-frontdoor-professional\.webp/);
  assert.match(main, /hlc-frontdoor-footer/);
  assert.match(main, /href="tel:\+17172881785">\(717\) 288-1785<\/a>/);
  assert.match(main, /href="mailto:info@homeleadconnect\.org">info@homeleadconnect\.org<\/a>/);
});
