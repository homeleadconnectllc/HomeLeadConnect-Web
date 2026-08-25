# HLC 2026 Design, Navigation & Community Campaigns Standard

Status: LOCKED POST-LAUNCH ARCHITECTURE STANDARD

This document extends the HLC Application Information Architecture Standard with the 2026 interaction, navigation, visual-system, adaptive-layout and Community Campaigns rules.

## 1. Product architecture principle

HLC is one connected operating system with five compact-screen parents:

1. Home
2. Work
3. Network
4. Community
5. More

Features do not become top-level navigation merely because they exist. Every new capability must be classified as a parent destination, child page, sibling tab, record detail, action, setting, workflow, automation, integration, portal feature or contextual AI capability.

## 2. Adaptive navigation

### Compact mobile
- Persistent bottom navigation: Home / Work / Network / Community / More.
- Icon plus visible text label for every destination.
- Current destination is always visually explicit.
- Badge only genuinely actionable counts.
- Do not reorder primary destinations by role or session.
- More opens the complete role-filtered application hierarchy.

### Medium screens
- Transform primary navigation to a rail when space permits.
- Preserve the same five information-architecture parents.
- Contextual child tabs remain inside the active parent.

### Desktop / expanded
- Collapsible left navigation grouped by the five IA parents.
- Contextual sub-navigation inside complex product areas.
- Command/global search available without forcing sidebar traversal.
- Record pages maintain stable breadcrumbs and contextual actions.

## 3. Navigation depth

Level 1: five application parents.
Level 2: product areas such as Jobs, Calendar, Match, Campaigns, Documents or Settings.
Level 3: sibling tabs such as Active / Upcoming / Needs Attention.
Level 4: record detail such as one job, provider, campaign or document.

Avoid adding additional permanent navigation levels. Deep task-specific controls belong inside the record or contextual toolbar.

## 4. Global UI anatomy

Each primary application page should use:
- Context eyebrow when useful.
- Clear page title.
- Optional live summary/status line.
- Search/filter/create controls appropriate to that page.
- Sibling tabs only when they represent equally ranked views of the same object collection.
- Content-first surface with restrained containers.
- Contextual agent entry point rather than separate duplicate AI apps.

Record pages use:
- Identity/title.
- State/status.
- Most important actions.
- Summary.
- Sibling detail tabs.
- Timeline/activity when meaningful.

## 5. Visual system

HLC retains its layered navy system and avoids generic card-wall SaaS design.

Principles:
- Strong information hierarchy before decoration.
- Fewer, larger surfaces.
- Thin borders and tonal elevation instead of excessive shadows.
- Bright HLC blue indicates action, connection, active state or important emphasis.
- State colors have semantic meaning and must not become decorative confetti.
- Use imagery, maps, diagrams, live product views and data visualizations where they communicate more efficiently than text.
- Rounded geometry is restrained; avoid pill overload and bubble UI.
- Mobile tap targets remain generous and thumb reachable.
- Empty states always explain the next useful action.
- Loading, success, warning, error, offline and permission-denied states must be explicitly designed.

## 6. Global search and command

HLC should support a unified search entry point that can locate authorized:
- people
- residents
- professionals
- providers
- leads
- requests
- estimates
- jobs
- addresses
- appointments
- campaigns
- conversations
- community posts
- documents
- settings
- help/tutorial content

The command layer may additionally expose safe quick actions such as new request, lead, estimate, appointment, job, message, follow-up and campaign, subject to role permissions.

## 7. Community hierarchy — revised

Community is now:

Community Home
- Feed
- Discussions
- Campaigns
- Events & Updates
- Reviews
- Referrals
- Moderation

Campaigns is first-class and must not be hidden inside Events, Referrals or Automations.

## 8. Community Campaigns

Route target: `/community/campaigns`
Owner: Diamond
Operational collaboration: Dion
Executive/policy escalation: Kendrell

Purpose: coordinate time-bound or ongoing community participation around a measurable goal while connecting outreach, events, referrals, education, local service activity and automation.

### Campaign home tabs
- Active
- Upcoming
- Templates
- Completed
- Analytics

### Campaign record tabs
- Overview
- Audience
- Content
- Actions
- Schedule
- Activity
- Results

