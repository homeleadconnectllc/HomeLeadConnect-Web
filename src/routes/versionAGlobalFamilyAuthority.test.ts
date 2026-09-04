import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../styles/version-a-global-family-authority-20260904.css", import.meta.url), "utf8");
const shellEntry = readFileSync(new URL("../styles/app-shell-entry.ts", import.meta.url), "utf8");

test("approved Version A family authority owns the authenticated foundation and role accents", () => {
  assert.match(css, /\.hlc-signed-in-shell/);
  assert.match(css, /data-portal="resident"/);
  assert.match(css, /data-portal="professional"/);
  assert.match(css, /data-portal="partner"/);
  assert.match(css, /data-portal="internal"/);
  assert.match(css, /--hlc-blue/);
  assert.match(css, /--hlc-green/);
  assert.match(css, /--hlc-gold/);
  assert.match(css, /--hlc-purple/);
});

test("approved Version A family authority owns identity, imagery, AI, and dark loading presentation", () => {
  assert.match(css, /\.hlc-profile-avatar/);
  assert.match(css, /\.hlc-header-avatar/);
  assert.match(css, /\.hlc-greeting/);
  assert.match(css, /\.hlc-context-image/);
  assert.match(css, /\.hlc-provider-image/);
  assert.match(css, /\.hlc-community-image/);
  assert.match(css, /\.hlc-ai-launcher/);
  assert.match(css, /\.hlc-route-loading-state/);
});

test("approved Version A family authority remains final in the authenticated cascade", () => {
  const authority = 'import "./version-a-global-family-authority-20260904.css";';
  assert.equal(shellEntry.trim().split("\n").at(-1), authority);
});
