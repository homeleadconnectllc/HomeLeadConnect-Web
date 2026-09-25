import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicNav = readFileSync("src/components/PublicSiteNav.tsx", "utf8");
const standaloneHome = readFileSync("src/standalonePublicHome.ts", "utf8");
const visualFamily = readFileSync("src/styles/mockup-authority-20260924.css", "utf8");
const sharedMenuLayer = readFileSync("src/styles/public-menu-layer-20260925.css", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8");

test("the official circular logo controls the menu without a second menu button", () => {
  assert.match(publicNav, /className="hlc-board-brand"/);
  assert.match(publicNav, /aria-label=\{menuOpen\s*\?\s*"Close HomeLead Connect menu"\s*:\s*"Open HomeLead Connect menu"\}/);
  assert.match(publicNav, /className="hlc-navbar-master-logo"[\s\S]*?src=\{NAV_LOGO\}[\s\S]*?data-hlc-master-logo="true"[\s\S]*?alt=""[\s\S]*?aria-hidden="true"/);
  assert.match(publicNav, /aria-expanded=\{menuOpen\}[\s\S]*?aria-controls="hlc-public-menu"/);
  assert.match(standaloneHome, /trigger\.append\(logo,make\("span","hlc-brand-accessible-label","HomeLead Connect"\)\)/);
  assert.match(standaloneHome, /trigger\.setAttribute\("aria-controls","hlc-public-menu"\)/);
  assert.doesNotMatch(publicNav, /<Menu\b|<X\b|hlc-navbar-toggle/);
});

test("logo menu has visible focus, an actual hidden state, and reduced motion", () => {
  assert.match(visualFamily, /\.hlc-public-menu-backdrop\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(visualFamily, /\.hlc-board-brand:focus-visible/);
  assert.match(visualFamily, /\.hlc-board-brand\[aria-expanded=(?:"true"|true)\]/);
  assert.match(visualFamily, /prefers-reduced-motion:reduce/);
  assert.match(publicNav, /event\.key\s*===\s*"Escape"/);
  assert.match(standaloneHome, /e\.key==="Escape"/);
});

test("React public menu stays above page stacking contexts and contains interaction", () => {
  assert.match(publicNav, /style=\{menuOpen\s*\?\s*\{\s*zIndex:\s*10000\s*\}\s*:\s*undefined\}/);
  assert.match(publicNav, /document\.body\.style\.overflow\s*=\s*"hidden"/);
  assert.match(publicNav, /document\.body\.style\.overflow\s*=\s*priorOverflow/);
  assert.match(publicNav, /event\.key\s*!==\s*"Tab"/);
  assert.match(publicNav, /last\.focus\(\)/);
  assert.match(publicNav, /first\.focus\(\)/);
  assert.match(publicNav, /onPointerDown=\{\(event\)\s*=>/);
  assert.match(publicNav, /event\.target\s*===\s*event\.currentTarget/);
  assert.match(publicNav, /maxHeight:\s*"calc\(100dvh - 76px\)"/);
});

test("shared menu layer protects both React public pages and standalone Home", () => {
  assert.match(mainEntry, /import "\.\/styles\/public-menu-layer-20260925\.css"/);
  assert.match(sharedMenuLayer, /\.hlc-board-nav\[data-menu-open="true"\]/);
  assert.match(sharedMenuLayer, /\.hlc-board-nav:has\(\.hlc-public-menu-backdrop:not\(\[hidden\]\)\)/);
  assert.match(sharedMenuLayer, /z-index:\s*10000/);
  assert.match(sharedMenuLayer, /isolation:\s*isolate/);
});
