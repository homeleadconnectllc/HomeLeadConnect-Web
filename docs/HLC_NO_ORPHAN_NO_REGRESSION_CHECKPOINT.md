# HLC No-Orphan / No-Regression Checkpoint

Purpose: prevent any existing HLC page, route, feature, setting, portal, integration, workflow, automation, data path, public microsite, or role-specific experience from being lost while the 2026 information architecture is consolidated.

## Governing rule

Nothing is deleted, renamed, merged, hidden, or retired until all of the following are true:

1. Existing route or surface is inventoried.
2. New parent area is assigned: Home, Work, Network, Community, or More.
3. Surface type is classified: page, sub-tab, record detail, action, setting, workflow, automation, integration, portal, resource, or public Carrd surface.
4. Existing functionality is mapped to a destination.
5. Role/access behavior is preserved or intentionally replaced.
6. Deep links and internal links are redirected or updated.
7. Data source / table / RPC / API dependency is recorded.
8. Agent ownership and contextual presence is assigned where applicable.
9. Mobile and desktop navigation behavior is defined.
10. Existing test coverage is retained or replaced with equal or stronger coverage.
11. Visual QA is completed on phone and desktop.
12. Production behavior is not changed until isolated-branch verification passes.

## Mandatory inventory domains

- Public Carrd family (exactly 10 sites)
- Public app routes
- Authentication / recovery / invitations
- Command Center / Dashboard
- Golden Workflow
- Ecosystem
- Notifications / alerts
- Requests / Leads
- LeadScope / Estimates
- Jobs
- Calendar / scheduling / dispatch
- Follow-Ups
- Operations / BI
- Network Home
- Matching
- Map
- Provider Directory
- Profiles
- Community Home
- Discussions
- Campaigns
- Events & Updates
- Reviews
- Referrals
- Moderation
- Messages
- Call Center
- Calls & Texts / universal device handoff
- Documents
- Help Center
- Tutorials
- Rules & Safety
- My Profile
- Resident / renter portal
- Professional portal
- Company / Team
- Settings
- Subscription & Billing
- Integrations / Connected Apps
- Automations
- AI agents: Kendrell, Dion, Diamond
- Analytics / reporting
- Audio / voicemail / voice notes
- Notifications / suppression / consent
- Security / RLS / workspace tenancy
- Stripe / billing webhooks
- Supabase functions, migrations, RPCs, policies
- Search / quick create / global actions

## Traceability states

Every inventory item must have exactly one state:

- KEEP — remains a distinct route or product surface.
- MERGE — functionality moves into a named parent page/sub-tab; original route remains until redirect/compatibility verification is complete.
- MOVE — same feature, different navigation parent.
- RENAME — same functional responsibility with a clearer label; old deep link preserved until migration is verified.
- REDIRECT — legacy route becomes a compatibility redirect after destination passes tests.
- RETIRE — allowed only when replacement is verified and no live dependency remains.
- BLOCKED — migration cannot proceed because dependency, data, access, or UX behavior is unresolved.

No item may silently disappear.

## Required per-route migration record

For each route or product surface record:

- Current route / name
- Current parent / navigation location
- Current purpose
- Current audiences / roles
- Current data dependencies
- Current actions
- Current automations / notifications
- Current integrations
- Current tests
- New parent
- New route / destination
- New sub-tabs
- Mobile entry point
- Desktop entry point
- Agent owner / contextual agent
- Migration state
- Redirect / compatibility plan
- Verification status
- Human visual QA status

## Carrd boundary

Carrd remains limited to the locked ten public sites:

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

No authenticated CRM, operational, community, campaign, billing, settings, directory, map, workflow, document-management, or portal feature becomes a new Carrd microsite.

## Community completeness gate

Community must account for:

- Home / Feed
- Discussions
- Campaigns
- Events & Updates
- Reviews
- Referrals
- Moderation

Campaigns are a first-class Community surface and must not be collapsed into Events or Automations. Automations power Campaigns but remain a separate platform engine.

## Settings completeness gate

Central Settings must account for:

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

No settings surface should be duplicated across unrelated pages unless the page exposes a contextual shortcut back to the canonical setting.

## Release gate

A consolidation PR is not merge-ready unless:

- inventory coverage is complete,
- no route is orphaned,
- no duplicate canonical responsibility remains unexplained,
- redirects are verified where required,
- access-policy behavior is verified,
- acceptance tests pass,
- build/lint pass,
- mobile and desktop visual QA pass,
- production remains untouched until approval.
