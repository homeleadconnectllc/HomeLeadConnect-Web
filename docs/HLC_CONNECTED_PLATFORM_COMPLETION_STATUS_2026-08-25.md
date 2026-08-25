# HLC Connected Platform Completion Status

Date: 2026-08-25
Branch: `postlaunch/ia-execution-20260825`
PR: #197

## Status definitions

- **WIRED** — user-facing route/context exists, real data/actions are connected, permissions/workflow boundaries exist, and the capability is materially usable in the app. This does not mean final visual or CI certification is complete.
- **FOUNDATION** — real code/data/API capability exists, but the full in-app workflow is not yet connected end to end.
- **ARCHITECTED** — product placement, rules, workflow, and ownership are defined, but the operational capability still needs implementation.
- **BLOCKED** — implementation depends on a provider/API/schema/security/legal decision that must be resolved before claiming the capability.

## Certified current state

| Capability | Status | Existing evidence | What is still required |
|---|---|---|---|
| Mobile primary navigation | WIRED | `Navbar.tsx` now uses Home / Work / Network / Community / More for business users | CI + rendered mobile/desktop QA; desktop hierarchy normalization |
| Existing route preservation | FOUNDATION | Route migration ledger + no-orphan checkpoint exist; current router contains the legacy/operational routes | Automated route coverage + redirect/deprecation verification before later consolidation |
| Scripts / rebuttals / talk tracks | FOUNDATION | `src/data/scriptLibrary.ts` + tests contain call, voicemail, SMS, follow-up, onboarding and objection content | User-facing Scripts Library surface; contextual launch from Call Center/Leads/Follow-Ups/Messages; approval/versioning/search |
| Intelligent Dispositions registry | FOUNDATION | `src/data/intelligentDispositions.ts` + tests | Wire registry into Call Center wrap-up UI; suggestion reason/confidence; required-field enforcement; automation/workflow updates; analytics |
| Basic Call Center | WIRED | Existing `CallCenter.tsx` loads business phones/call sessions, supports carrier/device handoff and persists operator dispositions | Intelligent dispositions, scripts, queue intelligence, callback automation, provider-neutral integrations, richer analytics |
| Manual communications | WIRED/PARTIAL | Existing route supports provider/device communication handoff and recordkeeping | Broader provider connectors, receipts/sync, consent/suppression audit, fewer external handoffs |
| Documents upload/library | WIRED | Existing `Documents.tsx` uploads files, links them to HLC records, applies sharing scope, lists stored evidence, opens signed URLs | Tabs/library organization, editing/version history, generated docs, templates, archive, richer record filters |
| Photo/video evidence capture guidance | WIRED | Existing Documents surface includes capture guidance and privacy boundaries | Native capture UX, annotation and evidence workflows if desired |
| Document editing | ARCHITECTED | Document standard defines editing/versioning model | Editor implementation, supported formats, version storage, permissions and audit |
| Scanning + OCR | ARCHITECTED | Scan/OCR flow and review requirement defined | Camera/document capture, OCR provider/library, extraction review UI, confidence handling, storage/audit |
| Invoice/receipt extraction | ARCHITECTED | Extraction fields and canonical-review rule defined | Parser/OCR, vendor/line-item mapping, finance linkage, duplicate detection and review UI |
| E-signatures | ARCHITECTED | Signature states/version/amendment rules defined | Signature provider or native signing implementation, signer identity, envelope state, audit trail, portal signing UI |
| Forms | ARCHITECTED | Forms/document standard defines contextual placement | Form builder/registry, submission storage, permissions, templates, record linking, portal access |
| Checklists | ARCHITECTED/PARTIAL | Job/resource architecture references checklists; Start Here/tutorial steps exist | Reusable checklist engine, required/optional tasks, completion evidence, job/lead/estimate templates |
| Manuals | WIRED/PARTIAL | `OperationalGuide.tsx` links Technician Troubleshooting and Manager Operations manuals in-app | Expand library, versioning, search, contextual deep links, additional role manuals |
| Instructions / directions / SOPs | FOUNDATION | Operational Guide has role tutorials, help content and manuals; standards define placement | Central searchable registry + contextual delivery on each workflow screen + version/ownership metadata |
| Rules & Safety | WIRED/PARTIAL | `/rules` exists with access, data, communication, provider, AI, community, security and incident rules | Full policy registry, reporting/appeal UI, jurisdiction/legal review where required, contextual rule surfacing |
| Help Center | WIRED/PARTIAL | `/help` exists with recovery guidance and linked actions | Search, article taxonomy, dynamic role filtering, telemetry, contact/escalation ticketing |
| Tutorials | WIRED/PARTIAL | `/tutorials` contains role playbooks and linked actions | Interactive guided tasks, completion/progress, contextual tutorials, role-specific onboarding |
| Settings: workspace/profile/business | WIRED | Existing Settings reads/saves profiles, business profile and workspace switching | Reorganize into the locked searchable settings IA |
| Settings: telephony connection state | WIRED/PARTIAL | Existing Settings lists business phones/provider readiness and links Call Center/manual communications | Connection setup UX, provider-neutral connectors, credential lifecycle, webhooks/sync health |
| Settings: subscription billing | WIRED/PARTIAL | Existing Settings reads billing offer/status and can launch checkout/Stripe portal when environment is enabled | Full billing page normalization, invoices/history/usage/seats and production canary certification |
| Integrations & Connections hub | ARCHITECTED | Locked Settings architecture + connection standard | Central Connected/Available/Activity/Issues UI; connection registry; OAuth/API/webhook lifecycle; health logs |
| Gmail/email connection | ARCHITECTED/BLOCKED | Placement defined | Provider integration, sender identities, sync/delivery evidence and consent model |
| Calendar connection | ARCHITECTED | Placement defined | Google Calendar/provider sync, conflict handling, bidirectional event evidence |
| Storage connection | ARCHITECTED | Placement defined | Drive/storage connector management and attachment synchronization |
| Maps/geocoding connection | FOUNDATION/PARTIAL | Provider map/network routes already exist | Verified geocoding/routing provider integration, service areas, dispatch mode, permissions/privacy |
| Automation engine | WIRED/PARTIAL | `/automations` exists and architecture/template library are defined | Verify real trigger/action coverage, error recovery, approval gates, audit, connections to all new domains |
| Golden Workflow | WIRED/PARTIAL | `/workflow` exists and canonical stages are locked | Full Request → Review/Referral record lineage and exception automation verification |
| Leads/CRM | WIRED/PARTIAL | `/leads` and lead detail routes exist | Full new IA/sub-tabs, forms/scripts/disposition context, workflow and automation evidence |
| Estimates | WIRED/PARTIAL | `/estimator` exists | Locked tabs/actions, document/signature/form integration and end-to-end approval-to-job verification |
| Jobs | WIRED/PARTIAL | `/jobs` and job detail exist | Locked detail tabs, checklist/forms/signatures/financials and operational handoff verification |
| Calendar/scheduling | WIRED/PARTIAL | `/calendar` exists | Agenda/map modes, provider calendar sync, richer dispatch/routing and reminder evidence |
| Follow-Ups | WIRED/PARTIAL | `/follow-ups` exists | Locked tabs, manual/automated labeling, intelligent disposition handoffs and workflow automation |
| Network home | FOUNDATION/PARTIAL | `/network` route exists through LaunchSurface | Full designed Network home, real search/saved/activity states and canonical links |
| Matching | FOUNDATION/PARTIAL | `/matching` and eligibility evidence routes exist | Explainable ranking, Best/Fastest/Closest/etc views, project-context workflow, acceptance/decline automation |
| Provider Directory | FOUNDATION/PARTIAL | `/providers` and provider detail routes exist | Full filters/search/list-map toggle, verified evidence and public/private profile split |
| Profiles | FOUNDATION/PARTIAL | `/profiles` route exists | Canonical resident/pro/provider/business/partner profile UX and record ownership verification |
| Map | FOUNDATION/PARTIAL | ProviderMap route exists | Explore/Dispatch modes, route context, service boundaries, privacy-safe live/permissioned location behavior |
| Community Home | WIRED/PARTIAL | `CommunityHub.tsx` links discussions/groups/events/reviews/referrals/moderation and network tools | New five-tab Community experience and Campaigns integration |
| Discussions | FOUNDATION/PARTIAL | route exists via LaunchSurface | Real threads/replies/saves/reports/moderation data workflows if not already supplied elsewhere |
| Community Campaigns | ARCHITECTED | Campaign architecture is locked | `/community/campaigns` route, builder, audience, content/actions/schedule/activity/results, automation linkage |
| Events & Updates | FOUNDATION/PARTIAL | route exists | Full event model, RSVP/reminders/host/capacity/recurrence/privacy and update-center separation |
| Reviews | FOUNDATION/PARTIAL | route exists | Verified-job enforcement, provider response, dispute/report workflow and automation |
| Referrals | FOUNDATION/PARTIAL | route exists | Invitation/attribution/conversion tracking, consent and analytics |
| Moderation | FOUNDATION/PARTIAL | route exists | Queue/status/actions/appeals/audit and AI-triage with human enforcement controls |
| Growth / marketing | ARCHITECTED | Growth standard defines Campaigns/Offers/Content/Audience/Calendar/Ideas/Analytics | User-facing Growth workspace, data model, content calendar, publishing/integration connectors, analytics |
| Promotional offers | ARCHITECTED | Offer lifecycle and approval rules defined | Offer registry, eligibility/terms, scheduling, redemption/attribution and campaign placement |
| Weekly/monthly/seasonal idea engine | ARCHITECTED | Recurring/seasonal/randomized idea rules defined | Idea-generation UI, calendar scheduler, approval queue, rotation rules and performance feedback loop |
| Finance/accounting | ARCHITECTED | Finance standard defines income/expenses/invoices/payments/payouts/reconciliation/reports | Finance routes/data model, bookkeeping categories, transaction imports, reconciliations, reports and integrations |
| Job payments/customer invoices | FOUNDATION/PARTIAL | Estimate/job/billing primitives exist; Stripe subscription path exists separately | Keep job finance separate from SaaS subscription billing; implement invoices/payment collection/ledger/reconciliation |
| SaaS subscription billing | WIRED/PARTIAL | Stripe checkout/status/portal path exists | Production verification, billing history/usage/seats and final entitlements audit |
| Kendrell/Dion/Diamond contextual AI | FOUNDATION/PARTIAL | Agent routes, page knowledge/presence tests and agent workspaces exist | Deeper contextual actions across every relevant page, approval previews, connected platform actions and audit verification |
| Connected-platform principle | FOUNDATION | Architecture explicitly says connect once in Settings/use inside HLC | Reduce remaining external handoffs by implementing integrations, embedded/contextual actions and sync evidence |
| Carrd 10-site consolidation | ARCHITECTED | Exact ten-site registry and consolidation doc exist | Update actual Carrd sites/assets/links; verify no duplicate operational surfaces outside app |

