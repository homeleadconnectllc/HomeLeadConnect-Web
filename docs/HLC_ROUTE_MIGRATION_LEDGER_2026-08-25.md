# HomeLead Connect Route Migration Ledger

Date: 2026-08-25
Status: Post-launch architecture execution safeguard
Branch: `postlaunch/ia-execution-20260825`

## Purpose

This ledger prevents route, feature, access, workflow, portal, integration, agent, or content loss while HomeLead Connect moves from the existing flat/grouped navigation into the locked 2026 information architecture.

No route may be deleted, hidden, repurposed, or merged without an explicit disposition and verification path.

Disposition vocabulary:
- KEEP — remains a first-class route.
- MERGE — capability moves into another canonical route while preserving behavior and data.
- MOVE — route remains but changes parent/navigation placement.
- RENAME — route label changes; route path may remain for compatibility.
- REDIRECT — old path remains as a compatibility redirect after the destination is verified.
- RETIRE — only after usage, data, deep links, permissions, and replacement are proven safe.
- BLOCKED — cannot move until dependency/security/data evidence is complete.

## Locked top-level mobile parents

1. Home
2. Work
3. Network
4. Community
5. More

## Home / Command

| Existing route | Current capability | New parent | Disposition | Required preservation |
|---|---|---|---|---|
| `/dashboard` | Dashboard / command center | Home | KEEP + RENAME label to Command Center where useful | KPIs, queues, alerts, quick actions, AI briefing, analytics mounts |
| `/workflow` | Golden Workflow | Home | KEEP | Request→Qualify→Estimate→Match→Schedule→Job→Complete→Payment→Review→Referral lifecycle |
| `/ecosystem` | Ecosystem map/status | Home | KEEP | people, businesses, partners, connections, integrations, system ownership |
| `/automations` | Workflow automation | Home | KEEP | active automations, templates, history, failures, approval boundaries |
| `/notifications` | Alerts | Home | MOVE | security, workflow, message, billing, integration and community alerts |
| `/hq` | Kendrell command | Home | KEEP | approvals, risk, executive summaries, audit and cross-agent orchestration |

## Work

| Existing route | Current capability | New parent | Disposition | Required preservation |
|---|---|---|---|---|
| `/leads` | Leads / request pipeline | Work | KEEP + broaden label to Requests & Leads | intake, status, qualification, assignment, activity, next action |
| `/estimator` | LeadScope / estimates | Work | KEEP + RENAME label to Estimates | evidence, scope, quantities, pricing, options, send/approve, conversion |
| `/jobs` | Jobs | Work | KEEP | active/upcoming/unassigned/attention/complete, assignments, evidence, completion |
| `/calendar` | Calendar / scheduling | Work | KEEP | agenda/day/week/map, appointments, dispatch, availability, reschedule |
| `/follow-ups` | Follow-Ups | Work | KEEP | due/upcoming/waiting/overdue/automated/complete, dispositions |
| `/operations` | Dion operations/BI | Work + contextual AI | KEEP | operational intelligence, SLA risk, queues, recommendations, handoffs |

## Network

| Existing route | Current capability | New parent | Disposition | Required preservation |
|---|---|---|---|---|
| `/network` | Network Home | Network | KEEP | discover, recommended, categories, saved, activity |
| `/matching` | Matching | Network | KEEP | eligibility, availability, fit evidence, shortlist, offer/acceptance state |
| `/map` | Map | Network | KEEP | explore/dispatch, provider/job pins, service areas, filters, record cards |
| `/providers` | Provider Directory | Network | KEEP | search/filter by trade, territory, availability, verification, rating/evidence |
| `/profiles` | Participant profiles | Network | KEEP | resident, renter, provider, contractor, subcontractor, business, partner profiles |

## Community

| Existing route | Current capability | New parent | Disposition | Required preservation |
|---|---|---|---|---|
| `/community-hub` | Community Home | Community | KEEP | feed, personalized/local activity, recommendations, member connections |
| `/community/discussions` | Discussions | Community | KEEP | topics, replies, saves, reports, moderation |
| `/community/events` | Events & Updates | Community | KEEP | announcements, workshops, networking, education, local events |
| `/community/reviews` | Reviews | Community | KEEP | completion-linked reviews, responses, disputes, verified-job context |
| `/community/referrals` | Referrals | Community | KEEP | professional and service-need referrals, attribution, status |
| `/community/moderation` | Moderation | Community | KEEP | reports, decisions, appeals, enforcement, audit |
| `/community/campaigns` | Campaigns | Community | ADD as first-class canonical route | audience, goals, content, channels, schedule, automation, activity, results |

### Campaigns rule

Campaigns is not a duplicate automation engine. Campaigns owns the community/growth objective, audience, content, schedule, participation, and results. The central automation engine executes triggers/actions underneath it.

Campaign examples include seasonal maintenance, weather preparedness, renter/homeowner education, professional recruitment, referral pushes, review drives, local service initiatives, safety campaigns, re-engagement, challenges, and event promotion.

## Communications

