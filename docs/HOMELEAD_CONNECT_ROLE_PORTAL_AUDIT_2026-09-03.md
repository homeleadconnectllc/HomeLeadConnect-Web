# HomeLead Connect Role & Portal Audit — 2026-09-03

Base production SHA: `541871c2a44e6c8f48cf67bd93634614956e8b43`

## Governing rule

Role → real-world job → highest-frequency tasks → immediate dashboard actions → secondary tools → deeper detail screens.

Route existence does not imply navigation visibility or authorization. Shared capabilities may reuse infrastructure while presenting role-appropriate entry points and actions.

## Current route boundaries

### Resident
Parent: `/homeowner-portal`

Direct portal children under authenticated `ProtectedLayout`:
- `/homeowner-portal/resources`
- `/homeowner-portal/requests`
- `/homeowner-portal/appointments`
- `/homeowner-portal/jobs`
- `/homeowner-portal/documents`
- `/homeowner-portal/profile`
- `/homeowner-portal/settings`

Shared authenticated capabilities currently reachable outside `WorkspaceLayout`:
- `/messages`
- `/notifications`
- `/academy*`

### Professional
Parent: `/contractor-portal`

Direct portal children under authenticated `ProtectedLayout`:
- `/contractor-portal/resources`
- `/contractor-portal/profile`
- `/contractor-portal/services`
- `/contractor-portal/documents`

Shared authenticated capabilities currently reachable outside `WorkspaceLayout`:
- `/messages`
- `/notifications`
- `/academy*`

### Partner
Parent: `/partner-portal`

Direct portal child under authenticated `ProtectedLayout`:
- `/partner-portal/resources`

The partner portal itself correctly focuses on referrals, referral status, resources, and HomeLead Connect contact rather than exposing internal CRM operations.

### Internal CRM / SaaS
All operational workspace routes sit beneath `WorkspaceLayout`, which resolves the signed-in destination, requires a recognized internal role, applies route-level internal-role policy, and then evaluates workspace billing entitlement.

## Confirmed architecture defects

### 1. Partner access was missing from the shared account-access context

`accessDestination.ts` already recognizes partner access and can route a partner to `/partner-portal`, while the shared account-access context originally resolved only business, homeowner, contractor, and internal role signals.

Impact:
- brand/home destination could fall back to `/portal/accept` for a valid partner account;
- mobile navigation could not compose a partner experience;
- shared navigation filters could not deliberately include/exclude partner capabilities.

Correction status: **implemented on the audit branch.** `AccountAccessProvider` and the account-access type now include a `partner` signal sourced from the existing `get_partner_portal_data` authorization path. A partner-denied `42501` result is treated as no partner access, while unexpected partner lookup errors remain fail-closed with the other access signals. No second partner identity system was created.

### 2. Navbar composition still does not include the partner role

The authenticated navbar currently has resident/professional/business branching but no partner branch. Its current brand destination chooses business, then homeowner, then contractor, otherwise `/portal/accept`. The mobile portal-home calculation follows the same pattern. Shared Messages/Notifications eligibility is also currently limited to business/homeowner/contractor in the navigation composition.

Impact:
- a valid partner may authenticate and resolve to `/partner-portal` at entry, while global navigation still treats that account as unclassified;
- the logo/home link and mobile Home destination can disagree with canonical partner destination;
- partner-specific shared destinations cannot be deliberately surfaced or withheld.

Correction: wire the new shared `partner` signal into brand destination, mobile portal home, role heading, route activation, and any shared capability filters. Do not expose internal workspace groups to partner accounts.

### 3. Three portal-named routes are mounted inside the internal-only workspace boundary

The router currently places these under `WorkspaceLayout`:
- `/homeowner-portal/properties`
- `/homeowner-portal/matches`
- `/contractor-portal/team`

Because `WorkspaceLayout` redirects non-internal users to their resolved portal destination before rendering the child route, a normal resident/professional cannot use those routes as written.

#### `/homeowner-portal/properties`
`PropertyIntelligence` is genuinely resident-oriented in its data model: it calls resident property APIs and maintains property, equipment, condition, warranty, and service-history records. It therefore has a legitimate resident job. However, it currently also has internal-workspace styling/copy residue, a Pennsylvania default (`state: "PA"`), and a user-facing `HLC` string. Moving it directly out of `WorkspaceLayout` without a resident-specific authorization guard would broaden it to every authenticated user.

Decision: keep the route blocked until a resident portal authorization boundary is added; then move it into the resident portal family and remove Pennsylvania-only/default-brand assumptions. This is a route-boundary correction, not a reason to create a second property system.

#### `/homeowner-portal/matches`
The mounted component is `EligibilityFit`, which is explicitly an **internal operational matching** screen. It calls the global contractor/service-area/availability APIs, links back to Work and Community Swipe, and describes offer/assignment/scheduling decisions. That is not the resident provider-match job.

The resident portal already has its own provider-match workflow through `getHomeownerPortalMatches()` and deliberate resident accept/decline actions.

