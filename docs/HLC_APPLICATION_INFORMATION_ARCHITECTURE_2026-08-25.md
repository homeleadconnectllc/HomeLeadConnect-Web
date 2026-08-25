# HomeLead Connect Application Information Architecture

Date: 2026-08-25
Status: LOCKED POST-LAUNCH ARCHITECTURE STANDARD
Scope: Authenticated HLC application + Carrd/public-site consolidation

## Non-negotiable navigation rule

Every feature belongs to one of five mobile parents:

1. Home
2. Work
3. Network
4. Community
5. More

A new feature does not become a new top-level navigation destination by default. It must first be classified as a page, sub-tab, record detail, action, setting, workflow, automation, integration, portal feature or resource.

Desktop may expose the same information in richer grouped side navigation, but the underlying hierarchy remains identical.

## Home / Command Center

Primary route: `/dashboard`

Purpose: daily command surface, not a generic dashboard.

Required modules:
- Today: appointments, jobs, follow-ups, unread messages, new leads, approvals.
- Attention: no-response leads, estimate delays, unconfirmed appointments, unassigned work, failed payment, disconnected integration, failed workflow.
- Quick actions: request, lead, estimate, schedule, match, message, job.
- KPI snapshot: leads, matches, appointments, jobs, completion, response, estimate/revenue pipeline where permitted.
- AI briefing: Kendrell owner/admin summary, Dion operations summary, Diamond CX/community summary.

## Golden Workflow

Route: `/workflow`
Tabs: Overview | Pipeline | Automations | Exceptions | History

Canonical lifecycle:
Request → Qualify → Estimate → Match → Schedule → Job → Complete → Payment → Review → Referral / Repeat

Side paths:
- Request → Not Qualified
- Estimate → Changes Requested
- Match → No Provider Available
- Schedule → Reschedule
- Job → Issue / Escalation
- Complete → Warranty / Follow-Up

Mobile pipeline presents one stage at a time rather than a miniature desktop kanban.

## Ecosystem

Route: `/ecosystem`
Tabs: Overview | People | Businesses | Partners | Connections | Integrations

Purpose: executive relationship map across residents, renters, homeowners, real-estate professionals, providers, businesses and partners. It is not a duplicate provider directory.

## Work

Logical tabs: Requests & Leads | Estimates | Jobs | Calendar | Follow-Ups

### Requests & Leads (`/leads`)
Statuses: New | Contacting | Qualified | Estimate | Matching | Scheduled | Won | Lost

Record essentials: person, property, service, urgency, timing, photos, source, location, communication state, owner, next action.

### Estimates (`/estimator`)
Record tabs: Summary | Scope | Pricing | Options | Activity
Actions: Edit | Send | Share | Approve | Request Changes | Convert to Job

### Jobs (`/jobs`)
List tabs: Active | Upcoming | Unassigned | Needs Attention | Complete
Record tabs: Overview | Schedule | Scope | Activity | Messages | Files | Financials

### Calendar (`/calendar`)
Views: Today | Day | Week | Agenda | Map
Filters: Team | Provider | Type | Status | Area
Mobile default: Agenda.

### Follow-Ups (`/follow-ups`)
Tabs: Due Today | Upcoming | Waiting | Overdue | Automated | Complete
Every item must explain why follow-up exists and whether it is MANUAL or AUTOMATED.

## Network

Primary route: `/network`
Tabs: Discover | Match | Map | Directory | Saved

Network Home includes category search, location, recommendations, available-soon providers, near-you providers, recently viewed and saved providers.

### Matching (`/matching`)
Optional swipe gestures may speed selection but never replace explicit buttons.
Ranking factors may include trade, service area, distance, availability, project fit, budget fit, customer/property eligibility, workload, response time, acceptance rate, rating, HLC performance, repeat relationship and verification.

Transparent result views:
- Best Match
- Fastest Available
- Closest
- Highest Rated
- Shortlist

### Map (`/map`)
Modes: Explore | Dispatch
Explore: provider pins, service areas, filters, profile cards.
Dispatch: jobs, providers, unassigned work, urgent requests, service-area boundaries, next appointments and route context.

### Provider Directory (`/providers`)
Search/filter by trade, location, availability, verification, service area and approved evidence.
Provider profile tabs: Overview | Services | Work | Reviews | Availability | About

### Profiles (`/profiles`)
Canonical profile system for residents, renters, homeowners, providers, businesses and partners.

## Community

Primary route: `/community-hub`
Tabs: Feed | Discussions | Events | Reviews | Referrals

