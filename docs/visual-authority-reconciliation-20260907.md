# HomeLead Connect — Visual Authority Reconciliation

Date: 2026-09-07
Branch: `visual/master-system-implementation-20260907`
Purpose: route-by-route reconciliation before additional visual implementation.

## Governing rule

This document does not authorize product expansion. It reconciles the current route tree with the newest recovered visual authorities and owner-approved visual lineage. Preserve business logic, Supabase/RLS, auth, billing, routes, roles, permissions, workflow semantics, and AI ownership.

## Authority precedence

1. Current verified production behavior/security and protected product contracts.
2. Newest explicit owner-approved/frozen visual direction.
3. Recovered current visual/UX context and locked asset records.
4. Owner-approved Dashboard Version A lineage already translated into source.
5. Mobile Dashboard Suite / no-white-box correction set as mobile presentation references.
6. Complete Visual Map as broad coverage/reference map.
7. Older concept boards only where they do not conflict with newer authority.
8. Broken physical-preview screenshots are defect evidence only, never design authority.

## System-wide visual rules

- Dark premium does not mean every page is one purple/navy wash.
- No white/cream/off-white canvas foundation for the authenticated business app.
- Use role/surface accents purposefully; do not make purple the entire product identity.
- HomeLead Connect brand ownership stays visually consistent while sections retain their own purpose.
- Operational pages stay compact and task-first; no oversized marketing heroes inside recurring workspaces.
- Prefer concise rows, useful panels, clear hierarchy, and subtle separators over nested card walls.
- Mobile business navigation remains: Home · Work · Community · Messages · More.
- Messages is conversation-first, especially on mobile: list first, then full conversation space; avoid decorative banners/dashboard cards.
- Community should feel local/human/network-oriented, not like a CRM dashboard.
- Academy should look like learning, not CRM.
- Resident/customer-facing surfaces are simpler and warmer than internal SaaS.
- Contextual AI stays subordinate to the task and does not replace business logic or dominate page structure.
- Kendrell, Dion, and Diamond retain their locked identities and ownership boundaries.

## Route authority map

### Public front door and acquisition

Routes: `/`, `/homeowners`, `/contractors`, `/how-it-works`, `/leadscope`, `/community`, `/services`, `/professionals`, `/partners`, `/contact`, `/request-service`, `/professional-application`.

Authority:
- Recovered finished HomeLead Connect front-door HTML / owner screenshot for the main public entry.
- Human household/service photography and resident-first messaging.
- Professional pages use real trade/work imagery and operational value story.
- Partner pages emphasize relationship/referral handoff without exposing internal operations.
- Public/app handoffs must land on existing routes without changing route contracts.

Do not use:
- generic one-front-door placeholder hero as final authority;
- old cosmic/space concepts;
- invented product claims or fake metrics.

### Auth/account entry

Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, invitation acceptance routes.

Authority:
- Dedicated account-entry surface.
- Dark HomeLead Connect canvas, compact hierarchy, clear form states.
- No marketing hero, no white page foundation, no duplicate branding blocks.
- HomeLead Connect wording in user-facing copy; internal `HLC_*` identifiers may remain internal.

### Home / Dashboard

Route: `/dashboard`.

Authority:
- Dashboard Version A lineage + newest compact mobile dashboard references.
- Home is an attention surface: needs attention, upcoming appointments, recent messages, active jobs, important alerts, quick actions, short AI summary.
- Compact KPI grid; no oversized decorative hero.
- Maintain bottom navigation and role-aware shell.

### Work Home

Route: `/work`.

Authority:
- Dashboard Version A Work lineage + Mobile Dashboard Suite Work screen.
- Work is the parent operational branch.
- Compact workflow intro; operational destinations as rows/tiles: Leads, LeadScope/Estimating, provider fit/matching, Jobs, Calendar, Follow-Ups, Dion operations help where contextual.
- No giant “What are you working on?” marketing-style hero.

### Leads / Lead Detail

Routes: `/leads`, `/leads/:leadId`.

Authority:
- Version A serious CRM workspace lineage.
- Dense, readable operational list/table; identity, status/stage, source/value/activity, next action.
- Detail data belongs in lead detail rather than oversized list cards.
- Preserve LeadScope distinction and workflow semantics.

### LeadScope / Estimator

Routes: `/estimator`, resident LeadScope route.

Authority:
- Existing LeadScope visual contract + Version A operational workspace conventions.
- Do not collapse LeadScope into generic estimate language where product distinction matters.

### Jobs / Job Detail

Routes: `/jobs`, `/jobs/:jobId`.

Authority:
- Dashboard Version A Jobs lineage + complete visual map.
- Operational status/progress, linked lead/provider/schedule, next action; compact mobile adaptation.

### Calendar / Follow-Ups / Workflow / Automations

