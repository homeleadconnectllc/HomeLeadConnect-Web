import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const topBand = readFileSync(new URL("../styles/mobile-drawer-remove-top-band.css", import.meta.url), "utf8");
const styleEntry = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");

test("mobile drawer removes the legacy top band entirely", () => {
  assert.match(topBand, /padding-top:\s*8px\s*!important/);
  assert.match(topBand, /\.hlc-mobile-portal-scroll::before[\s\S]*content:\s*none\s*!important/);
  assert.match(topBand, /\.hlc-mobile-portal-scroll::after[\s\S]*display:\s*none\s*!important/);
  assert.match(topBand, /\.hlc-mobile-drawer-close\s*\{[^}]*position:\s*relative\s*!important/s);
  assert.match(topBand, /\.hlc-mobile-drawer-close\s*\{[^}]*inset:\s*auto\s*!important/s);
  assert.ok(styleEntry.lastIndexOf('import "./mobile-drawer-remove-top-band.css"') > styleEntry.lastIndexOf('import "./mobile-a-plus-drawer-top-flow-closure.css"'));
});
