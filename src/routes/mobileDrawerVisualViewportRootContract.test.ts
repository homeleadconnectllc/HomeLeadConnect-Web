import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const styles = readFileSync(new URL("../styles/mobile-drawer-visual-viewport-root-fix.css", import.meta.url), "utf8");
const navbar = readFileSync(new URL("../components/Navbar.tsx", import.meta.url), "utf8");
const styleEntry = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");

test("mobile drawer portal is the only fixed viewport owner", () => {
  assert.match(styles, /html:has\(body > \.hlc-mobile-portal\),[\s\S]*position:\s*static\s*!important/);
  assert.match(styles, /body:has\(> \.hlc-mobile-portal\)[\s\S]*position:\s*static\s*!important/);
  assert.match(styles, /body > \.hlc-mobile-portal\s*\{[^}]*position:\s*fixed\s*!important/s);
  assert.match(styles, /body > \.hlc-mobile-portal\s*\{[^}]*inset:\s*0\s*!important/s);
});

test("mobile drawer scroll surface is anchored to portal origin with no visual viewport translation", () => {
  assert.match(styles, /\.hlc-mobile-portal-scroll\s*\{[^}]*position:\s*absolute\s*!important/s);
  assert.match(styles, /\.hlc-mobile-portal-scroll\s*\{[^}]*inset:\s*0\s*!important/s);
  assert.match(styles, /\.hlc-mobile-portal-scroll\s*\{[^}]*height:\s*100%\s*!important/s);
  assert.match(styles, /\.hlc-mobile-portal-scroll\s*\{[^}]*padding-top:\s*0\s*!important/s);
  assert.doesNotMatch(styles, /--hlc-visual-viewport-top/);
  assert.doesNotMatch(styles, /calc\(-1\s*\*/);
});

test("mobile drawer resets its own scroll surface to top whenever it opens", () => {
  assert.match(navbar, /if \(!mobileOpen\) return;[\s\S]*requestAnimationFrame\(\(\) => \{[\s\S]*\.hlc-mobile-portal-scroll[\s\S]*scrollTo\(\{ top: 0, left: 0, behavior: "auto" \}\)/);
});

test("visual viewport root fix is the last authenticated mobile authority", () => {
  const rootFix = styleEntry.lastIndexOf('import "./mobile-drawer-visual-viewport-root-fix.css"');
  const prior = styleEntry.lastIndexOf('import "./mobile-drawer-remove-top-band.css"');
  assert.ok(rootFix > prior);
});
