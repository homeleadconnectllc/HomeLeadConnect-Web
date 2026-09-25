import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicNav = readFileSync("src/components/PublicSiteNav.tsx", "utf8");
const standaloneHome = readFileSync("src/standalonePublicHome.ts", "utf8");
const visualFamily = readFileSync("src/styles/mockup-authority-20260924.css", "utf8");

test("the official circular logo controls the menu without a second menu button", () => {
  assert.match(publicNav, /className="hlc-board-brand"/);
  assert.match(publicNav, /aria-label=\{menuOpen\?"Close HomeLead Connect menu":"Open HomeLead Connect menu"\}/);
  assert.match(publicNav, /<img className="hlc-navbar-master-logo" src=\{NAV_LOGO\} data-hlc-master-logo="true" alt="" aria-hidden="true"/);
  assert.match(publicNav, /aria-expanded=\{menuOpen\} aria-controls="hlc-public-menu"/);
  assert.match(standaloneHome, /trigger\.append\(logo,make\("span","hlc-brand-accessible-label","HomeLead Connect"\)\)/);
  assert.match(standaloneHome, /trigger\.setAttribute\("aria-controls","hlc-public-menu"\)/);
  assert.doesNotMatch(publicNav, /<Menu\b|<X\b|hlc-navbar-toggle/);
});

test("logo menu has visible focus, an actual hidden state, and reduced motion", () => {
  assert.match(visualFamily, /\.hlc-public-menu-backdrop\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(visualFamily, /\.hlc-board-brand:focus-visible/);
  assert.match(visualFamily, /\.hlc-board-brand\[aria-expanded=(?:"true"|true)\]/);
  assert.match(visualFamily, /prefers-reduced-motion:reduce/);
  assert.match(publicNav, /event\.key==="Escape"/);
  assert.match(standaloneHome, /e\.key==="Escape"/);
});
