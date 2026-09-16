import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const homePage = readFileSync("src/pages/HomePage.tsx", "utf8");

function publicHomeFooterSource(source: string) {
  const match = source.match(/<footer className="hlc-board-footer hlc-public-footer-home-authority">([\s\S]*?)<\/footer>/);
  assert.ok(match, "public homepage footer must remain present");
  return match[1];
}

test("public homepage footer contains no extra HomeLead Connect logo", () => {
  const footer = publicHomeFooterSource(homePage);
  assert.doesNotMatch(footer, /<img\b/);
  assert.doesNotMatch(footer, /hlc-public-footer-home-authority__brand/);
  assert.match(footer, /<strong>HomeLead Connect<\/strong>/);
  assert.match(footer, /Connecting Homes\. Creating Opportunities\./);
});
