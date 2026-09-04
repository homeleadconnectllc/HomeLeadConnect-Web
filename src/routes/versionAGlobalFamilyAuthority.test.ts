import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync(new URL("../styles/version-a-global-family-authority-20260904.css", import.meta.url), "utf8");
const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");

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

test("authenticated Version A closes legacy white islands across shared product families", () => {
  assert.match(css, /Physical iPhone closure/);
  assert.match(css, /\.hlc-global-search/);
  assert.match(css, /\.hlc-community-guidelines/);
  assert.match(css, /\.hlc-support-panel/);
  assert.match(css, /\.hlc-schedule-panel/);
  assert.match(css, /\.hlc-app-directory-panel/);
  assert.match(css, /\.hlc-profile-card/);
  assert.match(css, /\.hlc-documents-panel/);
  assert.match(css, /\.hlc-forms-panel/);
  assert.match(css, /\.hlc-provider-map-panel/);
  assert.match(css, /background-color: white/);
  assert.match(css, /background: rgb\(255, 255, 255\)/);
  assert.match(css, /background: #fff/);
});

test("approved Version A family authority is authenticated-only and stays immediately beneath protected Messages authority", () => {
  const authority = 'import "./version-a-global-family-authority-20260904.css";';
  const messages = 'import "./messages-lane-2-mobile-authority.css";';
  const lines = authenticatedStyles.trim().split("\n");
  assert.equal(lines.at(-6), authority);
  assert.equal(lines.at(-5), messages);
});
