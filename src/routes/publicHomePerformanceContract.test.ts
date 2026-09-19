import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("public homepage has one React presentation authority", () => {
  assert.match(main, /import\("\.\/pages\/HomePage\.tsx"\)/);
  assert.match(main, /createElement\(HomePage\)/);
  assert.doesNotMatch(main, /publicHomeMarkup/);
  assert.doesNotMatch(main, /rootElement\.innerHTML/);
  assert.doesNotMatch(indexHtml, /hlc-v2-parser-seed/);
  assert.doesNotMatch(indexHtml, /root\.innerHTML/);
});

test("public homepage preserves optimized hero discovery", () => {
  assert.match(indexHtml, /rel="preload" as="image" href="\/home-hero-authority-desktop-20260916\.webp"/);
  assert.match(indexHtml, /rel="preload" as="image" href="\/home-hero-authority-mobile-20260916\.webp"/);
  assert.match(home, /public-home-owner-authority-20260918\.css/);
});

test("public homepage preserves owner-approved destinations", () => {
  for (const href of ["/homeowners", "/professionals", "/partners", "/community"]) {
    assert.match(home, new RegExp(`href: "${href.replace("/", "\\/")}"`));
  }
  assert.match(home, /PublicSiteNav/);
});

test("homepage footer is rendered with zero logo imagery", () => {
  assert.match(main, /createElement\(Footer, \{ showLogo: false \}\)/);
  assert.match(footer, /showLogo && <img/);
  assert.doesNotMatch(home, /hlc-public-footer-master-logo/);
});

test("authenticated application remains lazy and isolated from public root", () => {
  assert.match(main, /import\("\.\/styles\/app-shell-entry"\)/);
  assert.match(main, /import\("\.\/App\.tsx"\)/);
  assert.match(main, /AccountAccessProvider/);
  assert.doesNotMatch(home, /react-router-dom/);
});
