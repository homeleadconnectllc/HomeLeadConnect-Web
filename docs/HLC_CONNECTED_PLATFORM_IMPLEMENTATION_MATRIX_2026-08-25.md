# HLC Connected Platform Implementation Matrix

Date: 2026-08-25
Branch: postlaunch/ia-execution-20260825
Status: Post-launch architecture + implementation tracking

## Core Product Rule

HomeLead Connect should minimize work outside the platform.

Default design test for every capability:
1. Can the user complete the task inside HLC?
2. If not, can HLC integrate, embed, sync, automate, or provide a contextual one-tap handoff?
3. External setup belongs in Settings > Integrations & Connections; day-to-day operation belongs where the work happens.

## Status vocabulary

- ARCHITECTED: placement/behavior is defined but not yet fully wired.
- FOUNDATION: reusable data model/registry/tests exist.
- WIRED: connected to the working product UI/workflow.
- VERIFIED: acceptance, CI/build, access, mobile/desktop, integration and visual checks passed.
- BLOCKED: dependent on missing service, credentials, legal/compliance decision, or implementation dependency.

## Connected Platform Capability Matrix

| Capability | Canonical Home | Contextual Surfaces | Current State | Completion Requirement |
|---|---|---|---|---|
| Scripts Library | More > Resources > Scripts Library | Call Center, Leads, Follow-Ups, Messages, Professional Portal | FOUNDATION | UI, search/filter, versioning, approvals, contextual recommendations, analytics |
| Call scripts | Scripts Library | Call Center | FOUNDATION | call-screen access, stage-aware recommendations, usage logging |
| Rebuttals / objection handling | Scripts Library | Call Center, Leads, Follow-Ups | FOUNDATION | objection detection, approved response suggestions, next-action mapping |
| Voicemail scripts | Scripts Library | Call Center | FOUNDATION | one-tap insertion/copy, disposition linkage |
| SMS/email scripts | Scripts Library | Messages, Leads, Follow-Ups | FOUNDATION | templates, personalization, consent enforcement, send flow |
| Intelligent Dispositions | Call Center | Leads, Follow-Ups, Golden Workflow, Analytics | FOUNDATION | wrap-up UI, recommendation reason/confidence, human confirmation rules, automation triggers |
| Forms | Resources > Forms & Documents | Lead, Estimate, Job, Portal, Professional onboarding | ARCHITECTED | form builder/templates, completion state, validation, signatures, record linking |
| Checklists | Resources > Checklists / contextual records | Lead, Estimate, Job, Call Center, Settings, Portals | ARCHITECTED | reusable templates, assignments, due states, required/optional steps, completion evidence |
| Documents | Resources > Forms & Documents | Lead, Estimate, Job, Messages, Portals, Billing | ARCHITECTED | upload, classify, preview, permissions, versioning, record links |
| Document editing | Forms & Documents | Estimates, Jobs, Portals | ARCHITECTED | supported editable formats, version history, permissions, finalization controls |
| E-signatures | Forms & Documents | Estimate, Job, Portals | ARCHITECTED | signer workflow, identity/audit evidence, signed-state locking, amendments |
| Scan / camera capture | Forms & Documents | Jobs, Finance, Portals | ARCHITECTED | camera/file ingestion, crop/enhance, classification, review |
| OCR | Forms & Documents | Invoice capture, forms, receipts | ARCHITECTED | extraction, review, confidence, canonical-save controls |
| Invoice scan/extraction | Finance + Documents | Jobs, Finance | ARCHITECTED | vendor/number/date/due/subtotal/tax/total/lines extraction + review |
| Manuals | More > Resources > Manuals & SOPs | Contextual task help | ARCHITECTED | searchable library, role targeting, versioning, ownership |
| SOPs | Manuals & SOPs | Call Center, Leads, Jobs, Finance, Growth, Settings | ARCHITECTED | workflow links, required reading/acknowledgment where needed |
| Instructions & directions | Resources > Instructions | All operational pages | ARCHITECTED | short contextual task guides, deep links, search |
| Rules & Safety | More > Resources > Rules & Safety | Community, Jobs, Calls, Reviews, Settings | ARCHITECTED | governed policy content, reporting, acknowledgment/enforcement links |
| Integrations & Connections | Settings > Integrations & Connections | Every connected operational surface | ARCHITECTED | connection cards, status/health, auth, permissions, sync, errors, disconnect/reconnect |
| Email connection | Settings > Integrations & Connections | Messages, Leads, Jobs, Campaigns | ARCHITECTED | provider auth, sender identity, threading, sync, consent |
| Phone/SMS connection | Settings > Integrations & Connections | Call Center, Messages | ARCHITECTED | provider-neutral connection contract, device handoff, logging |
| Calendar connection | Settings > Integrations & Connections | Calendar, Leads, Jobs, Portals | ARCHITECTED | sync, conflicts, invite/reminder behavior, source-of-truth rules |
| Payments connection | Settings > Integrations & Connections | Billing, Finance, Jobs, Portals | ARCHITECTED | Stripe state, payment events, failures, reconciliation |
| Storage connection | Settings > Integrations & Connections | Documents, Jobs, Portals | ARCHITECTED | provider connection, file linking/sync, permissions |
| Maps/geocoding connection | Settings > Integrations & Connections | Network, Map, Calendar, Dispatch | ARCHITECTED | provider setup, geocoding/routing health, fallback behavior |
| Automation connectors | Settings > Integrations & Connections | Automations | ARCHITECTED | webhook/API/Zapier/Make/n8n-style connector contracts, logs, retries |
| API/webhooks | Settings > Integrations & Connections | Automations, Admin | ARCHITECTED | credential lifecycle, scopes, event subscriptions, audit, retries |
| Accounting / Finance | More > Finance | Jobs, Billing, Documents, Command Center | ARCHITECTED | income/expense/invoice/payment/payout/reconciliation/reporting workflows |
| Expense capture | Finance | Jobs, Documents | ARCHITECTED | scan receipt/invoice, categorize, attach to job/vendor, approve |
| Reconciliation | Finance | Payments, bank/accounting connectors | ARCHITECTED | matching, exceptions, review, audit |
| Reports | Finance / Command Center | Kendrell | ARCHITECTED | role-aware summaries, drill-downs, export |
| Growth / Marketing | More > Growth | Community, Network, Portals, Command Center | ARCHITECTED | campaigns/offers/content/audience/calendar/analytics UI |
| Community Campaigns | Community > Campaigns | Growth, Automations | ARCHITECTED | campaign builder, audience, schedule, channels, actions, results |
| Promotional offers | Growth > Offers | Campaigns, Community, Portals | ARCHITECTED | terms, audience, eligibility, approval, scheduling, measurement |
| Weekly ideas | Growth > Ideas | Command Center / agents | ARCHITECTED | recurring suggestion engine, review/approve/schedule |
| Monthly ideas | Growth > Ideas | Command Center / agents | ARCHITECTED | recurring suggestion engine, review/approve/schedule |
| Seasonal ideas | Growth > Ideas | Campaigns, Offers | ARCHITECTED | calendar-aware/local/service-category suggestions |
| Randomized creative rotation | Growth > Ideas / Campaigns | Offers, Content | ARCHITECTED | controlled variation only; never uncontrolled publishing |
| Promotions calendar | Growth > Calendar | Community Events, Automations | ARCHITECTED | campaign/offer/event schedule, conflicts, approvals |
| Growth analytics | Growth > Analytics | Command Center | ARCHITECTED | reach, engagement, conversion, referral/review/match/job attribution |
| AI operating assistance | Contextual Kendrell/Dion/Diamond | All relevant areas | ARCHITECTED | page context, permissions, approvals, audit, next-action assistance |
| In-platform task completion | Cross-platform principle | All | ARCHITECTED | minimize external app dependency and tool switching |

