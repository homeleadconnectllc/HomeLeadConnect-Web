# Post-Launch IA Execution Matrix

Date: 2026-08-25
Branch: postlaunch/ia-execution-20260825
Status: ACTIVE / ISOLATED / UNMERGED

## Gate 0 — Architecture lock
PASS when:
- five mobile parents are fixed
- Carrd count is fixed at ten
- route ownership is explicit
- settings categories are centralized
- Golden Workflow lifecycle is explicit
- acceptance tests enforce the contracts

## Gate 1 — Navigation shell
Target files: Navbar/App shell/config/access-policy integration

Implement:
- Mobile tab bar: Home | Work | Network | Community | More
- Desktop grouped navigation maps to same parents
- More drawer contains lower-frequency areas
- role/access filtering remains authoritative
- active-state logic recognizes logical parent groups

Test:
- owner/manager/technician role visibility
- resident portal visibility
- professional portal visibility
- direct URL access remains policy-controlled
- mobile tab targets are touch-safe

## Gate 2 — Shared page-header/sub-tab contract
Implement reusable pattern:
- eyebrow/context
- title
- compact status/count
- search/filter/create actions
- sibling sub-tabs

Test:
- no duplicate page titles
- no horizontal overflow on iPhone widths
- sub-tabs remain accessible with large text

## Gate 3 — Command Center
Route: /dashboard

Implement:
Today | Attention | KPI snapshot | Quick actions | AI briefing

Test:
- data-empty states
- loading/failure states
- role-based KPI visibility
- notification links land on canonical records

## Gate 4 — Golden Workflow + Ecosystem
Routes: /workflow, /ecosystem

Workflow tabs:
Overview | Pipeline | Automations | Exceptions | History

Ecosystem tabs:
Overview | People | Businesses | Partners | Connections | Integrations

Test:
- counts derive from canonical records
- exceptions link to actionable records
- no duplicate directory/map behavior on Ecosystem

## Gate 5 — Work
Routes: /leads, /estimator, /jobs, /calendar, /follow-ups

Leads:
New | Contacting | Qualified | Estimate | Matching | Scheduled | Won | Lost

Estimates:
Summary | Scope | Pricing | Options | Activity

Jobs:
Active | Upcoming | Unassigned | Needs Attention | Complete
Detail: Overview | Schedule | Scope | Activity | Messages | Files | Financials

Calendar:
Today | Day | Week | Agenda | Map
Mobile default: Agenda

Follow-Ups:
Due Today | Upcoming | Waiting | Overdue | Automated | Complete

Test:
- lifecycle transitions
- no record duplication
- role-safe actions
- schedule/reschedule validation
- mobile action placement

## Gate 6 — Network
Routes: /network, /matching, /map, /providers, /profiles

Network tabs:
Discover | Match | Map | Directory | Saved

Matching:
Best Match | Fastest Available | Closest | Highest Rated | Shortlist

Map:
Explore | Dispatch

Provider profile:
Overview | Services | Work | Reviews | Availability | About

Test:
- filters
- map/list state synchronization
- transparent match factors
- optional swipe never hides explicit actions
- provider visibility/privacy rules

## Gate 7 — Community
Routes: /community-hub and /community/*

Community Home:
Feed | Discussions | Events | Reviews | Referrals

Moderation:
Reports | Decisions | Appeals | Audit

Test:
- role/visibility rules
- report/moderation lifecycle
- review link to completed work where available
- referral attribution
- notification routing

## Gate 8 — Communications
Routes: /messages, /call-center, /manual-communications

Unified concepts:
Inbox | Calls | Texts | Email | Templates | Activity

Test:
- canonical lead/job/provider context
- unread state
- consent/suppression
- device handoff
- template insertion
- call disposition to follow-up

## Gate 9 — Resources
Routes: /documents, /help, /tutorials, /rules

Documents:
My Documents | Shared | Templates | Generated | Archived

Help Center collections:
Getting Started | Requests & Matching | Estimates & Jobs | Professionals | Account & Billing | Community | Integrations | Troubleshooting

Tutorials:
Start Here | Residents | Professionals | Teams | Platform

Rules & Safety:
Overview | Community Rules | Service Safety | Reviews | Reporting | Privacy

Test:
- search
- permissions
- canonical attachments
- article/tutorial distinction
- policy links

## Gate 10 — Account, Portals, Team, Settings
Routes: /profile, /homeowner-portal, /contractor-portal, /team, /settings, /settings/billing

Settings categories:
Account | Workspace | Work | Matching | Communications | Notifications | Automation | Integrations | Payments & Billing | AI | Community | Privacy & Security | Appearance | Help

Connected Apps:
Connected | Available | Activity | Issues
Per app: Overview | Permissions | Sync | Automation | Activity | Disconnect

Test:
- workspace tenancy
- team permission boundaries
- portal role separation
- billing entitlement
- integration error states
- security/session actions

## Gate 11 — Agent context
Kendrell owns command/settings/risk.
Dion owns operations/matching/workflow execution.
Diamond owns communications/community/customer experience.

Test:
- agent dock appears only where relevant
- handoffs maintain record context
- action previews respect authority
- audit trail records agent-assisted actions

## Gate 12 — Carrd consolidation
Exactly ten public sites.

Execution:
- remove duplicate marketing narratives
- assign every public topic to one site
- product/live feature CTAs route into app/onboarding
- no new Carrd microsite for operational feature

Test:
- all links absolute and valid
- no duplicate page intent
- mobile visual QA
- correct official logo
- page-specific CTA consistency

## Gate 13 — Full verification
Required before merge:
- npm run lint
- npm run test:acceptance
- npm run launch:audit
- npm run build
- CI checks
- mobile rendered QA
- desktop rendered QA
- auth role matrix
- direct-route access checks
- network/map/community functional checks
- no production merge until human visual approval
