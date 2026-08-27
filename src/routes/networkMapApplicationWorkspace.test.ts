import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/ProviderMap.tsx", "utf8");
const directory = readFileSync("src/pages/dashboard/NetworkDirectory.tsx", "utf8");
const styles = readFileSync("src/styles/network-map-application-workspace.css", "utf8");
const sprint3Styles = readFileSync("src/styles/mobile-a-plus-sprint-3-network.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");

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

test("Mobile A+ Sprint 3 makes Network search-first with one-hand List and Map access", () => {
  assert.match(directory, /hlc-s3-network-search/);
  assert.match(directory, /hlc-s3-network-view-toggle/);
  assert.match(directory, /to="\/providers"/);
  assert.match(directory, /to="\/map"/);
  assert.match(sprint3Styles, /\.hlc-s3-network-view-toggle\{position:fixed/);
  assert.match(sprint3Styles, /bottom:calc\(76px \+ env\(safe-area-inset-bottom,0px\)\)/);
  assert.match(sprint3Styles, /\.hlc-network-map-workspace \.hlc-network-route-rail\{position:fixed/);
});

test("Mobile A+ Sprint 3 moves advanced discovery filters into a compact full-screen sheet", () => {
  assert.match(directory, /hlc-s3-network-filters-desktop/);
  assert.match(directory, /hlc-s3-network-filter-sheet/);
  assert.match(directory, /Filter providers/);
  assert.match(sprint3Styles, /\.hlc-s3-network-filters-desktop\{display:none!important\}/);
  assert.match(sprint3Styles, /\.hlc-s3-network-filter-sheet\[open\] \.hlc-s3-network-filter-sheet-panel\{position:fixed;inset:0/);
  assert.match(sprint3Styles, /min-height:48px!important/);
});

test("Mobile A+ Sprint 3 keeps provider rows essential-first with visible fallback actions", () => {
  assert.match(directory, /hlc-s3-provider-row/);
  assert.match(directory, /hlc-s3-provider-secondary-desktop/);
  assert.match(directory, /hlc-s3-provider-more/);
  assert.match(directory, /View profile/);
  assert.match(directory, /Unsave/);
  assert.match(directory, /Call/);
  assert.match(directory, /Email/);
  assert.match(directory, /Work &amp; offers/);
  assert.match(sprint3Styles, /\.hlc-s3-provider-secondary-desktop\{display:none!important\}/);
  assert.match(sprint3Styles, /\.hlc-s3-provider-more\{display:block/);
});

test("Mobile A+ Sprint 3 authority mounts after the Sprint 2 closure without lowering earlier contracts", () => {
  const sprint2Index = authenticatedStyles.indexOf("./mobile-a-plus-sprint-2-visual-closure.css");
  const sprint3Index = authenticatedStyles.indexOf("./mobile-a-plus-sprint-3-network.css");
  assert.ok(sprint2Index >= 0);
  assert.ok(sprint3Index > sprint2Index);
  assert.match(sprint3Styles, /@media \(max-width:720px\)/);
  assert.match(sprint3Styles, /padding-bottom:calc\(118px \+ env\(safe-area-inset-bottom,0px\)\)/);
  assert.match(sprint3Styles, /:focus-visible/);
});