| Existing route | Current capability | New parent | Disposition | Required preservation |
|---|---|---|---|---|
| `/messages` | Messages | More / Communications | KEEP | contextual threads, attachments, unread state, record links |
| `/call-center` | Call Center | More / Communications | KEEP | queue, scripts, lead context, disposition, follow-up, voicemail |
| `/manual-communications` | Calls & Texts / device handoff | More / Communications | KEEP | universal phone handoff, provider connectors, consent/suppression |
| `/customer-experience` | Diamond CX | More + contextual Community presence | KEEP | onboarding, recovery, reviews, referrals, customer/community intelligence |

## Resources

| Existing route | Current capability | New parent | Disposition | Required preservation |
|---|---|---|---|---|
| `/documents` | Documents | More / Resources | KEEP | authorized record attachments, shared/generated/archive concepts |
| `/help` | Help Center | More / Resources | KEEP | search, collections, troubleshooting, escalation |
| `/tutorials` | Tutorials | More / Resources | KEEP | guided learning paths, contextual onboarding, progress |
| `/rules` | Rules & Safety | More / Resources | KEEP | service safety, community rules, review policy, reporting, privacy/enforcement |

## Account, administration and portals

| Existing route | Current capability | New parent | Disposition | Required preservation |
|---|---|---|---|---|
| `/profile` | My Profile | More | KEEP | identity, contact, preferences, visibility, consent, notifications |
| `/settings` | Workspace settings | More / Settings | KEEP + deepen internal settings IA | account, workspace, work, matching, communications, notifications, automation, integrations, billing, AI, community, privacy/security, appearance, help |
| `/settings/billing` | Subscription & Billing | More / Settings | KEEP | Stripe/webhook-confirmed state, plan, invoices, payment method, billing history, entitlements |
| `/team` | Company Team | More / Settings | KEEP | members, roles, invitations, permissions, locations, access review |
| `/homeowner-portal` | Resident/Homeowner/Renter Portal | Portal experience | KEEP | requests, estimates, matches, appointments, messages, docs, reviews |
| `/contractor-portal` | Professional Portal | Portal experience | KEEP | profile, opportunities, matches, jobs, calendar, documents, reviews, performance |
| `/portal/accept` | Portal/access resolution | Access flow | KEEP | safe role/destination resolution |

## Public and acquisition app routes

These application routes remain governed by the no-orphan rule even while the public marketing family is consolidated into exactly ten Carrd sites.

| Existing route | Disposition | Rule |
|---|---|---|
| `/` | KEEP unless public-site routing is intentionally delegated | Never break production entry points |
| `/request-service` | KEEP | Canonical service intake must remain functional and CRM-connected |
| `/contact` | KEEP or REDIRECT only after Carrd contact flow is verified | Preserve attribution and intake behavior |
| `/login` | KEEP | Auth entry |
| `/signup` / `/register` where present | KEEP / reconcile naming | Preserve account creation and role resolution |
| `/forgot-password` | KEEP | Recovery |

## Carrd public-site boundary

Exactly ten public Carrd surfaces remain the marketing/legal family:
1. Home
2. About
3. Platform
4. Innovation
5. Professionals
6. Welcome
7. Demo
8. Contact
9. Privacy
10. Terms

Operational features do not become additional Carrd microsites.

## Cross-cutting capabilities that cannot be orphaned

Every route migration must preserve or explicitly re-home these capabilities:
- role-based access and workspace membership checks
- Supabase RLS behavior
- canonical request/lead ingestion
- estimate-to-job conversion
- provider matching and assignment state
- appointments and rescheduling
- follow-up state and dispositions
- messages, call logs, voicemail and communication consent/suppression
- Stripe subscription and entitlement checks
- notifications and alert routing
- Kendrell, Dion and Diamond contextual presence and handoffs
- audit trails and approval boundaries
- documents and record associations
- analytics/telemetry currently mounted in authenticated routes
- mobile safe-area, responsive and accessibility behavior
- deep links and bookmarked URLs
- existing acceptance and security tests

## Migration gate per route

A route may move only when all applicable gates are PASS:
1. Current feature inventory captured.
2. Destination in locked IA identified.
3. Data dependencies identified.
4. Access/RLS behavior compared.
5. Existing actions preserved.
6. Empty/loading/error states preserved or improved.
7. Mobile and desktop navigation updated.
8. Deep links/redirects verified.
9. Contextual agent ownership verified.
10. Automated tests pass.
11. Rendered mobile/desktop QA passes.
12. No duplicate replacement surface remains without an explicit reason.

## Current execution order

1. Navigation shell alignment.
2. Reusable page-header/sub-tab system.
3. Command Center / Golden Workflow / Ecosystem.
4. Work surfaces.
5. Network / Match / Map / Directory.
6. Community including Campaigns.
7. Communications.
8. Resources.
9. Settings / Integrations / Team / Billing.
10. Resident and Professional portals.
11. Carrd ten-site consolidation and cross-link audit.
12. Full end-to-end no-orphan reconciliation.

## Final rule

Nothing is considered removed merely because it is no longer visible in the same navigation position. Every old capability must have a verified destination or an explicitly approved retirement record.
