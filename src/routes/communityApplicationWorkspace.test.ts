import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/CommunityHub.tsx", "utf8");
const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const styles = readFileSync("src/styles/community-application-workspace.css", "utf8");
const sourceAuthority = readFileSync("src/styles/community-hub-source-authority.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const messages = readFileSync("src/pages/dashboard/CommunityMessages.tsx", "utf8");
const discover = readFileSync("src/pages/dashboard/CommunityDiscover.tsx", "utf8");
const relationshipApi = readFileSync("src/api/communityRelationships.ts", "utf8");
const relationshipMigration = readFileSync("supabase/migrations/20260901131500_community_member_relationship_foundation.sql", "utf8");
const messengerMigration = readFileSync("supabase/migrations/20260901142500_community_private_messenger.sql", "utf8");

test("Community uses a dedicated participation workspace instead of generic destination cards", () => {
  assert.match(page, /hlc-community-v2/);
  assert.match(page, /COMMUNITY OPERATIONS/);
  assert.match(page, /hlc-community-v2-grid/);
  assert.match(page, /hlc-community-v2-row/);
  assert.match(page, /hlc-community-v2-context/);
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

test("Community specialization mounts before final authority and v2 collapses safely on mobile", () => {
  const routeIndex = entry.indexOf("./community-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(sourceAuthority, /\.hlc-community-v2-grid\{display:grid!important;grid-template-columns:/);
  assert.match(sourceAuthority, /@media\(max-width:760px\)/);
  assert.match(sourceAuthority, /\.hlc-community-v2-row\{grid-template-columns:1fr!important/);
  assert.match(sourceAuthority, /\.hlc-community-v2-more-links\{grid-template-columns:1fr!important/);
  assert.match(sourceAuthority, /width:min\(100%,1180px\)!important/);
});

test("Community v2 is natively dark with restrained navigation and owned rows", () => {
  assert.match(sourceAuthority, /\.hlc-community-v2\{[^}]*color:#f8fafc!important/);
  assert.match(sourceAuthority, /\.hlc-community-v2-commandbar>a\{[^}]*background:linear-gradient/);
  assert.match(sourceAuthority, /\.hlc-community-v2-row\{[^}]*background:linear-gradient/);
  assert.match(sourceAuthority, /\.hlc-community-v2-context-card\{[^}]*background:linear-gradient/);
  assert.doesNotMatch(sourceAuthority, /background:(?:#fff|#ffffff|#edf5ff|#eef6ff|#f8fbff)/i);
  assert.match(styles, /--community-surface:#0d1b2f/);
});

test("Community member identity extends the existing profile instead of creating a second identity table", () => {
  assert.match(relationshipMigration, /alter table public\.profiles/);
  assert.match(relationshipMigration, /community_discoverable/);
  assert.match(relationshipMigration, /community_headline/);
  assert.match(relationshipMigration, /community_bio/);
  assert.doesNotMatch(relationshipMigration, /create table if not exists public\.community_member_profiles/);
  assert.match(relationshipMigration, /community_discover_members\(\)/);
  assert.match(discover, /listCommunityMembers/);
  assert.match(discover, /requestCommunityConnection/);
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
  assert.match(messengerMigration, /create table if not exists public\.community_private_messages/);
  assert.match(messengerMigration, /accepted community relationship required/);
  assert.match(messengerMigration, /community_send_message\(peer_user_id uuid, message_body text\)/);
  assert.match(messengerMigration, /community_list_messages\(peer_user_id uuid\)/);
  assert.match(messengerMigration, /community_block_connection\(peer_user_id uuid\)/);
  assert.match(relationshipApi, /community_list_relationships/);
  assert.match(relationshipApi, /community_send_message/);
  assert.match(messages, /listCommunityRelationships/);
  assert.match(messages, /sendCommunityMessage/);
  assert.match(messages, /operational HLC Messages/);
});
