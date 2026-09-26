import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const standaloneHome = readFileSync(new URL("../standalonePublicHome.ts", import.meta.url), "utf8");
const homePathwayDefer = readFileSync(new URL("../styles/home-pathway-defer-20260926.css", import.meta.url), "utf8");
const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");

test("public homepage has one lightweight presentation authority", () => {
  assert.match(main, /import\("\.\/standalonePublicHome"\)/);
  assert.match(main, /mountStandalonePublicHome\(rootElement\)/);
  assert.doesNotMatch(main, /publicHomeMarkup/);
  assert.doesNotMatch(main, /rootElement\.innerHTML/);
  assert.doesNotMatch(standaloneHome, /\.innerHTML\s*=/);
  assert.match(standaloneHome, /replaceChildren\(\)/);
  assert.match(standaloneHome, /createElement/);
  assert.match(standaloneHome, /createElementNS/);
  assert.doesNotMatch(indexHtml, /hlc-v2-parser-seed/);
  assert.doesNotMatch(indexHtml, /root\.innerHTML/);
  assert.match(main, /standalonePublicHome/);
});

test("public homepage preserves optimized hero discovery", () => {
  assert.match(indexHtml, /rel="preload" as="image" href="\/hlc-homepage-hero-welcome-doorway-20260917\.webp"/);
  assert.match(standaloneHome, /img\.src\s*=\s*"\/hlc-homepage-hero-welcome-doorway-20260917\.webp"/);
  assert.match(standaloneHome, /mockup-authority-20260924\.css/);
});

test("public homepage preserves owner-approved destinations", () => {
  for (const href of ["/homeowners", "/professionals", "/partners", "/community"]) {
    assert.match(standaloneHome, new RegExp(href.replace("/", "\\/")));
  }
  assert.match(standaloneHome, /trigger\.setAttribute\(\s*"aria-controls"\s*,\s*"hlc-public-menu"\s*\)/);
});

test("public homepage removes the standalone footer from the rendered page", () => {
  assert.match(homePathwayDefer, /\.hcx-shell\s*\+\s*\.hlc-public-footer\s*\{/);
  assert.match(homePathwayDefer, /display\s*:\s*none\s*!important/);
});

test("authenticated application remains lazy and isolated from public root", () => {
  assert.match(main, /import\("\.\/styles\/app-shell-entry"\)/);
  assert.match(main, /import\("\.\/App\.tsx"\)/);
  assert.match(main, /AccountAccessProvider/);
  assert.doesNotMatch(standaloneHome, /react-dom\/client/);
  assert.doesNotMatch(standaloneHome, /react-router-dom/);
});
