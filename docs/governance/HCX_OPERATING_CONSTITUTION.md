# HomeLead Connect — Operating Constitution

Status: LOCKED BUILD AUTHORITY  
Purpose: keep the user experience simple by placing complexity beneath governed interfaces rather than omitting it.

## Universal action chain

Every meaningful capability resolves:

**Identity → workspace/portal context → role → permission → entitlement → record state → consent/legal rule → action → automation → notification → audit → reporting**

Personalization additionally obeys:

**HCX system rule → organization rule → role permission → entitlement/capability → contextual scope → individual preference**

Authorization is server-enforced, deny-by-default and least-privilege. Hiding a client control is UX, not authorization.

## Product-layer separation

Pages are views, not systems of record. Dashboards summarize; search retrieves; AI assists/interprets; reports aggregate; notifications deliver attention. Authoritative customer, lead, job, contract, payment, permission, consent and communication state belongs to governed records/services.

Use progressive disclosure:

**Customer experience → operational detail → administrative controls → technical/system diagnostics**

Ordinary users see the goal, current state, next action and required attention—not provider IDs, policy internals, retries, RLS details, queue internals or raw diagnostic payloads.

## Identity and tenancy

One identity may participate in multiple legitimate roles/workspaces. Prefer memberships/relationships over duplicate people.

Tenant/organization context is server verified and propagated through APIs, background jobs, queues, caches, files and integrations. Client-supplied tenant identifiers are selectors, never authorization proof.

Every governed record declares authoritative ID, organization/workspace scope, record type, owner/responsible party, lifecycle state, source/provenance, visibility and timestamps.

## Central authority decisions

Do not distribute page-local admin checks. Server/business boundaries resolve actionable outcomes such as:

ALLOW; DENY; VERIFY; CONSENT_REQUIRED; APPROVAL_REQUIRED; LIMIT_REACHED; ACCOUNT_RESTRICTED; LEGAL_RESTRICTION; LOCKED; UNAVAILABLE.

Business authorization is contextual: actor + object + state + current scope.

## Lifecycles and evidence

Important objects use controlled state machines with allowed actor, prerequisite, transition, resulting actions, automation, notifications, timestamp, reason where needed, reversibility and audit.

Accepted estimates, executed agreements, payment records, consent evidence, verification decisions and similar consequential records are immutable/versioned evidence. Corrections supersede; they do not silently rewrite history.

Audit is distinct from activity. Audit captures actor/type, verified organization/workspace, object, relevant previous/new state, timestamp, result, provenance/correlation and authority context without indiscriminately logging sensitive content.

## Automation and notifications

Automation is infrastructure:

**event → policy → trigger → conditions → action → result → audit → retry/escalation**

Each automation has owner, eligibility, idempotency protection, failure/retry behavior, escalation and disable/kill control.

Notifications are delivery of attention, not the workflow itself.

## Settings jurisdiction

Personal controls → My HCX.  
Organization policy → organization administration.  
Portal/workspace operations → relevant workspace.  
Security/access → access administration.  
Billing → billing.  
Integration credentials → integrations.  
Technical/system controls → restricted administration.

Use Personal / Organization / HCX Managed ownership. Contextual shortcuts link to canonical settings rather than creating duplicate sources of truth.

## Communications platform service

Phone, SMS, email and in-platform messaging share governed contact identities and communication history.

Communication evidence resolves sender/initiator → recipient → contact identity → channel → related governed record → purpose → human/system/AI provenance → consent/eligibility basis → sent time → delivery state → response/disposition.

Channel eligibility/consent is distinct from the canonical phone/email identity.

Opt-out/revocation is machinery: inbound opt-out → classify → update consent evidence → stop affected automation → cancel prohibited queued messages → preserve evidence → permitted confirmation where applicable → audit.

Commercial/marketing email and transactional/relationship communication remain distinguishable. Telemarketing eligibility is policy-driven rather than a clock attached only to the dialer.

## CRM spine

Do not create a parallel old-style CRM universe. Govern relationships through a coherent spine:

**Person/Company → Contact → Request → Lead → qualification → matching/assignment → Estimate → acceptance → Appointment → Job → completion → follow-up**

Communications, tasks, notes, documents, consent, agreements, verification, payments, activity, audit, automation and reporting attach to that spine.

One entity may have multiple governed relationships without duplicate identities or competing contact truth.

## Dashboards

Dashboards answer: What needs attention? What changed? What should I do next? Where do I do it?

Actual work belongs in workspaces/records; analysis in reports; configuration in settings; governance in admin; retrieval in search; assistance in AI.

## AI

AI progression: **Read → summarize → recommend → draft → prepare → execute**, with progressively stricter authority.

AI uses the user's effective authority and cannot bypass permission, entitlement, consent, record state, approval or organization policy. Provenance distinguishes human, automation, AI suggested, AI drafted, AI executed with human confirmation and system actions.

## Search and export

Search authorizes before returning results. Never retrieve unauthorized resources and hide them afterward.

Export/download/API extraction is a separate permissioned action with defined contents, organization scope, entitlement, retention and audit. View permission does not imply export permission.

## Exit lifecycle

Downgrade, cancellation, suspension and closure explicitly define read-only behavior, downloads, automation shutdown, retained legal records, eventual deletion and retention obligations. Cancellation is not synonymous with destruction.

## Capability readiness matrix

Every capability must answer: Purpose; User; Home; Record; Source of truth; Permission; Organization scope; State; Action; Entitlement; Consent/legal; Trigger; Automation; Failure; Notification; AI; Audit; Export; Retention; Exit; Reporting.

If two surfaces answer these differently for the same capability, treat it as an architectural conflict to reconcile.

## Pennsylvania home-improvement architecture

Pennsylvania contractor registration is structured credential data, not profile prose: registration number, jurisdiction, verification source/date, effective/status evidence and downstream eligibility.

Contracts support governed draft/review/presented/executed lifecycle, preserved executed artifacts/signature evidence, and applicable cancellation/rescission handling. Exact legal requirements and edge cases remain subject to owner/counsel validation before production policy is locked.

Security/breach response is centralized platform machinery, not page-local behavior.

## Build rule

Do not add a visible surface merely because a capability exists. First resolve its authoritative record, owner, permission boundary, lifecycle, entitlement, trigger, automation, failure path, communications, notification, audit, reporting and administrative home. Expose the smallest interaction necessary for the user's goal.

No duplicate source of truth, duplicate control, duplicate notification system, fake control, orphan automation or page-local business rule.

Do not delete mature capability because its old presentation is obsolete. Preserve the capability, determine its canonical HomeLead Connect home, modernize its architecture, verify it, then retire obsolete presentation.
