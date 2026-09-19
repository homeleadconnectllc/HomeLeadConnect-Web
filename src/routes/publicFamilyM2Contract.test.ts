import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pathway = readFileSync("src/pages/PathwayPage.tsx", "utf8");
const authority = readFileSync("src/styles/public-owner-visual-final-20260918.css", "utf8");
const pathwayAuthority = readFileSync("src/styles/public-pathway-owner-authority-20260918.css", "utf8");
const nav = readFileSync("src/components/PublicSiteNav.tsx", "utf8");

const routes = [
  ["residents", "#55e6b3", "/homeowners"],
  ["professionals", "#63d3ff", "/professionals"],
  ["partners", "#f2c45f", "/partners"],
  ["community", "#c98cff", "/community"],
] as const;

test("M2 public family keeps four explicit route identities", () => {
  for (const [tone, accent, route] of routes) {
    assert.ok(pathway.includes('data-pathway="' + tone + '"'), "Missing pathway identity " + tone);
    assert.ok(pathway.includes(route), "Missing canonical pathway route " + route);
    assert.ok(authority.includes('data-pathway="' + tone + '"'), "Missing visual tone " + tone);
    assert.ok(authority.includes("--page-accent:" + accent), "Missing page accent " + accent);
  }
});

test("M2 public family uses route-toned shared navigation", () => {
  assert.match(nav, /data-menu-tone={linkTone}/);
  assert.match(nav, /resident.*#62e6b3/);
  assert.match(nav, /professional.*#55c8ff/);
  assert.match(nav, /partner.*#ffc443/);
  assert.match(nav, /community.*#c38cff/);
  assert.match(nav, /minHeight: 52/);
});

test("M2 public family removes card treatment from pathway content", () => {
  assert.match(authority, /\.hlc-pathway-card[\s\S]*border-radius:0!important/);
  assert.match(authority, /\.hlc-pathway-card[\s\S]*box-shadow:none!important/);
  assert.match(authority, /\.hlc-pathway-card[\s\S]*background:transparent!important/);
});

test("M2 public family remains full-bleed and responsive", () => {
  assert.match(pathwayAuthority, /width:100%!important/);
  assert.match(pathwayAuthority, /max-width:none!important/);
  assert.match(pathwayAuthority, /@media\(max-width:680px\)/);
  assert.match(pathwayAuthority, /flex-direction:column!important/);
});

test("M2 public family preserves the four approved photographic authorities", () => {
  for (const asset of [
    "page-residents-request-help-20260916.webp",
    "page-professionals-provider-presence-20260916.webp",
    "page-partners-referral-relationships-20260916.webp",
    "page-community-connected-neighbors-20260916.webp",
  ]) assert.match(authority, new RegExp(asset));
});