### Discussions
Categories: Ask a Pro, Repairs, Remodeling, Renters, Homeowners, Real Estate, Professionals, Local Recommendations, HLC Help.

### Events & Updates
Support RSVP, reminders, host, capacity, recurring events and visibility rules.

### Reviews
Filter by provider, service and project. Support verified-job context, photos, provider responses, disputes and moderation.

### Referrals
Two primary flows: Refer a Professional; Refer Someone Who Needs Help.
Track sent, accepted and converted states.

### Moderation
Queue must support reports, rules, decisions, appeals and audit history.

## Communications

Parent: More
Surfaces: Inbox | Calls | Texts | Email | Templates | Activity

Messages must carry record context (lead/job/provider/community) rather than functioning as a detached inbox.

Call Center (`/call-center`) includes daily queue, lead context, scripts, dispositions, voicemail and follow-up.
Calls & Texts (`/manual-communications`) remains provider-agnostic and device-handoff friendly.

## Automations

Route: `/automations`
Tabs: Active | Templates | History | Errors

Automation model: Trigger → Conditions → Actions → Fallback

Template domains:
- leads
- estimates
- matching
- scheduling
- jobs
- customer experience
- billing
- operations

Settings owns governance/defaults; Automations owns day-to-day workflow operation.

## Resources

Parent: More
Resource Home: Documents | Help Center | Tutorials | Rules & Safety | Downloads

### Documents (`/documents`)
Tabs: My Documents | Shared | Templates | Generated | Archived
Types include estimates, invoices, contracts, scope, photos, credentials, permits, receipts, onboarding and internal docs.

### Help Center (`/help`)
Collections: Getting Started | Requests & Matching | Estimates & Jobs | Professionals | Account & Billing | Community | Integrations | Troubleshooting

Articles include breadcrumbs, screenshots, related articles, feedback and escalation.

### Tutorials (`/tutorials`)
Learning paths: Start Here | Residents | Professionals | Teams | Platform
Tutorials are guided tasks, not duplicate help articles.

### Rules & Safety (`/rules`)
Tabs: Overview | Community Rules | Service Safety | Reviews | Reporting | Privacy

## Account, Portals and Team

### My Profile (`/profile`)
Identity, contact, preferences, visibility, consent and personal notification controls.

### Resident Portal (`/homeowner-portal`)
Requests, estimates, matches, appointments, messages, documents and reviews.

### Professional Portal (`/contractor-portal`)
Profile, opportunities, matches, jobs, calendar, documents, reviews and performance.

### Company Team (`/team`)
Members, invitations, roles, permissions, locations and access review.

## Settings

Primary route: `/settings`

Categories:
- Account
- Workspace
- Work
- Matching
- Communications
- Notifications
- Automation
- Integrations
- Payments & Billing
- AI
- Community
- Privacy & Security
- Appearance
- Help

Integrations belongs under Settings, with a Connected Apps operational entry point.
Connected-app states: Connected | Needs Attention | Disconnected | Expired | Limited | Error
Per-app tabs: Overview | Permissions | Sync | Automation | Activity | Disconnect

Native/core integration priority:
- Stripe
- Google Calendar
- Gmail
- Google Drive
- Supabase
- map/geocoding provider

Automation/connectivity layer:
- Zapier
- Make
- n8n
- webhooks/API

## AI placement

Kendrell: Home, Ecosystem, Settings, billing, approvals, risk.
Dion: leads, estimates, jobs, calendar, matching, providers, map, workflows, call center.
Diamond: messages, community, reviews, referrals, onboarding, help, recovery and customer-facing experiences.

Agents are contextual helpers across their owned areas, not three disconnected standalone apps.

## Mobile record standard

Every record page should present:
1. context label
2. primary title
3. status
4. high-value quick actions
5. summary
6. sibling record tabs

Avoid redundant headings such as Dashboard → Dashboard → Dashboard Overview.

## Filtering standard

Primary list filter row:
Search + Status + Trade + Owner + Date + More
Active filters display removable chips.
Full filters open as a bottom sheet on mobile.

## Global Search

Must ultimately find people, leads, jobs, providers, addresses, messages, estimates, documents, community posts, settings and help.

## Quick Create

Global create menu:
New Request | New Lead | Estimate | Appointment | Job | Message | Provider | Follow-Up

## Carrd/Public split

Carrd is limited to exactly ten public/marketing/legal sites:
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

Authenticated operational pages stay in the HLC application. Carrd pages must not duplicate logged-in product areas.

## Governance

This file is the source-of-truth architecture standard for future post-launch work. New pages/features must be mapped here before being promoted to top-level navigation.