Routes: `/calendar`, `/follow-ups`, `/workflow`, `/automations`.

Authority:
- Existing Dashboard Version A rollout already committed historically.
- Keep purpose-specific layouts rather than re-skinning all as generic cards.
- Calendar should remain calendar/schedule-first; Follow-Ups task/reminder-first.

### Messages

Routes: `/messages`, `/community/messages`.

Authority:
- Global `/messages`: conversation-first product.
- Desktop: conversation list + active conversation + contextual details only when useful.
- Mobile: conversation list first; opened conversation takes over screen.
- No decorative hero or dashboard-card wall.
- Community messages remain nested Community context where implemented.

### Community

Routes: `/community-hub`, `/community/discover`, `/community/discussions`, `/community/reviews`, `/community/referrals`, `/community/events`, `/community/groups`, `/community/challenges`, `/community/moderation`, `/map`, `/providers`, `/network` and related aliases.

Authority:
- Community is the local village/network.
- Human/local/community cues and useful imagery where contextual.
- Discovery, discussions, reviews, referrals, events/groups remain distinct experiences.
- Map belongs under Community/network context, not as a competing top-level product identity.
- Provider discovery is not the same as operational assignment.

### Calls & Communication

Routes: `/call-center`, `/manual-communications`, `/notifications`.

Authority:
- Operational communication center distinct from Messages.
- Calls, texts, voicemail, handoff and controls should not crowd conversation-first Messages.
- No white communication islands on dark authenticated shell.

### More / Account / Settings

Routes: `/settings`, `/settings/workspace`, `/profile`, `/team`, `/settings/billing`, plus role-aware More drawer.

Authority:
- More is a compact parent navigation surface, not a giant settings dashboard.
- Security & Alerts mobile reference: concise dark rows for Personal profile, Notifications, Workspace security, Help/support, AI Team where permitted.
- Billing/settings retain existing authorization and Stripe behavior.

### Resources / Help / Academy

Routes: `/resources`, `/resources/*`, `/help`, `/tutorials`, `/rules`, `/academy`, `/academy/*`, `/documents`, `/documents/scan`.

Authority:
- Resources behaves like a knowledge/library center.
- Academy looks like learning/practice/progress, not CRM.
- Existing physical iPhone-approved Academy/Help repair remains protected unless current evidence proves regression.

### AI Team

Routes: `/hq`, `/operations`, `/customer-experience` and contextual launcher/help surfaces.

Authority:
- Kendrell: owner command/approvals/risk/business overview.
- Dion: operations across leads, jobs, calendar, providers, workflow, analytics.
- Diamond: customer experience across Community, Messages, onboarding, reviews, referrals, recovery.
- Shared visual shell can be consistent, but department accents identify responsibility.
- Avoid giant white agent cards and oversized chat-first takeover when AI is contextual.
- Preserve locked portraits and separate-image rule.

### Portals

Resident routes: `/homeowner-portal/*`.
Professional routes: `/contractor-portal/*`.
Partner routes: `/partner-portal/*`.

Authority:
- Resident: warmer, calmer, simpler consumer experience with household/property imagery where useful.
- Professional: operational/work-oriented, real trade/service imagery, offers/schedule/progress/profile.
- Partner: referral/relationship status, not internal operations/admin controls.
- Preserve fail-closed portal access boundaries.

### Analytics / Management

Routes: `/analytics`, `/analytics/*`, `/activity`, `/partners/manage`, `/hq/approvals`, `/hq/system-health`.

Authority:
- Dense authorized business intelligence/management surfaces; not ordinary daily navigation for every user.
- Use purpose-specific charts/tables/queues, not generic presentation cards.

## Current PR #332 mismatch to correct before promotion

The PR started with five visual surfaces (Sign-In, Dashboard, Leads, Jobs, Messages), but the branch has grown into a broad cascade-reconciliation effort. Its existing visual master document contains an over-broad rule that purple must not be reintroduced as a system color. That wording conflicts with the recovered newer authority: richer section/department accents are allowed, while the actual prohibition is against using purple as the entire product/canvas identity.

Therefore future implementation on this branch must:

- stop treating one terminal stylesheet as the source of truth for every route;
- repair component/source roots where the route-specific design requires it;
- preserve historical imports/contracts unless current evidence proves they are obsolete;
- use this route map before making another visual change;
- keep exact-head certification and physical iPhone approval requirements unchanged.

## Promotion rule

No production promotion from this branch until the exact final head:

1. matches the recovered authority on affected physical surfaces;
2. passes HLC Launch Candidate;
3. passes HLC Blind Visual Certification;
4. passes HLC Rendered Quality Gate;
5. passes HLC Authenticated Visual Proof;
6. receives physical iPhone PASS for visible changes;
7. receives explicit owner approval of that exact SHA.
