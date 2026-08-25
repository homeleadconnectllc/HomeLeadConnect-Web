# HomeLead Connect Route Implementation Contract

Date: 2026-08-24
Branch: `postlaunch/desktop-visual-system-20260824`
Status: post-launch visual-system implementation contract

## 1. Product-wide visual rules

These rules apply to every HLC route unless a route-specific accessibility or workflow reason requires an exception.

- Canvas: continuous dark navy, never a bright white application background.
- Primary text: near-white; secondary text: cool light blue-gray; muted copy must remain readable.
- Structural separation: thin blue/white separators and spacing, not a wall of floating rounded cards.
- Structural sections: square/flat or minimally rounded; no decorative pill containers for primary content.
- Interactive controls: buttons, inputs, select controls and compact status pills may remain rounded.
- Alerts: red is reserved for errors, destructive actions and items requiring attention.
- Forms: labels and short fields centered where appropriate; long notes, messages, descriptions and addresses remain left-aligned.
- Desktop shell: collapsible left navigation, centered brand anchor, full-width content canvas when the sidebar is collapsed.
- Agent UI: Kendrell, Dion and Diamond use integrated workspaces and contextual rails/docks that never cover primary records.
- Mobile/tablet: preserve existing interaction patterns unless an intentional improvement is separately verified.

## 2. Reusable page archetypes

### A. Command / Executive
Routes: `/dashboard`, `/ecosystem`, `/workflow`, `/automations`, `/hq`, `/notifications`

Layout:
- page toolbar/header
- compact KPI strip
- priority / queue region
- operational summary or workflow canvas
- right-side evidence/agent context only when it does not cover records

Reference behavior: Linear-style density + HubSpot-style operational visibility.

### B. Data Workspace
Routes: `/leads`, `/follow-ups`, `/jobs`, `/providers`, `/profiles`, `/matching`, `/documents`

Layout:
- top toolbar with search/filter/view controls
- continuous table/list surface
- selected row detail panel or route detail
- status, owner, next action, evidence and timestamps visible without opening decorative cards

Reference behavior: HubSpot CRM list density + Linear list clarity.

### C. LeadScope / Estimate / Workflow Detail
Routes: `/estimator`, workflow detail routes, estimate/job transition surfaces

Layout:
- record identity + stage
- evidence/scope
- editable line items
- pricing/status history
- explicit approval/conversion controls

Reference behavior: Jobber quote/estimate workflow.

### D. Schedule / Dispatch
Routes: `/calendar`, schedule surfaces in `/operations`, appointment detail

Layout:
- full calendar/workweek canvas
- filter/technician/provider controls in toolbar
- appointment blocks with strong contrast
- selected appointment detail panel

Reference behavior: Jobber/ServiceTitan scheduling and dispatch.

### E. Communications
Routes: `/messages`, `/call-center`, `/manual-communications`, `/customer-experience`

Desktop layout:
- queue/views pane
- active conversation/work item pane
- record/customer/context pane
- composer/actions anchored without covering history

Reference behavior: Intercom Inbox.

### F. Network / Discovery
Routes: `/network`, `/map`, `/providers`, `/profiles`, `/matching`, service-area/availability/saved-provider routes

Layout:
- search/filter toolbar
- provider/result list
- map or detail canvas
- canonical record identity, trade, territory, availability and verified evidence
- no invented ranking

Reference behavior: provider-discovery list + map split, adapted to HLC truth/evidence requirements.

### G. Community
Routes: `/community-hub`, `/community/discussions`, `/community/reviews`, `/community/referrals`, `/community/events`, `/community/moderation`, `/community/groups`

Layout:
- local/community toolbar and filters
- feed/list as continuous rows
- identity, time, trust/moderation signals
- discussion/event/review detail pane or route
- Diamond assistance integrated, not floating over content

### H. Knowledge / Resources
Routes: `/help`, `/tutorials`, `/rules`, `/documents`

Layout:
- searchable topic/document index
- category navigation
- reading/detail pane
- related resources and escalation path

Reference behavior: modern knowledge-base / documentation system.

### I. Settings / Account
Routes: `/settings`, `/settings/billing`, `/profile`, team/account/security/device routes

Layout:
- vertical settings navigation
- flat grouped rows/sections
- explicit save state
- red destructive/attention rows only where appropriate
- billing isolated into plan, payment/invoice and entitlement sections

Reference behavior: Stripe/GitHub-style settings hierarchy.

### J. Portals
Routes: `/homeowner-portal`, `/contractor-portal` and their subroutes

Layout:
- role-specific left navigation
- current work/request summary
- requests/jobs/appointments/messages/documents as distinct sections
- no internal-only operational clutter

Reference behavior: Jobber Client Hub, adapted to HLC resident/professional roles.

