# HCX Connected Core E2E — Sprint 01

**Milestone:** Connected Core E2E  
**Repository:** `homeleadconnectllc/HomeLeadConnect-Web`  
**Branch:** `sprint/hcx-reconciliation-01-20260921`  
**PR:** #479  
**Observed pre-sprint head:** `cb9e467f51b32a3e0a0c9eab321744560b76670b`  
**Base:** `c3fcecbaafefdf8285cc5170e3c9eb133f55912b`  
**Production Supabase:** `cguhtshclyybivvdnpig`  
**Reconciliation Supabase:** `agfwqnirspmptjiqrrtk`  
**Milestone state:** **NOT YET CERTIFIED**

## Sprint objective

Convert the owner-approved Connected Core blueprint into a live execution ledger grounded in current repository and Supabase evidence, then lock the rule that setup percentage, route existence, screenshots, trigger firing, notifications, sounds, or provider acceptance cannot substitute for end-to-end persisted proof.

## Current evidence snapshot

The pre-sprint exact head completed all five required GitHub certification workflows successfully. Production and reconciliation Supabase projects are both healthy. Inspected public tables in both projects report RLS enabled. Production contains active CRM, appointment, communication, notification, automation, portal, document, billing and audit records. The reconciliation project contains the staged ambiguity-safe communication subject resolver migration `20260921232736`; production does not yet list that migration.

## Workstream disposition

| Epic | Area | Current disposition | Why it is not milestone PASS yet |
| --- | --- | --- | --- |
| CC-01 | Canonical Identity + Contact | PARTIAL | Frontend normalization/fail-closed ambiguity exists, but a persistent canonical person/contact-point authority and production-safe reconciliation are not yet proven. |
| CC-02 | CRM lifecycle | PARTIAL | Strong transactional CRM pieces exist; the entire request→person→lead→appointment→estimate→job→follow-up chain is not yet certified as one authoritative graph. |
| CC-03 | Communications | PARTIAL | Queue/compliance/providers/manual history exist; production identity ambiguity and full provider truth-state failure tests remain. |
| CC-04 | Scheduling | VERIFY | Canonical appointment/reschedule foundations exist; race, reminder invalidation and calendar failure recovery need controlled proof. |
| CC-05 | Workflow/Automation | PARTIAL | Registry/runtime/hardening exist; execution contract, duplicate trigger, partial failure, retry exhaustion and quiet/business-hour proof remain. |
| CC-06 | Notifications + Sound | PARTIAL | Notifications are persisted/downstream; sound runtime/control/replay behavior is not yet demonstrated. |
| CC-07 | Permissions + RLS | VERIFY | RLS/privilege hardening is extensive; final deny/allow certification depends on canonical identity and controlled cross-tenant tests. |
| CC-08 | Failure + Recovery | PARTIAL | Idempotency/draft/failure primitives exist; systematic fault injection and terminal escalation proof remain. |
| CC-09 | Mobile Connected Core | VERIFY | Mobile A+ structural/accessibility evidence is strong; core operational journeys still need 390px E2E evidence. |
| CC-10 | Certification | VERIFY | Five gates were green on the pre-sprint head; milestone PASS is impossible until CC-01..09 pass and the post-sprint SHA is recertified. |

## Hard blockers discovered

1. **Canonical person/contact persistence is not yet demonstrated as the production identity root.**
2. **Production communication subject resolution remains older than the staged ambiguity-safe resolver in reconciliation.**
3. **Full controlled RLS deny/allow evidence must be rerun after identity authority is settled.**
4. **Automation runtime needs one certification contract spanning trigger → permission → action → persisted result → retry/failure → audit.**
5. **Sound must be inventoried and implemented only as presentation feedback, never as workflow state.**

## Safe work completed in this sprint

- Established one machine-readable CC-01..CC-10 ledger.
- Bound the ledger to exact repository/branch/PR/Supabase authorities.
- Preserved production as read-only.
- Distinguished production evidence from reconciliation-only migration evidence.
- Added a contract that forbids milestone PASS while hard blockers remain.

## Next execution order

1. CC-01 additive canonical person/contact design + reconciliation rehearsal.
2. CC-02 authoritative relationship map and request→job rehearsal.
3. CC-07 controlled allow/deny matrix in reconciliation.
4. CC-03 provider-state and ambiguity-safe communication E2E.
5. CC-04 scheduling race/reschedule/calendar failure tests.
6. CC-05 automation execution/failure/idempotency contract.
7. CC-06 notification/sound inventory and dedupe controls.
8. CC-08 fault injection/recovery.
9. CC-09 390px operational journey parity.
10. CC-10 exact-head certification package.

## Release guard

No production merge, production Supabase migration, destructive data reconciliation, DNS/Cloudflare production mutation, billing change, or permission expansion is authorized by this sprint. Final production promotion remains an owner decision.
