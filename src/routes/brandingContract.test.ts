import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const authShell = readFileSync("src/components/auth/AuthShell.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const home = readFileSync("src/pages/HomePage.tsx", "utf8");
const indexHtml = readFileSync("index.html", "utf8");
const manifest = readFileSync("public/manifest.webmanifest", "utf8");
const serviceWorker = readFileSync("public/sw.js", "utf8");

test("shared HLC surfaces use the optimized official icon", () => {
  for (const source of [navbar, authShell, footer, home]) {
    assert.match(source, /\/hlc-icon\.jpeg/);
    assert.doesNotMatch(source, /\/hlc-logo-final\.png/);
  }
});

test("browser, install, and notification branding use the optimized official icon", () => {
  assert.match(indexHtml, /rel="icon" type="image\/jpeg" href="\/hlc-icon\.jpeg"/);
  assert.match(indexHtml, /rel="apple-touch-icon" href="\/hlc-icon\.jpeg"/);
  assert.doesNotMatch(indexHtml, /favicon\.svg/);
  assert.match(manifest, /"src": "\/hlc-icon\.jpeg"/);
  assert.doesNotMatch(manifest, /hlc-logo-final\.png|hlc-touch-icon\.svg/);
  assert.match(serviceWorker, /icon: "\/hlc-icon\.jpeg"/);
  assert.match(serviceWorker, /badge: "\/hlc-icon\.jpeg"/);
  assert.doesNotMatch(serviceWorker, /hlc-logo-final\.png|hlc-icon\.png/);
});
