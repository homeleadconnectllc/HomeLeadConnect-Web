import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../styles/public-premium.css", import.meta.url), "utf8");
const info = readFileSync(new URL("../pages/PublicInfo.tsx", import.meta.url), "utf8");

test("public app surfaces stay on the continuous dark HLC system", () => {
  assert.match(css, /linear-gradient\(180deg, #06101e, #081426 42%, #07111f 100%\)/);
  assert.doesNotMatch(css, /#f5f8fc/);
  assert.doesNotMatch(css, /background:\s*#fff/);
  assert.match(css, /\.hlc-public-grid[\s\S]*border:1px solid rgba\(199,210,227,.14\)/);
  assert.match(css, /\.hlc-public-card[\s\S]*background:rgba\(12,26,46,.66\)/);
});

test("public forms use restrained dark controls instead of floating white cards", () => {
  assert.match(css, /\.hlc-public-form[\s\S]*background:#0c1a2e/);
  assert.match(css, /\.hlc-public-form input,[\s\S]*background:#09182b/);
  assert.match(css, /border-radius:8px/);
});

test("public information routes remain connected to working product destinations", () => {
  for (const destination of ["/providers", "/map", "/matching", "/network/service-areas", "/community/discussions", "/community/reviews"]) {
    assert.ok(info.includes(destination), `Expected working destination ${destination}`);
  }
});

test("mobile public app layout is intentionally reorganized", () => {
  assert.match(css, /@media\(max-width:640px\)/);
  assert.match(css, /\.hlc-public-grid,[\s\S]*\.hlc-public-nav-cards \{ grid-template-columns:1fr; \}/);
  assert.match(css, /\.hlc-public-actions \{ display:grid; grid-template-columns:1fr; \}/);
});
