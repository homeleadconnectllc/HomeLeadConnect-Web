import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const compactMobileAuthority = readFileSync("src/styles/mobile-embedded-browser-authority.css", "utf8");
const indexHtml = readFileSync("index.html", "utf8");

test("compact iPhone shell reserves the status-bar safe area", () => {
  assert.match(indexHtml, /viewport-fit=cover/);
  assert.match(indexHtml, /apple-mobile-web-app-status-bar-style/);
  assert.match(compactMobileAuthority, /min-height:\s*calc\(70px \+ env\(safe-area-inset-top\)\) !important/);
  assert.match(compactMobileAuthority, /padding:\s*calc\(14px \+ env\(safe-area-inset-top\)\)/);
  assert.doesNotMatch(compactMobileAuthority, /\.hlc-compact-device \.hlc-signed-in-shell > \.hlc-navbar \{[\s\S]*min-height:\s*0 !important/);
});

test("compact iPhone navigation drawer starts below the protected header", () => {
  assert.match(compactMobileAuthority, /\.hlc-compact-device \.hlc-mobile-portal \{[\s\S]*inset:\s*calc\(70px \+ env\(safe-area-inset-top\)\) 0 0 !important/);
  assert.match(compactMobileAuthority, /height:\s*calc\(100dvh - 70px - env\(safe-area-inset-top\)\) !important/);
});
