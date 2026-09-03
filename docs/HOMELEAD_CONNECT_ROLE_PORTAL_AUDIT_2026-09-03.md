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

### 1. Partner access is missing from the shared account-access context

`accessDestination.ts` already recognizes partner access and can route a partner to `/partner-portal`, but `AccountAccessProvider` currently resolves only business, homeowner, contractor, and internal role signals. This means shared UI that relies on `useAccountAccess()` cannot identify a partner account.

Impact:
- brand/home destination can fall back to `/portal/accept` for a valid partner account;
- mobile navigation cannot compose a partner experience;
- shared navigation filters cannot deliberately include/exclude partner capabilities.

Correction: add a `partner` signal to the shared access model using the existing partner portal authorization source; do not invent a second partner identity system.

### 2. Navbar composition does not include the partner role

The authenticated navbar currently has resident/professional/business branching but no partner branch. `/partner-portal` is also absent from its declared routed workspace set and mobile route activation logic.

Correction: partner must get its own portal home and role-appropriate shared destinations rather than being treated as an unclassified account.

### 3. Three portal-named routes are mounted inside the internal-only workspace boundary

The router currently places these under `WorkspaceLayout`:
- `/homeowner-portal/properties`
- `/homeowner-portal/matches`
- `/contractor-portal/team`

Because `WorkspaceLayout` redirects non-internal users to their resolved portal destination before rendering the child route, a normal resident/professional cannot use those routes as written.

Correction decision per route:
- `/homeowner-portal/properties`: inspect `PropertyIntelligence` and either move a safe resident view into the resident portal boundary or keep the capability internal and rename/re-route it so the path does not falsely promise resident access.
- `/homeowner-portal/matches`: resident provider matching already exists inside the resident portal via `getHomeownerPortalMatches`; avoid a duplicate independent surface unless it adds a real resident job. Prefer the shortest path.
- `/contractor-portal/team`: inspect whether this is truly a professional-company team capability. If it is internal workspace team management, remove the portal-shaped route. If it is professional entitlement scope, give it a real professional authorization boundary before exposing it.

### 4. Resident portal mislabels shared service estimates as LeadScope

The resident portal currently renders the ordinary portal estimate relationship under the heading `LeadScope estimates`. These are the estimates returned through the existing homeowner portal relationship and deliberate accept/reject workflow. That does not prove the separate resident paid LeadScope measurement/estimate capability.

Correction: label these records as service/project estimates. Reserve `LeadScope` for the separate resident measurement → review → resident estimate → save → entitlement experience.

### 5. Partner visual role is incorrectly marked as resident

`PartnerPortal` currently mounts `hlc-portal-workspace is-resident`.

Correction: use a partner-specific role marker (for example `is-partner`) while retaining the common portal visual system.

## Role dashboard fit

### Resident dashboard fit — strong foundation
The resident portal already prioritizes a computed `WHAT'S NEXT` action before deeper records. Its next-step resolver covers new request, estimate decision, provider match, payment attention, review eligibility, scheduled visit, active service, and completed work. This follows the role-first dashboard principle better than a generic dashboard would.

Needs correction:
- remove the false LeadScope label;
- verify portal-only properties/matches route placement;
- later expose genuine LeadScope only through resident entitlement.

### Professional dashboard fit — strong foundation
The professional portal prioritizes verification, offered assignments, scheduled work, progress reporting, services/availability, performance, messages, and shared evidence. It correctly keeps management verification outside self-service and keeps provider progress separate from canonical HomeLead Connect job status.

Needs correction:
- verify/remove the misleading `/contractor-portal/team` route;
- keep team/workspace administration separate unless a professional subscription explicitly entitles provider-company team management.

### Partner dashboard fit — intentionally narrow
The partner portal is appropriately referral-first rather than a copy of the resident/professional/internal dashboards. It should remain narrow: referrals, status, resources, partner relationship/contact, and only future partner capabilities that are actually authorized.

Needs correction:
- shared partner access signal and navigation;
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

1. Correct the shared partner access signal and partner-aware navigation.
2. Correct resident service-estimate labeling and partner visual role marker.
3. Resolve the three portal-shaped routes trapped behind `WorkspaceLayout` one by one based on actual capability semantics.
4. Add route/acceptance contracts for each role boundary so direct URL access cannot silently broaden privileges.
5. Inventory the existing language preference model and any current translation/audio providers before implementing the shared language/read-aloud layer.
6. Certify the exact candidate on mobile and desktop before promotion.

No subscription pricing, LeadScope implementation, or unrelated feature expansion belongs in this audit pass.