Decision: **do not expose `EligibilityFit` to residents.** The misleading `/homeowner-portal/matches` alias should be removed or redirected to the resident portal’s existing match section rather than moving the internal component across the authorization boundary.

#### `/contractor-portal/team`
This route currently points at a generic `LaunchSurface page="team"` while living under `WorkspaceLayout`. There is not yet sufficient evidence that external professional accounts are entitled to manage a provider-company team independently of HomeLead Connect workspace membership.

Decision: keep it out of the professional portal until the subscription/entitlement audit proves a real professional-team capability. If the existing surface is internal workspace team administration, remove the portal-shaped alias instead of weakening authorization.

### 4. Resident portal mislabels shared service estimates as LeadScope

The resident portal currently renders the ordinary portal estimate relationship under the heading `LeadScope estimates`. These are the estimates returned through the existing homeowner portal relationship and deliberate accept/reject workflow. That does not prove the separate resident paid LeadScope measurement/estimate capability.

Correction: label these records as service/project estimates. Reserve `LeadScope` for the separate resident measurement → review → resident estimate → save → entitlement experience.

### 5. Partner visual role is incorrectly marked as resident

`PartnerPortal` currently mounts `hlc-portal-workspace is-resident`.

Correction: use a partner-specific role marker (for example `is-partner`) while retaining the common portal visual system.

### 6. Navigation metadata still contains stale product-role assumptions

The legacy ecosystem/navigation metadata still describes `/estimator` as `LeadScope` and assigns several internal routes broader audiences than their actual route authorization permits. The runtime `WorkspaceLayout` and `accessPolicy` are currently stricter than some of this descriptive metadata.

Correction: treat runtime authorization as the security authority, but clean stale metadata so product language and navigation planning stop implying that the internal estimator is resident LeadScope or that external roles can open internal CRM routes directly.

## Role dashboard fit

### Resident dashboard fit — strong foundation
The resident portal already prioritizes a computed `WHAT'S NEXT` action before deeper records. Its next-step resolver covers new request, estimate decision, provider match, payment attention, review eligibility, scheduled visit, active service, and completed work. This follows the role-first dashboard principle better than a generic dashboard would.

Needs correction:
- remove the false LeadScope label;
- add a resident-safe authorization boundary before exposing Property Intelligence;
- keep resident provider matching in the existing resident match flow rather than reusing internal `EligibilityFit`;
- later expose genuine LeadScope only through resident entitlement.

### Professional dashboard fit — strong foundation
The professional portal prioritizes verification, offered assignments, scheduled work, progress reporting, services/availability, performance, messages, and shared evidence. It correctly keeps management verification outside self-service and keeps provider progress separate from canonical HomeLead Connect job status.

Needs correction:
- verify/remove the misleading `/contractor-portal/team` route;
- keep team/workspace administration separate unless a professional subscription explicitly entitles provider-company team management.

### Partner dashboard fit — intentionally narrow
The partner portal is appropriately referral-first rather than a copy of the resident/professional/internal dashboards. It should remain narrow: referrals, status, resources, partner relationship/contact, and only future partner capabilities that are actually authorized.

Needs correction:
- finish partner-aware global navigation using the new shared partner access signal;
- partner-specific visual role marker.

### Internal CRM / SaaS fit
Internal route authorization is materially stronger than ordinary authenticated portal routing because `WorkspaceLayout` resolves destination, recognized internal role, path authorization, and billing state before rendering the child route.

Do not move CRM/SaaS administration into external portals merely because a route exists.

## Language and read-aloud audit

Current evidence in this audit does not prove a shared production translation or text-to-speech runtime. Existing profile/preferences work may store language/accessibility preferences, but preference storage must not be presented as full translated UI or read-aloud coverage.

Required shared-platform direction:
1. one canonical language preference source;
2. UI copy/content capable of resolving against that preference without role-specific reimplementation;
3. content/resource metadata that preserves source language and verified translations;
4. a shared read-aloud abstraction for important text where supported;
5. capability detection and honest fallback when a requested language/voice is unavailable;
6. no claim of “all languages” until actual provider/browser/voice coverage is verified.

This shared layer should be implemented once and consumed by Resident, Professional, Partner, Internal CRM, SaaS/admin, Resources, Academy, and AI surfaces.

## Smallest safe implementation order

1. **DONE on branch:** add the canonical shared partner access signal.
2. Finish partner-aware global navigation without broadening internal workspace access.
3. Correct resident service-estimate labeling and partner visual role marker.
4. Resolve portal-shaped routes:
   - add a resident-safe guard before exposing Property Intelligence;
   - remove/redirect the resident alias to internal `EligibilityFit`;
   - keep contractor team out of the professional portal until entitlement proves it belongs there.
5. Add route/acceptance contracts for each role boundary so direct URL access cannot silently broaden privileges.
6. Inventory the existing language preference model and any current translation/audio providers before implementing the shared language/read-aloud layer.
7. Certify the exact candidate on mobile and desktop before promotion.

No subscription pricing, LeadScope implementation, or unrelated feature expansion belongs in this audit pass.