# HomeLead Connect — Master Experience Architecture

Status: LOCKED conceptual master
Date: 2026-09-01

## Governing rule
Every page has one primary purpose, one clear place in navigation, one access rule, one visual identity, and one safe handoff into related systems.

## Primary areas

| Area | Purpose | Audience | Access | Primary agent |
|---|---|---|---|---|
| Home | Personalized daily command surface | Everyone | Core | Role-based |
| Work | Leads, jobs, appointments, follow-ups, operational matching | Professionals / Managers | Core | Dion |
| Network | Providers, service areas, map, coverage, discovery | Everyone by role | Core + premium depth | Dion / Diamond |
| Community | Social discovery, connections, private messenger, referrals, challenges | Members | Premium Community | Diamond |
| Academy | Learn, practice, simulate, certify | Everyone by role | Core + Premium | All three |
| Resources | Suppliers, materials, saved resources, sourcing | Everyone by role | Core + Premium tools | Dion |
| Calendar | Native HLC schedule | Everyone by role | Core | Dion |
| Messages | Operational communication | Users tied to real work | Core | Dion / Diamond |
| Analytics | Real operational insight | Professionals / Managers | Core + Premium depth | Dion / Kendrell |
| Documents | Files, photos, records, evidence | Everyone by permission | Core | Contextual |
| Profile | Identity, trust, projects, credentials, privacy | Everyone | Core + Community depth | Role-based |
| More | Settings, billing, notifications, help, integrations | Everyone | Core | Contextual |

## Mobile IA
Home · Work · Network · Community · More

- Home -> `/dashboard`
- Work -> `/work`
- Network -> `/network`
- Community -> `/community-hub`
- More -> grouped access to Calendar, Academy, Resources, Analytics, Documents, Notifications, Profile, Billing, Help, Settings

## Core placement rules
- Operational Matching -> Work (`/work/matching`)
- Community Swipe Match -> Premium Community (`/community/swipe`)
- Operational Messages -> Core (`/messages`)
- Community Private Messenger -> Premium Community (`/community/messages`)
- Resources -> practical core product; Community adds premium social sourcing intelligence
- Calendar answers “When?”; Work answers “What needs to happen?”
- Analytics = real data; Forecasting = modeled estimate; Sandbox = hypothetical simulation
- Review = experience; Referral = trust/introduction
- Academy credential = learning evidence; external verification remains separate
- Profile = shared identity object across Discover, Swipe, Map, Messenger, Reviews, Referrals, Academy, Events, Feed
- Kendrell, Dion, and Diamond remain dedicated workspaces plus contextual teacher/coach presence

## Role-aware Home
Stable hierarchy with adaptive contents:
Daily Brief -> Action Required -> Today -> Continue -> Recommended Next Actions -> Visual Work -> Community Pulse -> Academy Progress -> Quick Actions.

Primary agent by role:
- Resident: Diamond
- Professional: Dion
- Manager: Kendrell

## Work lifecycle
Request -> Lead -> Match -> Appointment -> Job -> Completion -> Follow-Up

Every work record must expose current stage, next responsible party, next action, and blocker if stalled.

Standard blockers:
- Waiting on resident
- Waiting on provider
- Needs match
- Needs appointment
- Missing document
- Materials not ready
- Compliance review
- Manager approval

## Community
Community Home -> Local Pulse -> For You -> Activity Feed -> Discover -> Swipe Match -> Private Messages -> Challenges -> Academy -> Events -> Reviews -> Referrals -> Member Profiles.

Community adapts by role:
- Resident: local help, trusted providers, learning, referrals
- Professional: networking, opportunities, reputation, growth
- Manager: network intelligence, provider discovery, leadership

## Academy + Arcade
Learn -> Practice -> Simulate -> Certify -> Apply -> Progress.

Teachers:
- Kendrell: leadership, compliance, risk, escalation, governance
- Dion: operations, CRM, matching, scheduling, scripts, Call Center, analytics
- Diamond: residents, communication, reviews, referrals, onboarding, Community/customer care

Arcade may motivate useful behavior but may not manufacture trust.

## Resources
Visual category discovery -> supplier resources -> project material planning -> maps/routing -> education -> optional premium sourcing intelligence.

Never present a naked merchant link when HLC can present a useful visual resource card. Never claim live price/inventory without a legitimate current data source.

## Analytics + Sandbox
Observe -> Explain -> Explore -> Simulate -> Compare -> Learn -> Deliberately Act.

Labels must stay distinct:
- REAL DATA
- FORECAST
- SIMULATION

No simulation control may silently alter production state.

## Access architecture
- PUBLIC: no auth
- CORE: signed-in base capability
- ROLE_RESIDENT
- ROLE_PROFESSIONAL
- ROLE_MANAGER
- COMMUNITY_MEMBER
- PREMIUM_COMMUNITY
- ADVANCED_PRO
- TRIAL_PREVIEW
- SAFETY_ALWAYS_VISIBLE

Placement and entitlement are separate. Trial users use real routes; access level changes without moving or deleting their history.

## Visual contract
Every major screen must deliberately use meaningful visual storytelling: contextual imagery, project/trade visuals, profile imagery, maps/location context, progress graphics, agent presence, empty-state artwork, and motion where useful. Imagery must explain person, project, place, trade, status, progress, or achievement—not random filler.
