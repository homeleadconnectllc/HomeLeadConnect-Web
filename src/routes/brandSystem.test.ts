import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const brandLock = readFileSync("src/styles/hlc-brand-lock.css", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8");

test("HLC canonical brand lock stays global and precedes release guards", () => {
  assert.match(mainEntry, /global-visual-pizzazz\.css";\s*import "\.\/styles\/hlc-brand-lock\.css";\s*import "\.\/styles\/contrast-contract\.css";/);
  assert.match(brandLock, /--hlc-brand-navy: #0d1b3d/);
  assert.match(brandLock, /--hlc-brand-blue: #1e5bff/);
  assert.match(brandLock, /--hlc-brand-white: #ffffff/);
  assert.match(brandLock, /--hlc-brand-charcoal: #111827/);
  assert.match(brandLock, /font-family: "Poppins"/);
});

test("brand lock replaces green matching and success presentation with HLC blue-gray styling", () => {
  assert.match(brandLock, /\.hlc-match-availability\.is-available/);
  assert.match(brandLock, /\.hlc-match-swipe-stamp\.is-like/);
  assert.match(brandLock, /\.hlc-status-pill\[data-tone="success"\]/);
  assert.match(brandLock, /\.hlc-route-content section\[aria-labelledby="hlc-audio-device-title"\]::before/);
  assert.doesNotMatch(brandLock, /#34d399|#10b981|#059669|#047857|#0f766e|#15803d|#166534|#dcfce7|#ecfdf5/i);
});