## Wiring rule

Connection setup lives in Settings. Operational use does not.

Examples:
- Connect Google Calendar in Settings; schedule in Calendar/Lead/Job.
- Connect email in Settings; email inside Messages/Lead/Job/Campaign.
- Connect phone/SMS provider in Settings; call/text in Call Center and records.
- Connect Stripe in Settings; see payment state in Billing/Finance/Job/Portal.
- Connect storage in Settings; attach/manage files from Documents/Jobs/Portals.
- Configure webhooks/API in Settings; monitor execution in Automations/Activity.

## No-orphan enforcement

Nothing in this matrix may be considered complete because a design document exists.

For each capability, completion requires appropriate combinations of:
- route/navigation placement
- UI
- underlying data model
- permissions/RLS/access policy
- workflow integration
- automation hooks
- notifications/consent/suppression
- agent context
- audit/history
- mobile + desktop behavior
- acceptance tests
- build/CI
- human visual QA
- integration/error/fallback testing

A capability may move from ARCHITECTED -> FOUNDATION -> WIRED -> VERIFIED only with evidence.

## Immediate execution sequence

1. Navigation shell and grouped desktop IA.
2. Shared page header/sub-tab/action contract.
3. Resources hub: Scripts, Forms & Documents, Checklists, Manuals/SOPs, Instructions, Rules & Safety.
4. Call Center: scripts + intelligent disposition wrap-up + follow-up automation.
5. Documents: upload/classify/edit/sign/scan/OCR/invoice capture foundations.
6. Settings > Integrations & Connections: canonical connection registry, health, permissions and sync/error model.
7. Finance: income/expenses/invoices/payments/reconciliation/reporting.
8. Growth: campaigns/offers/content/ideas/calendar/analytics.
9. Contextual wiring into Leads, Estimates, Jobs, Calendar, Follow-Ups, Messages, Portals, Community and Command Center.
10. Full no-orphan regression, CI/build, access-role matrix, mobile/desktop and visual verification before merge.