## Highest-priority completion sequence

1. **Call Center intelligence** — wire dispositions + scripts + next actions + callbacks + automations.
2. **Resources consolidation** — expose Scripts, Forms, Checklists, Manuals/SOPs and Rules from one searchable resource system with contextual shortcuts.
3. **Documents v2** — templates, generated documents, editing/versioning; then scanning/OCR; then e-signing.
4. **Integrations & Connections** — central Settings hub and provider-neutral connection registry/health model.
5. **Work-context wiring** — Leads/Estimates/Jobs/Calendar/Follow-Ups consume forms, checklists, scripts, documents and connection actions.
6. **Community Campaigns + Growth** — real campaign route/builder, offers, idea calendar and analytics.
7. **Finance** — business operating ledger distinct from HLC subscription billing.
8. **AI/context automation** — Kendrell/Dion/Diamond recommendations/actions across the new connected domains.
9. **Network/Community depth** — replace LaunchSurface placeholders with full production experiences where still shallow.
10. **Full verification** — lint, acceptance, build, security/RLS, role matrix, mobile/desktop, direct routes, integration health, rendered QA.

## Completion rule

No item may be called complete merely because a document, route placeholder, registry or mock UI exists. A capability moves to **WIRED** only when the relevant user can complete the meaningful task in HLC with real state/actions and correct permissions. It moves to final completion only after automated and human verification pass.
