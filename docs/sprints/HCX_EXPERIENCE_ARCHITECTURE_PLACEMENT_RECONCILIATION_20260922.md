# HCX Experience Architecture + Placement Reconciliation

Date: 2026-09-22  
Status: ACTIVE ARCHITECTURE AUTHORITY  
Repository: `homeleadconnectllc/HomeLeadConnect-Web`  
Branch: `sprint/hcx-reconciliation-01-20260921`

## Governing rule

Every capability must answer:

**Where does this belong, who should see it, when should they see it, and what business record or relationship gives it meaning?**

HCX must prefer **record → context → action** over **dashboard → feature catalog**.

A capability gets one primary home. Other surfaces may expose contextual entry points without becoming competing homes.

## Current-state reconciliation findings

The existing HCX architecture already contains strong boundaries worth preserving:

- Operational Messages `/messages` and Community Messenger `/community/messages` are explicitly separate.
- Operational Work/Matching and Community discovery are explicitly separate.
- Academy/Resources already provide the right conceptual home for scripts, manuals and guided content.
- Settings already includes Account, Workspace, Communications, Notifications, Automation, Integrations, Billing, AI, Community, Privacy and Appearance categories.
- Network already owns provider discovery, map, directory and saved/provider discovery concepts.
- Community already owns discussions, events, reviews, referrals and moderation.
- Analytics already has a dedicated authorized group rather than needing dashboard tiles.
- The dashboard is already described as a daily command/attention surface.

The main placement risks identified are:

1. **Network and Community are partially collapsed in `navigationPlacement.ts`.** Community currently absorbs Network Home, Map, Providers, Profiles and Matching into one merged group. That conflicts with the newer placement rule that Community and operational/network discovery should remain distinct experience domains.
2. **`/profile` and `/profiles` need explicit responsibility separation.** `/profile` should be My HCX/private identity/preferences; `/profiles` should be canonical directory/profile presentation appropriate to role and relationship.
3. **Referrals currently have a visible Community route but are a cross-domain lifecycle.** Community may own discovery/sharing entry, while canonical attribution/outcome belongs to the relevant relationship/CRM context.
4. **Growth/Campaigns, QR records, rewards/credits and recently viewed history do not have a demonstrated canonical implementation in the inspected branch.** They must not be invented as dashboard cards.
5. **Appearance and organization branding must remain separate.** Personal appearance belongs in My HCX/Settings; organization branding requires organization authority and constrained publishing controls.
6. **Help, Tutorials, Academy Library and operational scripts can duplicate content unless one versioned knowledge authority is retained.**
7. **Universal Search and Network discovery are related but not interchangeable.** Search is global permission-filtered retrieval; Network is role/purpose-specific discovery.

## Placement decisions

| Capability | Primary home | Contextual entry | Current reconciliation |
| --- | --- | --- | --- |
| Daily attention | `/dashboard` | Work, Notifications | KEEP |
| Operational messages | `/messages` | Lead, Job, Appointment, Follow-Up | KEEP |
| Community messenger | `/community/messages` | Community relationships | KEEP |
| My identity/preferences | `/profile` | Settings | SPLIT from directory profiles |
| Directory/member profiles | `/profiles`, Network/Community context | Provider/Community discovery | SPLIT |
| Provider discovery | `/providers` / `/network` | Map, Community discovery | KEEP |
| Saved/favorites | Network Saved + contextual Save actions | Profiles/resources | MERGE by user-scoped collection |
| Referrals | Relationship/CRM context + `/community/referrals` discovery | Profiles, portals, jobs/leads | SPLIT |
| Reviews/reputation | `/community/reviews` + profile/job context | Completion, provider profile | KEEP |
| Analytics | `/analytics` | Dashboard summary, record drill-down | MOVE scattered metrics inward |
| Scripts/manuals/playbooks | `/academy/library` / Resources | Call Center, Follow-Up, onboarding | MERGE |
| Personal appearance | Settings → Appearance | Profile | KEEP |
| Organization branding | Settings → Organization/Branding | Professional/Partner portal | SPLIT |
| Growth/campaigns | Internal Growth/Campaigns | HQ/Analytics | MOVE; no dashboard tile |
| QR system | Growth for campaigns; contextual Profile/Document QR | Share actions | MOVE; purpose/provenance required |
| Rewards/credits | Profile/account value + referral/Academy context | Billing where financial | MOVE |
| Help/onboarding | `/help` + Tutorials, backed by one knowledge authority | Contextual help | MERGE |
| Moderation/reporting | `/community/moderation` | Report actions on Community content | KEEP |
| Exports/downloads | Record-specific + Settings privacy export | Documents/Analytics/Profile | SPLIT by authority |
| Universal Search | Global shell Search | Network/Community/Help | KEEP |
| Recently viewed | My HCX personal history | Home Continue/Search | MOVE; never global activity |

