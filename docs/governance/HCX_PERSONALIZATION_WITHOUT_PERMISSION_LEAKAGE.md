# HomeLead Connect — Personalization Without Permission Leakage

Status: LOCKED — active build authority  
Scope: Global — every portal, page, workspace, dashboard, record surface, workflow, CRM surface, report, automation, AI feature, and settings surface.  
Architecture: Cross-cutting platform rule, not a standalone feature.  
Public name: HomeLead Connect. HCX is internal shorthand only.

## Governing rule

Every configurable behavior resolves through:

**HCX system rule → organization rule → role permission → entitlement/capability → contextual scope → individual preference**

A lower layer may personalize behavior only inside every higher layer.

Personalization must never grant permissions, bypass role or entitlement restrictions, weaken security/MFA, override organization policy or legal obligations, alter billing/signing/approval authority, modify immutable executed records, suppress required disclosures, rewrite audit/history, defeat retention, expose inaccessible information, or let AI perform an action the user cannot perform directly.

Higher authority wins. Locked/unavailable controls explain the controlling authority instead of failing silently.

## Control classes

- **Personal Preference:** presentation/convenience such as layout, density, default portal, calendar view, favorites, shortcuts, dashboard arrangement, saved views.
- **Personal Operating Setting:** permitted individual operating behavior such as reminders, quiet hours, preferred permitted channel, filters, notifications, task display, workflow convenience.
- **Personal Privacy Choice:** optional consent/use/visibility where platform, organization policy and law permit individual control.
- **Controlled Rule:** non-overridable security, MFA, role, billing, legal, immutability, retention, approval, compliance and integrity requirements.

## Explicit preference scope

Every configurable feature declares one scope: Device only; Personal account; Current portal; Current organization; Current project/workspace; System controlled.

Ambiguous global preference storage is prohibited. A Professional-workspace display preference does not alter Resident unless explicitly Personal Account scoped.

## Ownership indicator

Relevant controls expose: **Personal**, **Organization**, or **HCX Managed**. Organization/HCX locks explain why the setting is unavailable.

## My HCX

Reserve the personal control center with: My Preferences; My Notifications; My Privacy; My Shortcuts; My Saved Views; My AI; My Accessibility; My Devices; My Activity; My Downloads.

My HCX is not the home for organization administration, billing administration, security administration, team permissions, workflow governance, or unrelated configuration.

## AI authority

Permitted personal AI preferences include suggestions only, draft for me, proactive organization, reminders, activity summaries, and hiding optional AI suggestions. These are assistance preferences, not authorization.

Before execution AI resolves current identity + active portal + active organization/workspace + role/capability + entitlement + record permissions + workflow requirements + applicable policy.

AI cannot perform an action the user cannot perform manually and cannot bypass required approval. Auditable AI-assisted actions enter the appropriate event/audit history.

## Common effective-setting resolution

Pages do not implement independent preference precedence. They consume a common effective-setting result:

System constraints → Organization constraints → Role/capability → Entitlement → Portal/workspace/record context → Personal setting → Effective behavior.

## Required setting metadata

Meaningful configurable settings must be capable of declaring: setting key; control class; owner/authority; scope type/id; user id; organization id; portal/workspace context; effective value; effective-value source; editable state; lock reason; entitlement dependency; permission dependency; created/updated timestamps; audit requirement; version where appropriate.

Do not duplicate the same preference into unrelated records to make individual pages work.

## Integration scope

Apply to CRM, contacts, leads, opportunities, customers/residents, professionals, partners, organizations, teams, assignments, calendars, communications, phone, SMS, email, inboxes, reports, dashboards, saved views, search, filters, workflows, automations, triggers, notifications, documents, contracts, signatures, downloads/exports, billing, analytics, AI, mobile, accessibility and devices/sessions.

Reconcile existing valid architecture; do not blindly replace it.

## Communications guardrail

Personal preferences may influence preferred permitted channel, notification presentation, reminders, permitted quiet hours and personal inbox/view behavior.

They cannot override consent, opt-outs, legal communication requirements, organization communication policy, ownership/assignment, authorized sender identity, retention, audit or role restrictions. Contact/customer association and history remain correct regardless of UI preference.

## Workflow and automation guardrail

Before execution resolve actor/context → organization → role/capability → entitlement → record access → required consent → workflow state → controlled rules.

A preference cannot convert an unauthorized action into an authorized automation. Traceable events record actor/context, timestamps, result/status and source.

## Search/navigation guardrail

Personalization may reorder, favorite, save, hide optional shortcuts or select defaults only after access eligibility is resolved. Universal Search, navigation, commands, saved views, favorites, recent items and AI recommendations remain permission-aware.

## Required reusable UI states

Normal personal; Organization controlled; HCX Managed; permission restricted; entitlement restricted; unavailable in current portal; unavailable in current workspace; inherited/default; locally overridden; confirmation required; consent required; effective value differs from preference due to higher authority.

No dead controls. Communicate effective state and controlling authority.

## Control Matrix fields

Where configuration exists add: Personalizable?; Control Class; Setting Owner; Preference Scope; System Constraint; Organization Constraint; Role/Permission Dependency; Entitlement Dependency; Effective-Value Source; AI Applicable?; Automation Applicable?; Audit Required?

These extend existing ownership, visibility, action authority, storage, export, consent, billing, advertising, automation, legal and lifecycle controls.

## Migration/reconciliation

Inspect existing settings, preferences, profiles, organization configuration, notifications, portal state, saved views, AI settings, role/permission logic, entitlement logic, workflows and CRM configuration. Classify into this model, preserve correct behavior, and repair ambiguous scope, permission leakage, duplicated ownership, inconsistent settings or missing enforcement.

Older HomeLead Connect CRM/SaaS and automation work is reconciliation evidence. Current locked authority wins on conflict.

## Acceptance criteria

Completion requires explicit authority/scope; no permission or entitlement expansion through preferences; organization precedence; HCX precedence where applicable; correct portal/workspace scope; effective AI authority; automation permission/consent/entitlement/workflow enforcement; permission-aware search/navigation; communication compliance; immutable controlled records; desktop/mobile consistency; auditability; preservation of valid behavior; intentional setting homes; explanatory lock states; and My HCX remaining personal rather than an admin settings dump.

## Build directive

Implement this as a global architecture layer during the current build, not a future enhancement. Reconcile safe conflicts in place, record material architectural conflicts, and continue the broader E2E build.

Production safeguards are unchanged: branch implementation may proceed under owner authorization; production promotion requires exact-candidate verification and owner approval.
