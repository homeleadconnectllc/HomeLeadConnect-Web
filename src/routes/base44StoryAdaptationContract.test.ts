import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/standalonePublicHome.ts", "utf8");
const styles = readFileSync("src/styles/base44-story-adaptation-20260927.css", "utf8");

test("published layout narrative uses HCX destinations and does not claim lab metrics", () => {
  assert.match(page, /main\.append\(header, hero, journey, audience, pathSection, mission\)/);
  assert.match(page, /"\/homeowners", "Explore resident support/);
  assert.match(page, /"\/professionals", "Explore professional access/);
  assert.doesNotMatch(page, /1,200\+|98%|340 vetted/);
});

test("adapted sections retain the existing dark field and fit narrow screens", () => {
  assert.match(styles, /\.hcx-story-journey,[\s\S]*?background: #081d35/);
  assert.match(styles, /@media \(max-width: 480px\)[\s\S]*?grid-template-columns: 1fr/);
  assert.match(styles, /\.hcx-story-audiences \+ \.hcx-pathway-links \{ margin-top: 0/);
});
