import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const info = readFileSync("src/pages/PublicInfo.tsx", "utf8");
const journey = readFileSync("src/pages/PublicJourney.tsx", "utf8");
const authority = readFileSync("src/styles/public-owner-visual-final-20260918.css", "utf8");

test("M3 preserves the locked professional trial and price language", () => {
  assert.match(journey, /14-day free business trial/);
  assert.match(journey, /\$49\.99 per month after the trial/);
  assert.match(journey, /\$49\.99/);
  assert.match(journey, /payment method is required/);
  assert.match(journey, /Service payments stay separate/);
});

test("M3 preserves the public supporting destinations", () => {
  for (const route of ["/request-service","/how-it-works","/platform-disclosure","/professional-application","/contact","/terms"]) {
    assert.ok(journey.includes(route) || info.includes(route), "Missing protected public destination " + route);
  }
});

test("M3 preserves About ownership and AI-team presentation", () => {
  assert.match(info, /Antoine Washington/);
  assert.match(info, /Kendrell · Dion · Diamond/);
  assert.match(info, /Founder & builder/);
  assert.match(info, /Design credit/);
});

test("M3 keeps supporting public surfaces in the flat visual family", () => {
  assert.match(authority, /\.hlc-public-board-page/);
  assert.match(authority, /border-radius:0!important/);
  assert.match(authority, /box-shadow:none!important/);
  assert.match(authority, /background:transparent!important/);
});

test("M3 preserves route-specific public imagery authorities", () => {
  for (const asset of [
    "page-about",
    "page-services",
    "page-pricing",
    "page-trust",
    "page-demo",
  ]) {
    assert.ok(info.includes(asset) || journey.includes(asset), "Missing imagery authority " + asset);
  }
});
