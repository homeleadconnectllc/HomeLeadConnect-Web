import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const styles = readFileSync(new URL("../styles/mobile-drawer-visual-viewport-root-fix.css", import.meta.url), "utf8");
const styleEntry = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");

test("mobile drawer portal is the only fixed viewport owner", () => {
  assert.match(styles, /html:has\(body > \.hlc-mobile-portal\),[\s\S]*position:\s*static\s*!important/);
  assert.match(styles, /body:has\(> \.hlc-mobile-portal\)[\s\S]*position:\s*static\s*!important/);
  assert.match(styles, /body > \.hlc-mobile-portal\s*\{[^}]*position:\s*fixed\s*!important/s);
  assert.match(styles, /body > \.hlc-mobile-portal\s*\{[^}]*inset:\s*0\s*!important/s);
});

test("mobile drawer scroll surface starts at portal origin with no top spacer", () => {
  assert.match(styles, /\.hlc-mobile-portal-scroll\s*\{[^}]*position:\s*absolute\s*!important/s);
  assert.match(styles, /\.hlc-mobile-portal-scroll\s*\{[^}]*inset:\s*0\s*!important/s);
  assert.match(styles, /\.hlc-mobile-portal-scroll\s*\{[^}]*padding-top:\s*0\s*!important/s);
  assert.match(styles, /\.hlc-mobile-portal-scroll\s*\{[^}]*transform:\s*none\s*!important/s);
});

test("visual viewport root fix is the last authenticated mobile authority", () => {
  const rootFix = styleEntry.lastIndexOf('import "./mobile-drawer-visual-viewport-root-fix.css"');
  const prior = styleEntry.lastIndexOf('import "./mobile-drawer-remove-top-band.css"');
  assert.ok(rootFix > prior);
});
