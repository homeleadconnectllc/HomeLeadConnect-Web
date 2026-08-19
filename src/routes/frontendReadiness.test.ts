import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readiness = readFileSync("src/styles/frontend-readiness-contract.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");
const authenticatedStyles = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const mobileControls = readFileSync("src/components/MobileViewControls.tsx", "utf8");
const mobileShell = readFileSync("src/styles/mobile-message-shell-controls.css", "utf8");

test("final frontend readiness guard is mounted in the authenticated style bundle", () => {
  assert.match(authenticatedStyles, /frontend-readiness-contract\.css/);
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

test("real-device iPhone leads remain readable and proactive briefing does not cover core work", () => {
  assert.match(readiness, /\.hlc-lead-card-copy/);
  assert.match(readiness, /grid-template-columns: 48px minmax\(0, 1fr\)/);
  assert.match(readiness, /\.hlc-lead-context/);
  assert.match(readiness, /flex-wrap: wrap !important/);
  assert.match(readiness, /\.hlc-lead-card-actions/);
  assert.match(readiness, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(readiness, /\.hlc-agent-dock\.has-briefing \.hlc-agent-proactive-briefing/);
  assert.match(readiness, /display: none !important/);
});

test("More owns display controls and sign out without a fixed side overlay", () => {
  assert.match(mobileControls, /hlc-mobile-portal-scroll/);
  assert.match(mobileControls, />\s*Mobile\s*</);
  assert.match(mobileControls, />\s*Desktop\s*</);
  assert.match(navbar, /className="hlc-nav-logout"/);
  assert.match(navbar, />Sign out<\/button>/);
  assert.doesNotMatch(mobileShell, /hlc-mobile-side-controls/);
});

test("authenticated shell cannot mount a second permanent mobile work dock", () => {
  assert.doesNotMatch(appLayout, /MobileWorkDock/);
  assert.doesNotMatch(main, /mobile-work-dock\.css/);
  assert.doesNotMatch(authenticatedStyles, /mobile-work-dock\.css/);
  assert.match(navbar, /className="hlc-mobile-tabbar"/);
  assert.match(navbar, /aria-label="Mobile primary navigation"/);
});

test("public shell legal links and brand accessible name remain Lighthouse-safe", () => {
  assert.match(footer, /color: "#bfdbfe"/);
  assert.match(footer, /fontWeight: 600/);
  assert.match(navbar, /className="hlc-navbar-brand"/);
  assert.doesNotMatch(navbar, /className="hlc-navbar-brand"[^>]*aria-label=/);
});
