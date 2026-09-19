import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const standaloneHome = readFileSync(new URL("../standalonePublicHome.ts", import.meta.url), "utf8");
const nav = readFileSync(new URL("../components/PublicSiteNav.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");

test("canonical public root exposes approved account-access entry points through shared navigation", () => {
  assert.match(standaloneHome, /hlc-public-menu-trigger/);
  assert.match(standaloneHome, /APP_ORIGIN}\/login/);
  assert.match(standaloneHome, /APP_ORIGIN}\/register/);
  assert.match(standaloneHome, /link\(`\\$\{APP_ORIGIN\}\\/login`[^\n]*"Sign In"\)/);
  assert.match(standaloneHome, /link\(`\\$\{APP_ORIGIN\}\\/register`[^\n]*"Get Started"\)/);
  assert.match(nav, /appUrl\("\/login"\)/);
  assert.match(nav, /appUrl\("\/register"\)/);
});

test("public root uses the owner-approved lightweight presentation authority", () => {
  assert.match(main, /import\("\.\/standalonePublicHome"\)/);
  assert.match(main, /mountStandalonePublicHome\(rootElement\)/);
  assert.doesNotMatch(main, /import\("\.\/pages\/HomePage\.tsx"\)/);
  assert.doesNotMatch(standaloneHome, /react-dom\/client|react-router-dom/);
  assert.doesNotMatch(index, /hlc-v2-parser-seed|root\.innerHTML/);
  assert.doesNotMatch(standaloneHome, /\.innerHTML\s*=/);
  assert.match(standaloneHome, /replaceChildren\(\)/);
  assert.match(index, /rel="preload" as="image" href="\/home-hero-authority-desktop-20260916\.webp"/);
  assert.match(index, /rel="preload" as="image" href="\/home-hero-authority-mobile-20260916\.webp"/);
  for (const destination of ["/homeowners", "/professionals", "/partners", "/community"]) {
    assert.ok(standaloneHome.includes(destination), `Missing approved homepage destination ${destination}`);
  }
});

test("canonical account routes remain declared for the public access flow", () => {
  assert.match(router, /path="\/login" element={<Login\/>}/);
  assert.match(router, /path="\/register" element={<Register\/>}/);
});
