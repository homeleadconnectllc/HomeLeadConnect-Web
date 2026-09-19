import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const footer = readFileSync(new URL("../components/Footer.tsx", import.meta.url), "utf8");
const standaloneHome = readFileSync(new URL("../standalonePublicHome.ts", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("public homepage has one lightweight presentation authority", () => {
  assert.match(main, /import\("\.\/standalonePublicHome"\)/);
  assert.match(main, /mountStandalonePublicHome\(rootElement\)/);
  assert.doesNotMatch(main, /publicHomeMarkup/);
  assert.doesNotMatch(main, /rootElement\.innerHTML/);
  assert.doesNotMatch(indexHtml, /hlc-v2-parser-seed/);
  assert.doesNotMatch(indexHtml, /root\.innerHTML/);
  assert.match(main, /standalonePublicHome/);
});

test("public homepage preserves optimized hero discovery", () => {
  assert.match(indexHtml, /rel="preload" as="image" href="\/home-hero-authority-desktop-20260916\.webp"/);
  assert.match(indexHtml, /rel="preload" as="image" href="\/home-hero-authority-mobile-20260916\.webp"/);
  assert.match(standaloneHome, /public-home-owner-authority-20260918\.css/);
});

test("public homepage preserves owner-approved destinations", () => {
  for (const href of ["/homeowners", "/professionals", "/partners", "/community"]) {
    assert.match(standaloneHome, new RegExp(href.replace("/", "\\/")));
  }
  assert.match(standaloneHome, /hlc-public-menu-trigger/);
});

test("homepage footer is rendered with zero logo imagery", () => {
  assert.match(standaloneHome, /hlc-public-footer-home-authority/);
  assert.match(footer, /showLogo && <img/);
  assert.doesNotMatch(standaloneHome, /hlc-public-footer-master-logo/);
  assert.doesNotMatch(standaloneHome, /<footer[^>]*>[\\s\\S]*?<img/);
});

test("authenticated application remains lazy and isolated from public root", () => {
  assert.match(main, /import\("\.\/styles\/app-shell-entry"\)/);
  assert.match(main, /import\("\.\/App\.tsx"\)/);
  assert.match(main, /AccountAccessProvider/);
  assert.doesNotMatch(standaloneHome, /react-dom\\/client/);
  assert.doesNotMatch(standaloneHome, /react-router-dom/);
});
