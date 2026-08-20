import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/CommunityHub.tsx", "utf8");
const styles = readFileSync("src/styles/community-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("Community uses a dedicated participation workspace instead of generic destination cards", () => {
  assert.match(page, /hlc-community-workspace/);
  assert.match(page, /COMMUNITY OPERATIONS/);
  assert.match(page, /hlc-community-console/);
  assert.match(page, /hlc-community-row/);
  assert.match(page, /hlc-community-context/);
  assert.doesNotMatch(page, /borderRadius: 18|boxShadow: "0 10px 26px|gridTemplateColumns: "repeat\(auto-fit/);
});

test("Community preserves discovery, participation, trust, moderation, store and service handoffs", () => {
  assert.match(page, /\/providers/);
  assert.match(page, /\/map/);
  assert.match(page, /\/matching/);
  assert.match(page, /\/network\/eligibility/);
  assert.match(page, /\/community\/discussions/);
  assert.match(page, /\/community\/groups/);
  assert.match(page, /\/community\/events/);
  assert.match(page, /\/community\/reviews/);
  assert.match(page, /\/community\/referrals/);
  assert.match(page, /\/community\/moderation/);
  assert.match(page, /CommunityStore/);
  assert.match(page, /Discovery is not dispatch/);
  assert.match(page, /\/request-service/);
  assert.match(page, /\/workflow/);
  assert.match(page, /DIAMOND · CX CONTEXT/);
});

test("Community specialization mounts before final authority and collapses safely on mobile", () => {
  const routeIndex = entry.indexOf("./community-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-community-console\{display:grid;grid-template-columns:/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-community-row\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-community-summary\{grid-template-columns:1fr/);
  assert.match(styles, /width:min\(100% - 24px,1440px\)/);
});
