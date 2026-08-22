import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/ProviderMap.tsx", "utf8");
const styles = readFileSync("src/styles/network-map-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("Network Map uses a dedicated intelligence workspace instead of generic card grids", () => {
  assert.match(page, /hlc-network-map-workspace/);
  assert.match(page, /NETWORK INTELLIGENCE/);
  assert.match(page, /hlc-network-map-console/);
  assert.match(page, /hlc-network-provider-row/);
  assert.match(page, /hlc-network-map-inspector/);
  assert.doesNotMatch(page, /hlc-card|metric-card|grid-card/);
});

test("Network Map preserves provider data, confidence boundaries, management mutation and deep links", () => {
  assert.match(page, /listContractors\(\{\}\)/);
  assert.match(page, /setProviderMapCoordinates/);
  assert.match(page, /coordinate_accuracy === "verified"/);
  assert.match(page, /coordinate_accuracy === "approximate"/);
  assert.match(page, /does not invent distance, ETA, routing, dispatch, or live location/);
  assert.match(page, /to=\{`\/providers\/\$\{selected\.id\}`\}/);
  assert.match(page, /openstreetmap\.org/);
  assert.match(page, /role === "owner" \|\| role === "manager"/);
});

test("Network Map specialization mounts before final authority and collapses safely on mobile", () => {
  const routeIndex = entry.indexOf("./network-map-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-network-map-console\{display:grid;grid-template-columns:/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-network-map-console\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-network-provider-row\{grid-template-columns:1fr/);
});

test("Network Map is natively dark without white provider rows or a light map canvas", () => {
  assert.match(styles, /--network-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-network-map-canvas\{[^}]*linear-gradient\(180deg,#0b1c31,#081426\)/);
  assert.match(styles, /\.hlc-network-provider-row\{[^}]*background:transparent/);
  assert.match(styles, /\.hlc-network-provider-row\.is-selected\{[^}]*rgba\(47,128,255,\.12\)/);
  assert.doesNotMatch(styles, /background:(?:#fff|#ffffff|#f8fafc|#f8fbff|#eef6ff)/i);
});