## Relationship architecture

HCX must use explicit verbs rather than a universal Connect action.

- **Resident → Professional:** Request Service, Request Callback, Request Consultation, Request Estimate, Request Appointment, Ask a Question.
- **Professional → Resident:** Respond to Request, Appointment Proposal, Follow-Up, Estimate/Proposal, Document Request, Project Update. No unrestricted solicitation.
- **Resident → Resident:** Referral, Community invitation, recommendation, share resource, request introduction. Private messaging remains relationship-gated.
- **Professional → Professional:** Referral, subcontract request, collaboration, introduction, team invitation, professional recommendation.
- **Resident ↔ Partner:** Resource/program/benefit requests and responses under explicit purpose and consent.
- **Professional ↔ Partner:** Partnership, supplier/resource, campaign participation, opportunity or service relationship.
- **Community:** Discover, Save, Interested, Refer, Request Introduction, Participate, Report. Community relationship never grants CRM access.

Direction is authoritative. Permission in one direction does not imply permission in the reverse direction.

## Canonical request rule

Do not force strong domain workflows into a generic connection table.

Keep service requests, appointments, estimates, jobs, invitations and communications in their domain-specific systems.

A generalized relationship/request record is appropriate only for introductions, referrals, collaboration, requests for connection, resource/program requests and similar cross-role interactions.

Required concepts:

- type
- sender person/context
- recipient person/org/context
- related record
- explicit purpose
- state
- expiry/revocation
- consent basis
- resulting relationship/action
- timestamps
- audit/history

Suggested relationship-request states:

`draft → sent → viewed → accepted | declined | expired | revoked → completed`

## Navigation decision

The existing five-parent mobile architecture remains useful, but the current implementation must not collapse separate authority domains into one menu merely for convenience.

Mobile should prioritize the user's current role and task. Deep configuration remains under Settings/More. Contextual actions belong on the record they affect.

A future implementation pass should reconcile the exact five visible mobile destinations against current physical-review authority before changing them; this architecture sprint does not change the shell yet.

## Activity vs audit

Activity is contextual operational history for a person, lead, job, appointment, professional, organization, conversation, document or billing record.

Audit is immutable/security/compliance evidence.

Do not merge them into one giant feed.

## Status rule

Authoritative status belongs to the source record: lead, appointment, job, document, payment, invitation, verification, automation, communication or moderation record.

Global views may summarize status; they may not become the source of truth.

## Implementation sequence after this inventory

1. Reconcile Network vs Community navigation grouping without breaking deep links.
2. Make `/profile` vs `/profiles` responsibilities explicit in UI and tests.
3. Reconcile referral lifecycle placement across Community, Profiles and CRM relationships.
4. Consolidate knowledge/scripts/manuals behind one versioned authority with contextual entry.
5. Define Growth/Campaign/QR authority before building any new UI.
6. Define truthful reward/credit ledger before displaying balances.
7. Add user-scoped recently-viewed/favorites only where they do not preserve revoked access.
8. Reconcile mobile placement after route/domain authority is settled.
9. Run access, route, mobile/desktop and exact-head certification.

## Release boundary

This pass is architecture/placement authority. It does not authorize new production schema, new advertising exposure, production promotion, permission expansion or destructive route removal.
