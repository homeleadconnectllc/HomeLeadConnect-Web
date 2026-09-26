# HomeLead Connect — Legacy CRM / SaaS / Automation Reconciliation

Status: REQUIRED — ACTIVE BUILD  
Rule: historical capability is loss-detection evidence; current HomeLead Connect authority wins every conflict.

Reconcile older CRM/SaaS, Lead Vacuum, Base44, Supabase, automation, OAuth, voice/AI, appointment, communications and prior app-migration work against current architecture. Do not restore historical architecture wholesale or create parallel systems to preserve old names.

## Required historical disposition

Every historical capability receives exactly one current disposition:

- implemented/current
- implemented-but-disconnected
- superseded
- duplicated
- partially implemented
- planned-only
- missing-but-still-required

Historical chat claims are not proof. Verify repository code, schema/database objects, deployed runtime, routes, functions and actual E2E behavior before marking complete.

## Required E2E reconciliation

Verify:
- Contact identity/deduplication across name, phone and email.
- Resident/service request → lead/contact → professional/provider → appointment/job → completion/history.
- Calls, SMS/text, email, voicemail/voice, communication history and preferences.
- Scheduling, reminders, rescheduling, cancellation, outcomes and follow-up.
- Pipelines, stages/status, ownership/assignment, notes, tasks and activity.
- Every automation/trigger/condition/scheduled job/webhook/notification: trigger, action, failure, retry/idempotency and audit—not merely configuration presence.
- Every dashboard card, button, menu, setting, toggle, filter and option: real destination/behavior and permission-aware state; no decorative controls.
- Kendrell, Dion and Diamond responsibilities against one universal launcher/one active panel; remove overlapping legacy assistant behavior.
- OAuth/integrations and Supabase tenancy/RLS against current authentication/permission architecture.
- Base44/prototype capability against authoritative implementation; prototypes are evidence, not source of truth.
- Lead Vacuum capability against current LeadScope/CRM so useful behavior is neither duplicated nor lost.
- Subscription/SaaS behavior against current entitlement, central pricing catalog, billing, downgrade/cancellation and records governance.
- Mobile communication behavior, especially tap-to-call, phone normalization, SMS, email, contact linking and activity capture.

## Legacy Capability Reconciliation Matrix

Maintain rows with:

**historical capability → historical source/name → current HomeLead Connect home → current implementation → data source → trigger/action → permission/entitlement → status → gap/fix → verification evidence**

The current Control Matrix describes the governed target. This reconciliation matrix detects useful historical capability that might otherwise disappear during consolidation.

## Execution

Consolidate surviving capability into current systems of record and the current Control Matrix. Do not stop the E2E build for routine discrepancies: repair/reconcile within authority, record evidence and continue. Escalate only genuine owner/legal/business decisions or exact-candidate production promotion.