### Campaign types
- Seasonal home maintenance
- Repair-awareness campaigns
- Weather preparedness
- Neighborhood service drives
- Resident education
- Renter education
- Homeowner education
- Real-estate partner outreach
- Professional/provider recruitment
- Professional activation
- Referral campaigns
- Review campaigns
- Community challenges
- Event campaigns
- Safety campaigns
- Re-engagement campaigns
- Product/feature education
- Local partnership campaigns

### Campaign builder
Every campaign defines:
1. Goal
2. Audience
3. Eligibility / exclusions
4. Start and end dates
5. Channels
6. Content assets
7. Calls to action
8. Workflow/automation
9. Recognition or incentive rules when applicable
10. Consent/compliance rules
11. Owner
12. Success metrics

### Audience targeting
Potential criteria include:
- account/persona type
- homeowner / renter / resident
- professional trade
- provider status
- service area
- geography
- property/project context
- prior HLC activity
- campaign engagement
- referral source
- community membership/activity
- lifecycle stage
- notification/communication consent

### Channels
- in-app feed
- banner
- push notification where enabled
- email where enabled
- SMS where permitted
- direct message where appropriate
- event invitation
- community post
- referral invitation
- professional opportunity surface

No channel may bypass HLC consent, suppression, permissions or quiet-hour rules.

### Campaign actions
Examples:
- read resource
- RSVP
- join challenge
- complete checklist
- submit request
- schedule assessment
- save provider
- request match
- refer a professional
- refer a resident
- leave verified review
- update professional profile
- verify availability
- connect calendar/integration
- complete tutorial

### Campaign automations
Campaigns use the central automation engine rather than implementing a second workflow engine.

Supported patterns include:
- campaign joined -> welcome
- audience enters segment -> invite
- no engagement after delay -> reminder
- event approaching -> reminder
- task completed -> recognize/update progress
- referral submitted -> attribute and follow status
- negative feedback -> Diamond recovery queue
- operational blocker -> Dion queue
- policy/risk concern -> Kendrell escalation
- campaign completed -> results summary and follow-up

### Campaign analytics
Track at minimum:
- eligible audience
- reached
- opened/viewed
- joined/accepted
- action completion
- event RSVP/attendance where relevant
- requests created
- matches initiated
- referrals created
- reviews created
- professional activations
- conversion rate
- completion rate
- opt-outs/suppressions
- complaints/reports
- workflow failures
- campaign outcome by audience/segment

Do not optimize solely for vanity engagement. Campaign results should connect to real community or service outcomes.

## 9. Community Home design

Community Home should combine:
- personalized feed
- local activity
- current campaigns
- upcoming events
- useful discussions
- member/provider recognition
- review/referral prompts when contextually appropriate
- Diamond contextual assistance

Campaigns should be visible without taking over the entire feed. Use a focused campaign rail/banner/spotlight for the highest-priority active initiative and a compact list for secondary campaigns.

## 10. Creativity standard

HLC should not imitate one competitor. It combines proven interaction patterns into a distinctive system:
- CRM clarity for records and pipelines
- field-service urgency for dispatch/jobs/calendar
- marketplace exploration for matching/directory/map
- community warmth for campaigns/discussions/events
- command-center intelligence for owners/operators
- contextual AI assistance across each domain

Animation is functional: state change, hierarchy, confirmation and spatial continuity. Avoid motion for spectacle.

## 11. Testing standard

Every major page must be checked for:
- compact iPhone width
- large phone width
- tablet/medium width
- desktop width
- keyboard navigation where applicable
- screen-reader naming/semantic controls
- tap-target safety
- long labels/data
- empty state
- loading state
- error state
- role/permission denied state
- offline/retry where network-dependent
- dark-theme contrast
- safe-area handling
- navigation persistence
- deep-link/back behavior
- route uniqueness

Campaign-specific testing additionally covers:
- audience eligibility
- consent/suppression
- start/end state
- scheduling
- attribution
- workflow idempotency
- duplicate sends/actions
- role ownership
- moderation/escalation
- analytics event correctness

## 12. Public Carrd boundary

The Carrd family remains limited to the ten locked public sites. Campaign management is an authenticated HLC application capability. Public campaign landing content, when needed, should reuse one of the existing appropriate Carrd/public surfaces or a parameterized app/public route rather than creating uncontrolled duplicate Carrd sites.
