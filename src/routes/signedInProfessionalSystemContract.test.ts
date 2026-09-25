import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entry = readFileSync(
  new URL("../styles/authenticated-entry.ts", import.meta.url),
  "utf8",
);
const mounted = readFileSync(
  new URL("../styles/AuthenticatedStyles.tsx", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../styles/hcx-locked-visual-authority-20260924.css", import.meta.url),
  "utf8",
);
const shell = readFileSync(
  new URL("../styles/mobile-a-plus-sprint-2-shell-closure.css", import.meta.url),
  "utf8",
);

test("canonical HCX authenticated presentation is mounted without retired certification paint", () => {
  assert.doesNotMatch(
    mounted,
    /import "\.\/signed-in-professional-system\.css";/,
  );

  assert.match(
    mounted,
    /import "\.\/hcx-locked-visual-authority-20260924\.css";/,
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

test("authenticated presentation owns the pathway-aware HCX visual system", () => {
  assert.match(css, /--hcx-ink:\s*#13243a/);

  // Resident
  assert.match(css, /--hlc-portal-accent:\s*#16866a/);

  // Professional
  assert.match(css, /--hlc-portal-accent:\s*#1479b8/);

  // Partner
  assert.match(css, /--hlc-portal-accent:\s*#9a6a0a/);

  assert.match(css, /\.hlc-signed-in-shell/);

  // The superseded universal charcoal application background
  // must not become the current authority again.
  assert.doesNotMatch(css, /--hlc-app-bg:#0b1119/);
});

test("authenticated links and controls retain explicit presentation contracts", () => {
  assert.match(css, /\.hlc-signed-in-shell \.hlc-route-content a\{/);
  assert.match(css, /text-decoration:/);
});

test("desktop navigation retains a readable active state", () => {
  assert.match(css, /a\[aria-current="page"\]/);
});

test("mobile navigation sits on top of a bounded structural tabbar", () => {
  assert.match(shell, /display:grid!important/);
  assert.match(
    shell,
    /grid-template-columns:repeat\(auto-fit,minmax\(0,1fr\)\)!important/,
  );
  assert.match(shell, /height:var\(--hlc-mobile-nav-box\)!important/);

  assert.match(css, /\.hlc-mobile-tabbar/);
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
  ]) {
    assert.ok(css.includes(selector), selector);
  }
});
