import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
const index = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const home = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const nav = readFileSync(new URL("../components/PublicSiteNav.tsx", import.meta.url), "utf8");
const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");

test("canonical public root exposes approved account-access entry points through shared navigation", () => {
  assert.match(home, /PublicSiteNav/);
  assert.match(nav, /appUrl\("\/login"\)/);
  assert.match(nav, /appUrl\("\/register"\)/);
  assert.match(nav, />Sign In<\/a>/);
  assert.match(nav, />Get Started<\/a>/);
});

test("public root uses the owner-approved single React presentation authority", () => {
  assert.match(main, /import\("\.\/pages\/HomePage\.tsx"\)/);
  assert.match(main, /createElement\(HomePage\)/);
  assert.doesNotMatch(main, /publicHomeMarkup|rootElement\.innerHTML/);
  assert.doesNotMatch(index, /hlc-v2-parser-seed|root\.innerHTML/);
  assert.match(index, /rel="preload" as="image" href="\/home-hero-authority-desktop-20260916\.webp"/);
  assert.match(index, /rel="preload" as="image" href="\/hlc-homepage-hero-welcome-doorway-20260917\.webp"/);
  for (const destination of ["/homeowners", "/professionals", "/partners", "/community"]) {
    assert.ok(home.includes(`href: "${destination}"`), `Missing approved homepage destination ${destination}`);
  }
});

test("canonical account routes remain declared for the public access flow", () => {
  assert.match(router, /path="\/login" element={<Login\/>}/);
  assert.match(router, /path="\/register" element={<Register\/>}/);
});
