import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");
const mounted = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles/signed-in-professional-system.css", import.meta.url), "utf8");
const shell = readFileSync(new URL("../styles/mobile-a-plus-sprint-2-shell-closure.css", import.meta.url), "utf8");

test("signed-in professional presentation remains mounted without retired certification paint", () => {
  assert.match(mounted, /import "\.\/signed-in-professional-system\.css";/);
  assert.ok(
    mounted.indexOf("signed-in-professional-system.css") > mounted.indexOf("dashboard-context-hero.css"),
    "signed-in professional presentation must be the final AuthenticatedStyles visual import",
  );
  for (const retired of [
    "mobile-all-screens-certification.css",
    "mobile-professional-certification.css",
    "global-readability-certification.css",
    "design-system-foundation.css",
    "ux-ia-village-authority.css",
    "launch-contrast-readability.css",
  ]) {
    const pattern = new RegExp(retired.replaceAll(".", "\\."));
    assert.doesNotMatch(entry, pattern);
    assert.doesNotMatch(mounted, pattern);
  }
});

test("authenticated presentation owns one coherent charcoal and HLC-blue visual system", () => {
  assert.match(css, /--hlc-app-bg:#0b1119/);
  assert.match(css, /--hlc-app-blue:#2f80ff/);
  assert.match(css, /\.hlc-signed-in-shell > \.hlc-navbar/);
  assert.match(css, /\.hlc-desktop-sidebar-toggle/);
  assert.match(css, /\.hlc-mobile-tabbar/);
  assert.match(css, /\.hlc-home-greeting-v3/);
  assert.match(css, /\.hlc-home-primary-grid/);
  assert.doesNotMatch(css, /Dashboard \+ Analytics source-of-truth|legacy light-card contract/);
});

test("authenticated links and controls do not fall back to raw browser presentation", () => {
  assert.match(css, /\.hlc-signed-in-shell \.hlc-route-content a\{/);
  assert.match(css, /text-decoration:none/);
  assert.match(css, /\.hlc-signed-in-shell button\{/);
  assert.match(css, /\.hlc-signed-in-shell :is\(input,select,textarea\)\{/);
});

test("desktop navigation keeps readable active state and accessible collapse control", () => {
  assert.match(css, /a\[aria-current="page"\]/);
  assert.match(css, /box-shadow:inset 3px 0 var\(--hlc-app-blue\)/);
  assert.match(css, /\.hlc-sidebar-toggle-label/);
  assert.match(css, /clip:rect\(0 0 0 0\)/);
});

test("mobile navigation presentation sits on top of a bounded structural tabbar", () => {
  assert.match(shell, /display:grid!important/);
  assert.match(shell, /grid-template-columns:repeat\(auto-fit,minmax\(0,1fr\)\)!important/);
  assert.match(shell, /height:var\(--hlc-mobile-nav-box\)!important/);
  assert.match(css, /\.hlc-mobile-tabbar > :is\(a,button\) svg/);
  assert.match(css, /width:21px/);
  assert.match(css, /stroke-width:1\.8/);
});

test("current Dashboard presentation targets the live hlc-home markup", () => {
  for (const selector of [
    ".hlc-home-workspace",
    ".hlc-home-topbar-v2",
    ".hlc-home-metric-strip",
    ".hlc-home-focus-panel",
    ".hlc-home-schedule-panel",
    ".hlc-home-quick-row-v2",
    ".hlc-home-ai-rail",
  ]) assert.ok(css.includes(selector), selector);
});
