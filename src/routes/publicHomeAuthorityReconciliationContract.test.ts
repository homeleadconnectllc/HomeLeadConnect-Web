import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entry = readFileSync("src/standalonePublicHome.ts","utf8");
const home = readFileSync("src/styles/public-home-owner-authority-20260918.css","utf8");

test("standalone home loads canonical public authority before its homepage extension", () => {
  const shared = entry.indexOf('public-visual-family-20260919.css');
  const homeIndex = entry.indexOf('public-home-owner-authority-20260918.css');
  assert.ok(shared >= 0 && homeIndex > shared);
});

test("homepage extension cannot repaint shared navigation or footer", () => {
  assert.doesNotMatch(home,/\.hlc-owner-home \.hlc-board-nav|\.hlc-public-footer-home-authority/);
  assert.match(home,/\.hlc-owner-hero/);
  assert.match(home,/\.hlc-owner-pathways/);
  assert.match(home,/\.hlc-owner-mission/);
});


test("homepage hero supporting copy remains readable over the dark desktop image treatment", () => {
  assert.match(home,/\.hlc-owner-tagline\{[^}]*color:#f8fafc/);
  assert.match(home,/\.hlc-owner-price\{[^}]*color:#f8fafc/);
  assert.doesNotMatch(home,/\\n/);
});