### K. Agent Workspaces
Routes: `/hq`, `/operations`, `/customer-experience`

Layout:
- agent identity and role
- current priorities/queues
- evidence/reasoning summary tied to canonical HLC records
- threaded chat/action area
- handoff/approval state
- no chatbot overlay covering the workspace

## 3. Route assignment

### Command
- `/dashboard` -> Command / Executive
- `/ecosystem` -> Command / Executive
- `/workflow` -> Command / Executive + workflow canvas
- `/automations` -> Command / Executive + automation list
- `/hq` -> Agent Workspace (Kendrell)
- `/notifications` -> Data Workspace / alert queue

### Work
- `/leads` -> Data Workspace
- `/estimator` -> LeadScope / Estimate
- `/jobs` -> Data Workspace
- `/calendar` -> Schedule / Dispatch
- `/follow-ups` -> Data Workspace
- `/operations` -> Agent Workspace (Dion) + operations queue

### Network & Map
- `/network` -> Network / Discovery
- `/map` -> Network / Discovery map split
- `/profiles` -> Data Workspace / profile directory
- `/providers` -> Network / Discovery
- `/matching` -> Network / Discovery + eligibility evidence
- `/network/service-areas` -> Network / Discovery
- `/network/availability` -> Network / Discovery
- `/network/saved` -> Data Workspace / saved provider list

### Community
- `/community-hub` -> Community
- `/community/discussions` -> Community
- `/community/reviews` -> Community
- `/community/referrals` -> Community
- `/community/events` -> Community
- `/community/moderation` -> Community moderation queue
- `/community/groups` -> Community

### Communications
- `/call-center` -> Communications
- `/messages` -> Communications
- `/manual-communications` -> Communications
- `/customer-experience` -> Agent Workspace (Diamond) + CX queues

### Resources
- `/documents` -> Knowledge / Resources + Data Workspace
- `/help` -> Knowledge / Resources
- `/tutorials` -> Knowledge / Resources
- `/rules` -> Knowledge / Resources

### Account & Portals
- `/settings` -> Settings / Account
- `/settings/billing` -> Settings / Account / Billing
- `/profile` -> Settings / Account
- `/homeowner-portal` -> Portal / Resident
- `/contractor-portal` -> Portal / Professional

## 4. Carrd vs React boundary

### Carrd/public-facing
Use Carrd for:
- Home
- Pricing
- How It Works
- Residents / Homeowners / Renters
- Professionals
- Trust / Safety / disclosures
- About / Kendrell memorial presentation
- Contact
- Demo / campaign landing pages
- Public service-request and professional-application front doors when the submission target remains canonical HLC intake

Carrd design rules:
- dark navy canvas
- centered brand and primary copy
- flat sections separated by thin blue/white rules
- rounded geometry reserved for buttons and compact inputs
- responsive embed HTML/CSS/JS only where Carrd native blocks cannot achieve the target

### React/Supabase authenticated application
Keep in React/Supabase:
- authentication/session recovery
- Dashboard
- CRM/Leads
- LeadScope/Estimates
- Jobs
- Calendar/dispatch
- Follow-ups
- Network/Map live data
- Matching
- Community authenticated features/moderation
- Messages/call center/communications history
- Documents and canonical record attachments
- Settings/billing state
- Resident/professional portals
- Kendrell/Dion/Diamond workspaces

Reason: these surfaces depend on authenticated routing, Supabase RLS, workspace membership, canonical data and application state.

## 5. Implementation order

1. Shell + typography + spacing + field/button/state primitives.
2. Command and Data Workspace archetypes.
3. Leads / Jobs / Follow-ups / Notifications / Documents migration.
4. LeadScope and Calendar archetypes.
5. Messages / Call Center / Manual Communications three-pane console.
6. Network / Map / Provider Directory / Matching split-view system.
7. Community family.
8. Settings / Profile / Billing.
9. Resident and Professional portals.
10. Kendrell, Dion and Diamond workspace parity.
11. Public/Carrd sections and embed pack alignment.
12. Desktop visual QA, mobile regression QA, Cloudflare preview certification.

## 6. Acceptance criteria

- No primary workspace content is hidden by navigation, help or agent UI.
- No route falls back to a bright white/gray application canvas.
- Primary information hierarchy is understandable without decorative cards.
- Structural containers are flat and use spacing/separators.
- Text contrast remains readable on every dark/blue background.
- Alert/danger semantics use red consistently.
- Short-form fields and labels follow centered alignment rules; long-form communication remains left aligned.
- Collapsing desktop navigation returns the full working canvas.
- Kendrell, Dion and Diamond receive equal visual quality appropriate to their access scope.
- Mobile/tablet behavior is not accidentally broken by desktop implementation.
