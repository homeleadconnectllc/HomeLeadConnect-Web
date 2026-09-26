import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicNav = readFileSync("src/components/PublicSiteNav.tsx", "utf8");
const standaloneHome = readFileSync("src/standalonePublicHome.ts", "utf8");
const visualFamily = readFileSync("src/styles/mockup-authority-20260924.css", "utf8");
const sharedMenuLayer = readFileSync("src/styles/public-menu-layer-20260925.css", "utf8");
const navigationFixes = readFileSync("src/styles/public-navigation-certification-fixes-20260926.css", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8");

test("the official circular logo controls the menu without a second menu button", () => {
  assert.match(publicNav, /className="hlc-board-brand"/);
  assert.match(publicNav, /aria-label=\{menuOpen\s*\?\s*"Close HomeLead Connect menu"\s*:\s*"Open HomeLead Connect menu"\}/);
  assert.match(publicNav, /className="hlc-navbar-master-logo"[\s\S]*?src=\{NAV_LOGO\}[\s\S]*?data-hlc-master-logo="true"[\s\S]*?alt=""[\s\S]*?aria-hidden="true"/);
  assert.match(publicNav, /aria-expanded=\{menuOpen\}[\s\S]*?aria-controls="hlc-public-menu"/);
  assert.match(standaloneHome, /trigger\.append\(logo, make\("span", "hlc-brand-accessible-label", "HomeLead Connect"\)\)/);
  assert.match(standaloneHome, /trigger\.setAttribute\("aria-controls", "hlc-public-menu"\)/);
  assert.doesNotMatch(publicNav, /<Menu\b|<X\b|hlc-navbar-toggle/);
});

test("logo menu has visible focus, an actual hidden state, and reduced motion", () => {
  assert.match(visualFamily, /\.hlc-public-menu-backdrop\[hidden\]\s*\{\s*display:\s*none/);
  assert.match(visualFamily, /\.hlc-board-brand:focus-visible/);
  assert.match(visualFamily, /\.hlc-board-brand\[aria-expanded=(?:"true"|true)\]/);
  assert.match(visualFamily, /prefers-reduced-motion:reduce/);
  assert.match(publicNav, /event\.key\s*===\s*"Escape"/);
  assert.match(standaloneHome, /event\.key\s*===\s*"Escape"/);
});

test("the official navigation logo pulses globally without layout movement and respects reduced motion", () => {
  assert.match(mainEntry, /import "\.\/styles\/public-navigation-certification-fixes-20260926\.css"/);
  assert.match(navigationFixes, /#root\s+\.hlc-navbar-master-logo\s*\{[\s\S]*?animation:\s*hlc-nav-logo-pulse\s+3\.6s\s+ease-in-out\s+infinite/);
  assert.match(navigationFixes, /@keyframes\s+hlc-nav-logo-pulse/);
  assert.match(navigationFixes, /transform:\s*scale\(1\.045\)/);
  assert.match(navigationFixes, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?#root\s+\.hlc-navbar-master-logo[\s\S]*?animation:\s*none/);
});

test("React public menu stays above page stacking contexts and contains interaction", () => {
  assert.match(publicNav, /data-menu-open=\{menuOpen\s*\?\s*"true"\s*:\s*"false"\}/);
  assert.match(sharedMenuLayer, /\.hlc-board-nav\[data-menu-open="true"\][\s\S]*?z-index:\s*10000/);
  assert.match(sharedMenuLayer, /\.hlc-board-nav\[data-menu-open="true"\][\s\S]*?isolation:\s*isolate/);
  assert.match(publicNav, /document\.body\.style\.overflow\s*=\s*"hidden"/);
  assert.match(publicNav, /document\.body\.style\.overflow\s*=\s*priorOverflow/);
  assert.match(publicNav, /event\.key\s*!==\s*"Tab"/);
  assert.match(publicNav, /last\.focus\(\)/);
  assert.match(publicNav, /first\.focus\(\)/);
  assert.match(publicNav, /onPointerDown=\{\(event\)\s*=>/);
  assert.match(publicNav, /event\.target\s*===\s*event\.currentTarget/);
  assert.match(publicNav, /className="hlc-public-menu-backdrop"/);
  assert.match(publicNav, /className="hlc-public-menu-panel"/);
});

test("standalone Home menu matches React focus, pointer, scroll, and ARIA behavior", () => {
  assert.match(standaloneHome, /header\.dataset\.menuOpen\s*=\s*"false"/);
  assert.match(standaloneHome, /header\.dataset\.menuOpen\s*=\s*"true"/);
  assert.match(standaloneHome, /trigger\.setAttribute\("aria-label", "Open HomeLead Connect menu"\)/);
  assert.match(standaloneHome, /trigger\.setAttribute\("aria-label", "Close HomeLead Connect menu"\)/);
  assert.match(standaloneHome, /document\.body\.style\.overflow\s*=\s*"hidden"/);
  assert.match(standaloneHome, /document\.body\.style\.overflow\s*=\s*priorOverflow/);
  assert.match(standaloneHome, /requestAnimationFrame\(\(\)\s*=>\s*getMenuControls\(\)\[0\]\?\.focus\(\)\)/);
  assert.match(standaloneHome, /addEventListener\("pointerdown"/);
  assert.doesNotMatch(standaloneHome, /addEventListener\("mousedown"/);
  assert.match(standaloneHome, /event\.key\s*!==\s*"Tab"/);
  assert.match(standaloneHome, /last\.focus\(\)/);
  assert.match(standaloneHome, /first\.focus\(\)/);
  assert.match(standaloneHome, /requestAnimationFrame\(\(\)\s*=>\s*trigger\.focus\(\)\)/);
});

test("shared menu layer protects both surfaces and owns responsive header offset", () => {
  assert.match(mainEntry, /import "\.\/styles\/public-menu-layer-20260925\.css"/);
  assert.match(sharedMenuLayer, /--hlc-public-nav-height:\s*76px/);
  assert.match(sharedMenuLayer, /@media\(max-width:900px\)/);
  assert.match(sharedMenuLayer, /--hlc-public-nav-height:\s*68px/);
  assert.match(sharedMenuLayer, /\.hlc-public-menu-backdrop\s*\{[\s\S]*?inset:var\(--hlc-public-nav-height\) 0 0/);
  assert.match(sharedMenuLayer, /\.hlc-public-menu-panel\s*\{[\s\S]*?max-height:calc\(100dvh - var\(--hlc-public-nav-height\)\)/);
  assert.match(sharedMenuLayer, /\.hlc-board-nav\[data-menu-open="true"\]/);
  assert.match(sharedMenuLayer, /\.hlc-board-nav:has\(\.hlc-public-menu-backdrop:not\(\[hidden\]\)\)/);
  assert.match(sharedMenuLayer, /z-index:\s*10000/);
  assert.match(sharedMenuLayer, /isolation:\s*isolate/);
});
