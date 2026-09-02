# HomeLead Connect UX Information Architecture Master

Date: 2026-09-02
Status: LOCKED REDESIGN SOURCE OF TRUTH
Branch: `postlaunch/ux-information-architecture-20260902`
Production baseline: `c1bf1da457f17cccedd9d0766697ce04212fb939`

## Scope boundary

This redesign reorganizes and visually clarifies existing HLC functionality. It does not add new product scope, change billing, alter production data, weaken role access, or promote anything to production.

## Governing rules

1. One page has one primary job.
2. Related functionality nests under a parent instead of becoming another top-level destination.
3. Navigation is role-aware; residents, professionals, and internal workspace users do not see the same giant menu.
4. Each area uses the interface pattern that fits its job instead of repeating one dashboard template everywhere.
5. Signed-in operational pages do not use decorative route-top banners.
6. Existing routes and backend behavior remain available while navigation placement is reorganized.

## Visual direction

Chosen concept combines:
- the clean hierarchy and structure of the selected community-oriented layout;
- the richer accent palette from the earlier HLC concept;
- dark premium surfaces without defaulting every page to navy;
- no white, cream, eggwhite, or off-white canvas as the visual foundation;
- community, family, local-network and village cues instead of space/galaxy imagery;
- imagery only when it communicates useful context.

## Primary application tree

### Home
Purpose: starting point and attention surface, not a storage page.

Show only:
- what needs attention;
- upcoming appointments;
- recent messages;
- active jobs;
- important alerts;
- quick actions;
- short contextual AI summary.

Existing routes remain available under this branch where appropriate: `/dashboard`, `/workflow`, `/ecosystem`, `/automations`, `/notifications`, `/hq`.

### Work
Purpose: all operational work in one branch.

- Work Home: `/work`
- Leads: `/leads`
- Estimates / LeadScope: `/estimator`
- Jobs: `/jobs`
- Calendar: `/calendar`
- Follow-Ups: `/follow-ups`
- Matching where operational: `/matching`, `/work/matching`
- Operations AI: `/operations`

### Community
Purpose: the HLC village and local network.

Community absorbs the former competing Network top-level area.

- Community Home: `/community-hub`
- Discover: `/community/discover`
- Discussions: `/community/discussions`
- Map: `/map` and existing `/network/map` alias
- Provider Directory: `/providers`
- Network Home / saved relationships: `/network`
- Profiles: `/profiles`
- Reviews: `/community/reviews`
- Referrals: `/community/referrals`
- Events: `/community/events`
- Groups: `/community/groups`
- Challenges: `/community/challenges`
- Moderation: `/community/moderation`

The map is a Community destination, not an independent top-level product area.

### Messages
Purpose: conversation-first communication.

Primary route: `/messages`.

Desktop pattern:
- conversation list;
- active conversation;
- contextual details only when needed.

Mobile pattern:
- conversation list first;
- opening a conversation uses the screen as the conversation space;
- avoid dashboard cards and decorative banners.

Community-only relationship messages may remain under `/community/messages` as a nested Community surface while global Messages stays primary.

### Calls & Communication
Purpose: operational calls, texts, voicemail, handoff and communication controls that should not crowd Messages.

- Call Center: `/call-center`
- Calls & Texts: `/manual-communications`
- Notifications: `/notifications` where operationally relevant
- Customer Experience support remains contextually assisted by Diamond.

### Resources
Purpose: library/help-center behavior.

- Resources Home: `/resources`
- Materials: `/resources/materials`
- Suppliers: `/resources/suppliers`
- Forms & Checklists: `/resources/forms`
- Documents: `/documents`
- Help Center: `/help`
- Tutorials: `/tutorials`
- Rules & Safety: `/rules`

### Academy
Purpose: interactive learning, practice and CONNECT.

- Academy Home: `/academy`
- CONNECT Roleplay: `/academy/roleplay`
- CONNECT Library: `/academy/library`
- Existing progress/certification routes remain intact.

Academy must look like learning, not CRM.

### AI Team
Agents have a home but remain contextual helpers across owned surfaces.

- Kendrell: `/hq` — owner command, approvals, risk, business overview.
- Dion: `/operations` — leads, jobs, calendar, providers, workflow and analytics.
- Diamond: `/customer-experience` — Community, Messages, onboarding, reviews, referrals and recovery.

Users should not have to leave the page they are working on to get relevant AI assistance.

### Analytics
Purpose: authorized business intelligence, separate from ordinary daily navigation for users who do not need it.

- Overview: `/analytics`
- Forecasting: `/analytics/forecasting`
- Sandbox: `/analytics/sandbox`

### Account & Settings
Personal account controls remain conceptually separate from workspace/business administration even where existing routes share settings surfaces.

Personal:
- Profile: `/profile`
- security and preferences within existing account/settings surfaces.

Workspace/business:
- Settings: `/settings`
- Team: `/team`
- Billing: `/settings/billing`
- integrations, roles, workspace, branding and security through existing settings implementation.

## Role-aware primary navigation

### Resident
Recommended primary experience:
Home · Community · Messages · Bookings/Requests · Resources · Account

### Professional
Recommended primary experience:
Home · Work · Messages · Community · Academy · Resources

### HLC owner/admin/authorized workspace user
Recommended primary experience:
Home · Work · Community · Messages · More

More exposes Calls & Communication, Resources, Academy, Analytics, AI Team and Settings according to role.

## Mobile rule

The mobile bottom bar should expose only the most-used parent areas. It must not mirror every desktop destination.

Business mobile primary bar:
Home · Work · Community · Messages · More

Network is no longer a competing mobile parent. Its map, provider, profile and discovery surfaces resolve through Community.

## Desktop rule

Desktop may expose richer grouped side navigation, but groups must follow the same hierarchy. The sidebar should communicate parent/child relationships clearly instead of presenting a flat feature list.

## Current implementation checkpoint

The first implementation pass on the isolated branch:
- reorganizes navigation groups;
- folds Network & Map under Community;
- creates Messages as its own navigation group;
- separates Calls & Communication;
- separates Analytics;
- updates business mobile primary navigation to Home · Work · Community · Messages · More;
- removes signed-in decorative route banners.

## Non-regression boundary

Before promotion, the branch must prove:
- build and route integrity;
- role-based access remains fail-closed;
- existing backend flows remain unchanged;
- desktop and mobile navigation remain reachable;
- Messages remain usable as a focused communication surface;
- Community routes remain reachable after Network is no longer top-level;
- no Stripe or billing mutation was introduced;
- `main` remains untouched until explicit promotion approval.
