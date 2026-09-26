# HomeLead Connect — Cross-System Reconciliation Authority

Status: ACTIVE BUILD AUTHORITY  
Phase: system reconciliation + implementation architecture  
Release rule: PR #479 remains draft until one exact candidate completes required certification and receives owner production approval.

## 1. Canonical E2E lifecycle
Certify the connected business chain, not isolated features:

**Intake → Identity → CRM record → Workspace/portal context → Assignment → Automation → Communication → Appointment/job → Documents/agreements → Billing/entitlement → Audit → Retention/export**

Every applicable major object must be traceable through this chain.

## 2. Control Matrix is the implementation ledger
Portal/Profile access feeds the HCX Control Matrix rather than becoming a parallel authority. For every meaningful route/page/record/action resolve:

**owner → actor → viewer → editor → approver → workspace → organization → role → capability → record relationship/state → entitlement → billing consequence → consent/agreement → retention → export/download → AI eligibility → automation eligibility → advertising eligibility → legal status → audit event → source of truth → downgrade/cancellation behavior**

## 3. Authentication is not authorization
Being signed in is insufficient. Protected actions resolve identity + workspace + organization + role + resource + action + entitlement + required approval, subject to higher controlled policy.

Personalization effective-value hierarchy remains:
**HCX system rule → organization rule → role permission → entitlement/capability → contextual scope → individual preference.**

Personal preference never manufactures authority.

## 4. Phone/email is release-critical
Test end to end:
**input → normalization → validation → canonical contact identity → duplicate handling → consent/preferences → call/email/SMS action → delivery/failure → inbound association → CRM thread/timeline → request/lead/job association → assignment → notification → opt-out/suppression → audit → mobile interaction**

Cover multiple endpoints, changed endpoints, shared endpoints, failed messages and preference changes. Users must know which endpoint HomeLead Connect is using and where history lives.

## 5. Communication identity resolution
Resolve authorized communications through:
**endpoint → person/contact → organization/workspace → request/lead/opportunity/job → conversation/thread → responsible team/user.**

Ambiguous matches must surface for safe resolution rather than silently attaching to the wrong identity.

## 6. Offline conflict semantics
Cover:
**online → interruption → local draft → app close → reopen offline → edit → reconnect → concurrent server change → reconciliation → visible outcome.**

Define local/server boundaries, draft ownership, stale detection, conflict behavior, duplicate-submit protection, queue state, retry, expiration, sensitive on-device handling and logout/account-switch cleanup.

Failure doctrine:
**Detect → Log → Preserve State → Retry → Fallback → Escalate.**

## 7. Controlled state machines
Consequential objects use defined states/transitions, including requests/leads, professional applications, appointments, jobs, contracts, documents, invoice/payment-related records, membership/subscription, invitations, organization membership, communication consent and exports.

Material transitions record previous/new state, actor, authority, timestamp, reason, source, related automation and audit event.

## 8. Permanent document history
Lifecycle where applicable:
**draft → generated → presented → accepted/signed → executed → superseded → retained.**

Executed/legal/financial evidence does not silently mutate. Preserve exact version, applicable terms/pricing version, signer/actor, acceptance/signature evidence, timestamps, attachments, amendments, supersession and governed export/download rights. Appropriate completed-record access survives subscription termination where required by authority.

## 9. Entitlement snapshots
At acceptance/purchase/signature, preserve applicable plan, price, included capabilities, add-ons, terms/version and effective date. Future catalog changes do not rewrite historical transactions.

Define downgrade/cancellation per capability: stop, read-only, downloadable, retained and automation-cessation behavior.

## 10. AI technical authority
Kendrell = Executive Command/HQ; Dion = Operations & BI; Diamond = Customer Experience & Community. Ken OS is orchestration/platform infrastructure, not a fourth persona or alternate Kendrell identity.

AI access/action is bounded by underlying identity/workspace/organization/resource authority. Handoffs never escalate permission.

## 11. Universal Attention Center
Use one identity + multiple workspaces + unified attention + contextual workspaces. Aggregate permitted tasks, messages, approvals, exceptions, appointments, document actions, automation failures, AI recommendations and important notifications. Opening an item restores the correct workspace and authority context.

## 12. Permission-aware retrieval
Search results, previews, counts, suggestions, recents, deep links and AI retrieval use the same authorization resolver. Do not leak restricted record existence through metadata or counts.

## 13. Invisible-surface coverage
Inventory/test empty/loading/error states, modals, drawers, menus/context menus, notifications, toasts, deep links, invitations, email/SMS links, downloads/exports/print/share views, password reset, expired links, 403/404/500, offline states and mobile-only controls.

## 14. Personalization metadata
Every setting records scope (device/account/portal/workspace/organization/project/system) and control class (personal preference/personal operating/personal privacy/controlled rule), plus authority ownership/effective source where applicable.

## 15. Accessibility during implementation
Component acceptance includes keyboard/focus, semantics/naming, error association, reduced motion, contrast, touch targets, zoom/text scaling, mobile keyboard behavior and non-color-only status communication. Final audit verifies rather than discovers systemic accessibility architecture.

## 16. Mobile workflow parity
Mobile success means the job can be completed comfortably, not merely that desktop controls fit at 390px. Preserve Mobile A+ priorities and final physical-iPhone QA.

## 17. Emergency/failure behavior
Security/data-integrity failures, critical emergency-response failures and core HomeLead workflow regressions are release blockers. Emergency resources are configurable rather than hard-coded where established authority requires. Failure handling preserves state and recovery.

## 18. Cross-system contradiction audit
Before final candidate deliberately test contradictions such as:
- UI permits action while backend/RLS denies it.
- Setting enabled while entitlement forbids it.
- Cancelled plan retains active automation.
- Removed team member remains assigned.
- Offline draft references archived/inaccessible record.
- AI/persona crosses responsibility or authority boundary.
- Search reveals a record the active context cannot discover.
- Communication attaches to the wrong identity.
- Executed contract displays current rather than accepted pricing/terms.
- Desktop can complete a governed workflow that mobile cannot.

These are release-reconciliation failures even when individual components pass.

## Current build statement
HomeLead Connect is in **system reconciliation + implementation architecture**. Governing architecture, access hierarchy, personalization, communications/contact identity foundation, offline-state foundation, route/control coverage, AI governance, visual system, entitlement/records governance and release safeguards are established.

Current implementation closes the remaining gaps: Portal/Profile/Control matrices; role/permission/entitlement enforcement; phone/email communications end to end; real offline draft/recovery/conflict behavior; controlled lifecycle/document/pricing-history semantics; route/control/state reconciliation; and naming, permission, visual, mobile, accessibility and integration inconsistencies.

Passing CI on an intermediate head means that head is healthy enough to continue. It does **not** mean HomeLead Connect is complete, owner-approved or production-ready.

Final certification requires one exact candidate to pass functional E2E, cross-system reconciliation, authorization/RLS, communications, lifecycle/document integrity, offline/recovery, AI authority, desktop/mobile, physical-iPhone, accessibility, visual, security and data-integrity gates, followed by the established production verification and exact-candidate owner approval.
