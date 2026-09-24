import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicNav = readFileSync("src/components/PublicSiteNav.tsx", "utf8");
const standaloneHome = readFileSync("src/standalonePublicHome.ts", "utf8");
const visualFamily = readFileSync("src/styles/public-visual-family-20260919.css", "utf8");

test("the official circular logo opens the menu without a separate menu button", () => {
  assert.match(publicNav, /className="hlc-board-brand hlc-public-menu-trigger"/);
  assert.match(publicNav, /aria-label=\{menuOpen \? "Close HomeLead Connect menu" : "Open HomeLead Connect menu"\}/);
  assert.match(publicNav, /<img className="hlc-navbar-master-logo" data-hlc-master-logo="true"/);
  assert.match(standaloneHome, /trigger\.append\(logo, make\("span", "hlc-brand-accessible-label", "HomeLead Connect"\)\)/);
  assert.doesNotMatch(publicNav, /hlc-public-home-logo|hlc-public-menu-visible-label/);
  assert.doesNotMatch(standaloneHome, /hlc-public-home-logo|hlc-public-menu-visible-label/);
  assert.doesNotMatch(publicNav, /hlc-public-menu-cue|<Menu\b|<X\b/);
});

test("the logo menu cue is accessible and motion-safe", () => {
  assert.match(visualFamily, /hlc-public-menu-trigger::after/);
  assert.match(visualFamily, /hlc-logo-menu-glimmer/);
  assert.match(visualFamily, /prefers-reduced-motion:reduce/);
  assert.match(visualFamily, /hlc-public-menu-trigger:focus-visible/);
});
