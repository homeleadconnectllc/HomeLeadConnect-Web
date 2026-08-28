import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const styles = readFileSync(new URL("../styles/mobile-drawer-v2-authority.css", import.meta.url), "utf8");
const navbar = readFileSync(new URL("../components/Navbar.tsx", import.meta.url), "utf8");
const viewControls = readFileSync(new URL("../components/MobileViewControls.tsx", import.meta.url), "utf8");
const styleEntry = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");

test("active mobile drawer uses an isolated namespace", () => {
  assert.match(navbar, /className="hlc-drawer-v2"/);
  assert.match(navbar, /className="hlc-drawer-v2-scroll"/);
  assert.match(navbar, /className="hlc-drawer-v2-close"/);
  assert.doesNotMatch(navbar, /className="hlc-mobile-portal"/);
  assert.doesNotMatch(navbar, /className="hlc-mobile-portal-scroll"/);
  assert.doesNotMatch(navbar, /className="hlc-mobile-drawer-close"/);
});

test("drawer v2 has one fixed viewport owner and one scroll owner", () => {
  assert.match(styles, /body > \.hlc-drawer-v2\s*\{[^}]*position:\s*fixed\s*!important/s);
  assert.match(styles, /body > \.hlc-drawer-v2\s*\{[^}]*inset:\s*0\s*!important/s);
  assert.match(styles, /\.hlc-drawer-v2-scroll\s*\{[^}]*position:\s*absolute\s*!important/s);
  assert.match(styles, /\.hlc-drawer-v2-scroll\s*\{[^}]*inset:\s*0\s*!important/s);
  assert.match(styles, /\.hlc-drawer-v2-scroll\s*\{[^}]*overflow-y:\s*auto\s*!important/s);
});

test("drawer v2 contains no legacy top band", () => {
  assert.match(styles, /\.hlc-drawer-v2-scroll\s*\{[^}]*padding:\s*8px 14px max\(96px,[^}]*!important/s);
  assert.match(styles, /\.hlc-drawer-v2-close\s*\{[^}]*position:\s*relative\s*!important/s);
  assert.match(styles, /\.hlc-drawer-v2-close\s*\{[^}]*margin:\s*0\s*!important/s);
  assert.match(styles, /\.hlc-mobile-menu-heading[^}]*display:\s*none\s*!important/s);
  assert.doesNotMatch(styles, /58px/);
  assert.doesNotMatch(styles, /safe-area-inset-top/);
  assert.doesNotMatch(styles, /--hlc-visual-viewport-top/);
});

test("drawer utilities and scroll reset target the isolated namespace", () => {
  assert.match(viewControls, /querySelector<HTMLElement>\("\.hlc-drawer-v2-scroll"\)/);
  assert.match(navbar, /querySelector<HTMLElement>\("body > \.hlc-drawer-v2 > \.hlc-drawer-v2-scroll"\)/);
  assert.match(navbar, /scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
});

test("drawer v2 authority is loaded last", () => {
  const v2 = styleEntry.lastIndexOf('import "./mobile-drawer-v2-authority.css"');
  const legacy = styleEntry.lastIndexOf('import "./mobile-drawer-visual-viewport-root-fix.css"');
  assert.ok(v2 > legacy);
});
