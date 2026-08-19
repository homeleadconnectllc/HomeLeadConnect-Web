import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readiness = readFileSync("src/styles/frontend-readiness-contract.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const mobileControls = readFileSync("src/components/MobileViewControls.tsx", "utf8");
const mobileShell = readFileSync("src/styles/mobile-message-shell-controls.css", "utf8");
const workDock = readFileSync("src/styles/mobile-work-dock.css", "utf8");

test("final frontend readiness guard is mounted after the other release styles", () => {
  assert.match(main, /frontend-readiness-contract\.css/);
});

test("mobile shell prevents horizontal clipping and reserves safe navigation clearance", () => {
  assert.match(readiness, /overflow-x: clip/);
  assert.match(readiness, /scroll-padding-bottom: var\(--hlc-mobile-nav-clearance\)/);
  assert.match(readiness, /calc\(96px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(readiness, /max-width: 100vw/);
  assert.match(readiness, /max-height: 100dvh/);
});

test("mobile controls retain accessible touch targets and iPhone-safe form sizing", () => {
  assert.match(readiness, /font-size: 16px !important/);
  assert.match(readiness, /min-height: 44px/);
  assert.match(readiness, /:focus-visible/);
  assert.match(readiness, /outline: 3px solid #67e8f9/);
});

test("More owns display controls and sign out without a fixed side overlay", () => {
  assert.match(mobileControls, /hlc-mobile-portal-scroll/);
  assert.match(mobileControls, />\s*Mobile\s*</);
  assert.match(mobileControls, />\s*Desktop\s*</);
  assert.match(navbar, /className="hlc-nav-logout"/);
  assert.match(navbar, />Sign out<\/button>/);
  assert.doesNotMatch(mobileShell, /hlc-mobile-side-controls/);
});

test("duplicate mobile work dock remains non-rendering on compact screens", () => {
  assert.match(workDock, /\.hlc-mobile-work-dock \{[\s\S]*display: none !important;/);
  assert.doesNotMatch(workDock, /position:\s*fixed/);
});
