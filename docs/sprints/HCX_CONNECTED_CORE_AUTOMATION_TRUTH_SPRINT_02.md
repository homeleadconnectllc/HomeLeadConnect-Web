# HCX Connected Core — Automation Truth Sprint 02

**Date:** 2026-09-23  
**Starting authority:** `a079941ffcb72ccefd221917927f9ddf850cfe87`  
**Branch:** `sprint/hcx-automation-truth-20260923`  
**Production:** protected and unchanged  
**Rehearsal database:** `HOMELEAD CONNECT HCX` (`lvpouzxqojgmmmzbnnwv`)  
**Milestone state:** **PARTIAL — automation execution truth slice complete; Connected Core not yet certified**

## Milestone map

This sprint owns the execution boundary beneath the existing Automations management page:

`authorized trigger → canonical job → attempt → result/failure → bounded retry → exhaustion → audit`

It does not turn notifications, sounds, UI messages, or trigger receipt into proof of completion. It does not deploy provider-backed Edge Functions or mutate production.

| Layer | Finding | Disposition |
| --- | --- | --- |
| Trigger | `run_hlc_automation` accepts a caller idempotency key. | Preserved and strengthened. |
| Permission | RPC was owner/manager guarded, but legacy broad-member SELECT policies still coexisted. | Replaced by one owner/manager history policy. |
| Job | Existing job row recorded only summary state. | Preserved as canonical job. |
| Attempt | No durable per-attempt evidence existed. | Added `automation_job_attempts`. |
| Failure | The exception handler re-raised after updating the job; PostgreSQL rolled back the job and failure update together. | Repaired with a nested execution boundary that catches and persists failure truth. |
| Retry | No product retry RPC or retry UI existed. | Added bounded canonical-job retry and visible `retry_wait`. |
| Exhaustion | No controlled proof existed. | Rehearsed three failed attempts and one terminal exhaustion event. |
| Duplicate trigger | Existing key reuse returned a row, but had no attempt-level proof. | Verified one job and one attempt after duplicate invocation. |
| Audit | Success was logged; failed attempt and exhaustion events were absent. | Added separate failure and exhaustion activity events. |
| Presentation | UI described execution truth but could not show attempts or retry. | Added attempt history and a focused Retry safely action. |

## Non-production rehearsal evidence

The migration `20260923065504_harden_automation_execution_truth.sql` was applied only to the consolidation project.

The controlled transaction proved:

- one successful job produced one successful attempt;
- replaying the same idempotency key returned `duplicate=true` and did not create another attempt;
- a forced internal execution failure produced two `retry_wait` results followed by terminal `failed` on attempt three;
- three durable attempt rows remained visible inside the rehearsal transaction;
- audit evidence contained two `automation.attempt_failed` events and one `automation.retry_exhausted` event;
- changing the fixture role to technician hid all automation history and denied invocation;
- the transaction rolled back, leaving zero fixture users, jobs, or attempts.

## Boundaries intentionally preserved

- The current automations are read-only operational scans. No customer message, appointment, assignment, billing state, lead state, or job state is changed.
- Notification delivery remains downstream presentation/routing and is not completion evidence.
- Sound remains optional presentation feedback and is not backend state.
- Quiet hours and business hours were not invented at this layer because these scans do not contact people. Those policies belong at the communication action boundary.
- Automatic background pickup of `retry_wait` remains disabled until worker ownership, cadence, kill control, and escalation policy are explicitly certified.
- Production schema, data, Edge Functions, secrets, and provider configuration remain unchanged.

## Next Connected Core slice

Bind one communication follow-up workflow end to end:

`canonical contact → action-time consent/suppression → quiet/business-hour decision → transmission → provider callback → CRM history → notification → retry/exhaustion → audit`

The next slice must reuse the communication queue and provider evidence already present. It must not create a second messenger, contact model, workflow engine, or notification state machine.
