# HLC Route Migration Matrix

Status: LOCKED V1
Date: 2026-09-01

Principle: canonicalize internally without breaking bookmarked URLs externally.

## Route matrix

| Current | Final | Action | Access | Agent | Program |
|---|---|---|---|---|---|
| `/dashboard` | `/dashboard` | Reframe / keep URL | Core role-aware | Resident Diamond / Pro Dion / Manager Kendrell | S1 |
| `/start-here` | `/start-here` | Keep + Academy integration | Core | Diamond / Dion | E2 |
| `/activity` | `/activity` | Keep operational activity | Pro / Manager | Dion | S6 |
| — | `/work` | Add Work Home | Pro / Manager | Dion | S2 |
| `/leads` | `/leads` | Reframe | Core Work | Dion | S2 |
| `/leads/:leadId` | `/leads/:leadId` | Reframe | Core Work | Dion | S2 |
| `/matching` | `/community/swipe` compatibility path | Split / redirect later | Premium Community | Diamond / Dion | S4 / E1 |
| — | `/work/matching` | Add operational matching | Authorized Work | Dion | S2 |
| `/jobs` | `/jobs` | Reframe | Core Work | Dion | S2 |
| `/jobs/:jobId` | `/jobs/:jobId` | Reframe | Core Work | Dion | S2 |
| `/follow-ups` | `/follow-ups` | Reframe | Core Work | Dion | S2 |
| `/estimator` | `/estimator` | Keep + Work integration | Authorized Work | Dion | S2 |
| `/call-center` | `/call-center` | Reframe live operations | Core Work | Dion | S2 / E3 |
| `/calendar` | `/calendar` | Keep first-class | Core | Dion | S1-S2 |
| `/messages` | `/messages` | Keep operational only | Relationship scoped | Dion / Diamond | S4 |
| `/manual-communications` | `/manual-communications` | Keep admin/ops | Authorized | Dion | S4 |
| `/documents` | `/documents` | Keep | Permission scoped | Contextual | S5 |
| `/documents/scan` | `/documents/scan` | Keep OCR boundary | Permission scoped | Contextual | Later |
| `/network` | `/network` | Reframe Network Home | Core + premium depth | Dion / Diamond | S3 |
| `/map` | `/network/map` | Compatibility alias / redirect later | Role-aware | Dion / Diamond | S3 |
| `/network/map` | `/network/map` | Major enhancement | Role-aware | Dion / Diamond | S3 |
| `/profiles` | `/network` or profile discovery | Consolidate presentation | Core | Role-aware | S3 / E1 |
| `/providers` | `/network` | Preserve alias / redirect later | Core | Dion / Diamond | S3 |
| `/providers/:providerId` | shared `/profiles/:profileId` model | Preserve old URL | Role-aware | Contextual | S3 / E1 |
| `/network/service-areas` | same | Keep + visual editor | Pro / Manager | Dion | S3 |
| `/network/availability` | same | Keep | Pro / Manager | Dion | S3 |
| `/network/eligibility` | same | Keep; clarify operational purpose | Role-aware | Dion | S3 |
| `/network/saved` | same | Keep + deepen | Signed-in | Dion / Diamond | S3 |
| — | `/network/coverage` | Add | Pro / Manager | Dion / Kendrell | S3 / E5 |
| `/community-hub` | same | Reframe Community Home | Premium Community | Diamond | S4 / E1 |
| — | `/community/discover` | Add | Community | Diamond | S4 / E1 |
| — | `/community/swipe` | Add canonical Swipe Match | Premium / trial | Diamond / Dion | S4 / E1 |
| — | `/community/messages` | Add Private Messenger | Premium Community | Diamond | S4 / E1 |
| — | `/community/challenges` | Add | Community | Role-dependent | S4 / E2 |
| — | `/community/academy` | Add | Community | All three | E1 / E2 |
| `/community/events` | same | Keep + deepen | Community | Diamond | S4 / E1 |
| `/community/reviews` | same | Reframe provenance model | Community | Diamond | S4 / E1 |
| `/community/referrals` | same | Reframe actionable referrals | Community | Diamond | S4 / E1 |
| `/community/discussions` | same | Keep + visual feed integration | Community | Diamond | E1 |
| `/community/groups` | same | Keep | Community | Diamond | E1 |
| `/community/moderation` | same | Keep restricted | Moderators | Diamond / Kendrell | E1 |
| — | `/community/members/:profileId` | Add | Community | Role-based | E1 |
| — | `/academy` | Add Academy Home | Core + Premium | Role-based | E2 |
| — | `/academy/paths` | Add | Core + Premium | All three | E2 |
| — | `/academy/learn/:moduleId` | Add | Core + Premium | Track teacher | E2 |
| — | `/academy/practice/:moduleId` | Add | Core + Premium | Track teacher | E2 |
| — | `/academy/roleplay` | Add Roleplay Studio | Premium / trial | Dion | E3 |
| — | `/academy/simulations` | Add | Premium | All three | E2 / E5 |
| — | `/academy/certifications` | Add | Core + Premium | All three | E2 |
| — | `/academy/progress` | Add | Signed-in | Role-based | E2 |
| — | `/academy/challenges` | Add | Core + Premium | Role-based | E2 |
| — | `/academy/library` | Add canonical knowledge library | Role/access-aware | All three | E3 |
| `/help` | same | Keep, backed by library | Core | Contextual | E3 |
| `/tutorials` | same | Keep, backed by Academy/library | Core | Diamond / Dion | E2 / E3 |
| `/rules` | same | Keep policy view | Core | Kendrell | E3 |
| `/resources/forms` | same | Keep | Core | Dion | E4 |
| — | `/resources` | Add Resource Home | Public teaser + Core | Dion | E4 |
| — | `/resources/materials` | Add | Core | Dion | E4 |
| — | `/resources/suppliers` | Add | Core + Premium depth | Dion | E4 |
| — | `/resources/suppliers/map` | Add | Core + Premium depth | Dion | E4 |
| — | `/resources/projects/:jobId/materials` | Add | Authorized job participants | Dion | E4 |
| — | `/resources/saved` | Add My Resource Shelf | Signed-in | Dion / Diamond | E4 |
| — | `/resources/equipment` | Add | Core | Dion | E4 |
| — | `/resources/guides` | Add | Public/Core | Dion / Diamond | E4 |
| `/analytics` | same | Reframe question-driven | Pro / Manager | Dion / Kendrell | S6 |
| — | `/analytics/forecasting` | Add | Advanced | Dion / Kendrell | E5 |
| — | `/analytics/sandbox` | Add simulation-only | Advanced | Dion / Kendrell | E5 |
| `/profile` | same | Keep self profile | Core | Role-based | S3 / E1 |
| — | `/profiles/:profileId` | Add shared member profile | Visibility controlled | Role-based | E1 |
| `/notifications` | same | Reframe attention center | Core | Contextual | S4 / E2 |
| `/settings` | same | Keep | Core | Contextual | S1 / E6 |
| `/settings/billing` | same | Keep Stripe-authoritative | Authorized | Contextual | E6 |
| `/team` | same | Keep | Pro / Manager | Kendrell / Dion | S6 |
| `/hq` | same | Keep Kendrell workspace | Authorized | Kendrell | Keep |
| `/operations` | same | Keep Dion workspace | Authorized | Dion | Keep |
| `/customer-experience` | same | Keep Diamond workspace | Authorized | Diamond | Keep |

## Mobile destinations
- Home -> `/dashboard`
- Work -> `/work`
- Network -> `/network`
- Community -> `/community-hub`
- More -> grouped secondary capabilities

## Compatibility rules
- `/map` remains functional while `/network/map` is canonicalized.
- `/matching` is not redirected until both `/work/matching` and `/community/swipe` are safely separated.
- `/providers` and `/profiles` remain compatible while Network/profile discovery is consolidated.
- `/providers/:providerId` remains resolvable after shared member profile presentation is introduced.

## Trial behavior
Do not add duplicate `/trial/*` pages. Entitlement changes capabilities at the real route while preserving saved matches, Academy progress, achievements, history, and profile identity.
