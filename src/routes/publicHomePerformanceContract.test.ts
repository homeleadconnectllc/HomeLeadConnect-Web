import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const v2Authority = readFileSync(new URL("../styles/v2-cinematic-community-homepage-20260911.css", import.meta.url), "utf8");
const boardAuthority = readFileSync(new URL("../styles/v2-board-alignment-20260912.css", import.meta.url), "utf8");
const familyAuthority = readFileSync(new URL("../styles/front-door-family-ecosystem-20260913.css", import.meta.url), "utf8");

const responsivePublicLogo = /src="\/hlc-logo-ui\.png"/;
const oversizedMasterLogo = /src="\/brand\/homelead-connect-master-transparent\.png"/;

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
  assert.match(main, /https:\/\/app\.homeleadconnect\.org\/professional-application/);
});

test("no-React public root uses the responsive derivative of the approved mark", () => {
  assert.match(main, responsivePublicLogo);
  assert.match(main, /width="180" height="180"/);
  assert.doesNotMatch(main, oversizedMasterLogo);
  assert.doesNotMatch(main, /\/hlc-logo-public\.webp/);
  assert.match(main, /class="hlc-board-home hlc-v2-home hlc-family-ecosystem"/);
  assert.match(main, /The Connected Experience/);
  assert.match(main, /One place for the next right move\./);
  assert.match(main, /Request service, find the right people, and keep the work connected from first conversation to follow-through\./);
  assert.match(main, /Request home service/);
  assert.match(main, /Meet the mission →/);
  assert.match(main, /Four Pathways<span>\.<\/span>/);
  assert.match(main, /Different experiences\. Same mission\. One connected ecosystem\./);
  assert.doesNotMatch(main, /Homes\. People\. Opportunity\./);
  assert.doesNotMatch(main, /<h1[^>]*>A stronger community/);
});

test("parser-seeded public hero preserves the optimized Connected Experience first-paint contract", () => {
  assert.match(indexHtml, responsivePublicLogo);
  assert.match(indexHtml, /width="180" height="180"/);
  assert.doesNotMatch(indexHtml, oversizedMasterLogo);
  assert.doesNotMatch(indexHtml, /\/hlc-logo-public\.webp/);
  assert.match(indexHtml, /hlc-v2-home hlc-v2-parser-seed/);
  assert.match(indexHtml, /The Connected Experience/);
  assert.match(indexHtml, /One place for the next right move\./);
  assert.match(indexHtml, /Request service, find the right people, and keep the work connected from first conversation to follow-through\./);
  assert.match(indexHtml, /Request home service/);
  assert.match(indexHtml, /Meet the mission →/);
  assert.doesNotMatch(indexHtml, /Homes\. People\. Opportunity\./);
  assert.doesNotMatch(indexHtml, /A stronger community <span style="color:#42b7ff">starts at home\.<\/span>/);
});

test("public front door keeps shared parser authority while adding the profile-protocol visual layer", () => {
  assert.match(indexHtml, /public-home-app-reconciliation-20260907\.css/);
  assert.match(main, /v2-cinematic-community-homepage-20260911\.css/);
  assert.match(main, /v2-board-alignment-20260912\.css/);
  assert.match(main, /front-door-family-ecosystem-20260913\.css/);
  assert.match(main, /frontdoor-profile-protocol-20260913\.css/);
  assert.match(v2Authority, /\.hlc-v2-home/);
  assert.match(boardAuthority, /--board-navy/);
  assert.match(familyAuthority, /\.hlc-board-home\.hlc-family-ecosystem/);
  assert.match(familyAuthority, /\.hlc-family-ecosystem \.hlc-board-pathway/);
  assert.match(familyAuthority, /\.hlc-family-vision/);
  assert.match(familyAuthority, /@media/);
});

test("Connected Experience public front door remains complete beyond the hero", () => {
  for (const expected of [
    "Four Pathways",
    "Different experiences. Same mission. One connected ecosystem.",
    "The HomeLead Connect vision",
    "A stronger community <span>starts here.</span>",
    "Ready when you are",
    "Start with the path that fits you.",
    "Business workspace: $49.99/month after a 14-day trial.",
    "For Residents",
    "For Professionals",
    "For Partners",
    "For Community",
    "HomeLead Connect",
  ]) {
    assert.match(main, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(main, /hlc-board-pathway--resident/);
  assert.match(main, /hlc-board-pathway--professional/);
  assert.match(main, /hlc-board-pathway--partner/);
  assert.match(main, /hlc-board-pathway--community/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/login"/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/register"/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/request-service"/);
  assert.match(main, /href="https:\/\/app\.homeleadconnect\.org\/professional-application"/);
});
