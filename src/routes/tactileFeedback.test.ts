import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const premiumEffects = readFileSync("src/styles/premium-effects.css", "utf8");

test("interactive HLC controls have tactile lift press and pop-back feedback", () => {
  assert.match(premiumEffects, /transition: transform 180ms/);
  assert.match(premiumEffects, /translateY\(-1px\) scale\(1\.02\)/);
  assert.match(premiumEffects, /translateY\(1px\) scale\(\.97\)/);
  assert.match(premiumEffects, /transition-duration: 70ms/);
  assert.match(premiumEffects, /\.hlc-mobile-tabbar a/);
  assert.match(premiumEffects, /\.hlc-mobile-work-dock a/);
  assert.match(premiumEffects, /\.hlc-agent-dock a/);
  assert.match(premiumEffects, /\[role="tab"\]/);
  assert.match(premiumEffects, /\[role="switch"\]/);
  assert.match(premiumEffects, /prefers-reduced-motion: reduce/);
  assert.match(premiumEffects, /transition: none !important/);
});
