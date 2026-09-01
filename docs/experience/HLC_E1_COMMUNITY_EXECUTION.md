# HLC E1 — Community Premium Execution

Source of truth: Master Delivery Board #239 and locked experience contracts.

Scope:
- Reframe `/community-hub` as premium Community front door.
- Add `/community/discover`.
- Advance `/community/swipe` from alias toward role-aware discovery.
- Add `/community/messages` as a social/private messaging layer separate from operational `/messages`.
- Add `/community/challenges` and `/community/academy` foundations.
- Preserve existing discussions, reviews, referrals, events, groups, and moderation routes.
- Preserve `/matching` compatibility until migration is complete.
- Never turn discovery into operational assignment.
- Never expose private messaging without an explicit relationship/permission model.

## Current evidence boundary

- Route/application foundation: VERIFIED at exact head `2b4789d469fb505f9938bc96fcaa79f762ec0ac1` with Launch Candidate #1957, Rendered Quality Gate #1340, and Blind Visual Certification #471.
- Shared Member Profile + accepted Community relationship model: runtime-proven in the isolated `hlc-reconciliation-test` Supabase project. The existing `public.profiles` identity is extended rather than replaced; `community_connections` is participant-scoped and mutation is RPC-only. Transactional synthetic proof covered pending, accepted, declined, blocked, unrelated, and cross-workspace accepted cases; all proof data was rolled back.
- Community Private Messenger: WIRED in the isolated E1 branch and isolated reconciliation runtime. `community_private_messages` is participant-readable only while `community_can_message(peer_user_id)` remains true; send/list RPCs require an accepted relationship. Runtime transaction proof demonstrated accepted cross-workspace send/read, body trimming, unrelated-send rejection, block revocation, and blocked-history denial. Proof data was rolled back and zero synthetic messages remained.
- Community RPC privilege hardening: isolated-runtime ACL proof confirms `anon_execute=false` and `authenticated_execute=true` for discovery, relationship, permission, list, send, and block RPCs. The explicit hardening migration remains staged and unpromoted in source control.
- Community Discover now uses the shared Community member profile RPC rather than reusing contractor discovery as a surrogate identity surface.
- Operational `/messages` remains separate from `/community/messages`; operational `/work/matching` remains separate from `/community/swipe`.
- Production `main`, production URLs, and the production database remain untouched by this implementation branch.

## Remaining E1 verification gate

The current WIRED exact head must pass the repository Launch Candidate, Rendered Quality Gate, and Blind Visual Certification before this newly wired messenger scope can advance to VERIFIED. No production promotion is implied by CI success.
