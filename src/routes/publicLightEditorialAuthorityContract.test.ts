import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const index = readFileSync("index.html","utf8");
const publicFamily = readFileSync("src/styles/public-visual-family-20260919.css","utf8");
const home = readFileSync("src/styles/public-home-owner-authority-20260918.css","utf8");

test("public family is one light editorial authority", () => {
  assert.match(publicFamily,/--hlc-public-bg:#f7fbff/);
  assert.match(publicFamily,/--hlc-public-surface:#ffffff/);
  assert.match(publicFamily,/--hlc-public-ink:#172033/);
  assert.match(publicFamily,/background:rgba\(255,255,255,\.94\)!important/);
  assert.doesNotMatch(index,/frontdoor-accessibility-authority-20260907\.css/);
});

test("standalone homepage belongs to the same light family outside its photographic hero", () => {
  assert.match(home,/\.hlc-owner-home\{[\s\S]*background:#f7fbff/);
  assert.match(home,/\.hlc-owner-pathway[\s\S]*color:#172033/);
  assert.doesNotMatch(home,/linear-gradient\(180deg,#14181d,#181d22/);
});
