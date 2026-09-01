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
- Shared Member Profile + accepted Community relationship model: FOUNDATION in source control. The existing `public.profiles` identity is extended rather than replaced; `community_connections` is participant-scoped and mutation is RPC-only.
- Community Private Messenger: remains fail-closed. `community_can_message(peer_user_id)` requires an accepted relationship, but no claim of WIRED or runtime VERIFIED is made until the migration exists in an authorized runtime and positive/negative data evidence is captured.
- Production `main` and the production database remain untouched by this implementation branch.

Production main remains untouched.
