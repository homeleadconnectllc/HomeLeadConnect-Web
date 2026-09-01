import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/CommunityHub.tsx", "utf8");
const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const styles = readFileSync("src/styles/community-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const messages = readFileSync("src/pages/dashboard/CommunityMessages.tsx", "utf8");
const relationshipMigration = readFileSync("supabase/migrations/20260901131500_community_member_relationship_foundation.sql", "utf8");

test("Community uses a dedicated participation workspace instead of generic destination cards", () => {
  assert.match(page, /hlc-community-workspace/);
  assert.match(page, /COMMUNITY OPERATIONS/);
  assert.match(page, /hlc-community-console/);
  assert.match(page, /hlc-community-row/);
  assert.match(page, /hlc-community-context/);
  assert.doesNotMatch(page, /borderRadius: 18|boxShadow: "0 10px 26px|gridTemplateColumns: "repeat\(auto-fit/);
});

test("Community preserves premium discovery, participation, trust, moderation, and service boundaries", () => {
  assert.match(page, /\/community\/discover/);
  assert.match(page, /\/community\/swipe/);
  assert.match(page, /\/community\/messages/);
  assert.match(page, /\/community\/challenges/);
  assert.match(page, /\/community\/academy/);
  assert.match(page, /\/providers/);
  assert.match(page, /\/network\/map/);
  assert.match(page, /\/work\/matching/);
  assert.match(page, /\/community\/discussions/);
  assert.match(page, /\/community\/groups/);
  assert.match(page, /\/community\/events/);
  assert.match(page, /\/community\/reviews/);
  assert.match(page, /\/community\/referrals/);
  assert.match(page, /\/community\/moderation/);
  assert.match(page, /CommunityStore/);
  assert.match(page, /Discovery is not dispatch/);
  assert.match(page, /\/request-service/);
  assert.match(page, /\/work/);
  assert.match(page, /DIAMOND · CX CONTEXT/);
});

test("Community Premium canonical routes are declared while operational messages remain separate", () => {
  assert.match(router, /path="\/community\/discover"/);
  assert.match(router, /path="\/community\/swipe"/);
  assert.match(router, /path="\/community\/messages"/);
  assert.match(router, /path="\/community\/challenges"/);
  assert.match(router, /path="\/community\/academy"/);
  assert.match(router, /path="\/messages" element=\{<Messages\/>\}/);
  assert.match(router, /path="\/work\/matching" element=\{<EligibilityFit\/>\}/);
  assert.match(router, /path="\/matching" element=\{<CommunityMatchDeck\/>\}/);
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

test("Community is natively dark with restrained navigation and divider rows", () => {
  assert.match(styles, /--community-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-community-commandbar a:hover,[\s\S]*rgba\(47,128,255,\.1\)/);
  assert.match(styles, /\.hlc-community-row\{[^}]*background:transparent!important/);
  assert.match(styles, /\.hlc-community-context section\{[^}]*background:transparent!important/);
  assert.doesNotMatch(styles, /background:(?:#fff|#ffffff|#edf5ff|#eef6ff|#f8fbff)/i);
});

test("Community member identity extends the existing profile instead of creating a second identity table", () => {
  assert.match(relationshipMigration, /alter table public\.profiles/);
  assert.match(relationshipMigration, /community_discoverable/);
  assert.match(relationshipMigration, /community_headline/);
  assert.match(relationshipMigration, /community_bio/);
  assert.doesNotMatch(relationshipMigration, /create table if not exists public\.community_member_profiles/);
  assert.match(relationshipMigration, /community_discover_members\(\)/);
});

test("Community relationships are explicit, participant-scoped, and required before private messaging", () => {
  assert.match(relationshipMigration, /create table if not exists public\.community_connections/);
  assert.match(relationshipMigration, /status in \('pending', 'accepted', 'declined', 'blocked'\)/);
  assert.match(relationshipMigration, /requester_user_id = \(select auth\.uid\(\)\)/);
  assert.match(relationshipMigration, /addressee_user_id = \(select auth\.uid\(\)\)/);
  assert.match(relationshipMigration, /revoke insert, update, delete on public\.community_connections from authenticated/);
  assert.match(relationshipMigration, /community_request_connection\(peer_user_id uuid\)/);
  assert.match(relationshipMigration, /community_respond_connection\(connection_id uuid, accept_connection boolean\)/);
  assert.match(relationshipMigration, /community_can_message\(peer_user_id uuid\)/);
  assert.match(relationshipMigration, /where c\.status = 'accepted'/);
  assert.match(messages, /accepted Community relationships/);
  assert.match(messages, /Operational customer, lead, appointment, and job communication stays in core HLC Messages/);
});
