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
const centeredCopyAuthority = readFileSync(new URL("../styles/public-home-centered-copy-authority-20260915.css", import.meta.url), "utf8");

const officialPublicLogo = /src="\/brand\/homelead-connect-master-transparent\.png"/;

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

test("no-React public root uses the official circular master mark", () => {
  assert.match(main, officialPublicLogo);
  assert.match(main, /width="1254" height="1254"/);
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
  assert.match(indexHtml, officialPublicLogo);
  assert.match(indexHtml, /width="1254" height="1254"/);
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

test("public homepage centers responsive copy and keeps service request as a text action", () => {
  assert.match(main, /public-home-centered-copy-authority-20260915\.css/);
  assert.match(home, /public-home-centered-copy-authority-20260915\.css/);
  assert.match(main, /class="hlc-mobile-sign-in-link"[^>]*>Sign In<\/a>/);
  assert.doesNotMatch(main, /hlc-mobile-request-link/);
  assert.match(centeredCopyAuthority, /text-align:center!important/);
  assert.match(centeredCopyAuthority, /font-size:clamp\(38px,10\.25vw,48px\)!important/);
  assert.match(centeredCopyAuthority, /"Avenir Next","SF Pro Display","Segoe UI Variable Display"/);
  assert.match(centeredCopyAuthority, /\.hlc-board-pathway-heading h2 span[\s\S]*display:inline!important/);
  assert.match(centeredCopyAuthority, /\.hlc-board-pathway-content[\s\S]*position:relative!important/);
  assert.match(centeredCopyAuthority, /background:transparent!important/);
  assert.match(centeredCopyAuthority, /color:var\(--hlc-resident\)!important/);
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
