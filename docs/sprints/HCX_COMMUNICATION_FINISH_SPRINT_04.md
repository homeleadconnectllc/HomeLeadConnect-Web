# HCX Connected Core — Communication Finish Sprint 04

**Date:** 2026-09-23  
**Starting exact authority:** `bb77cca804ae04684335c170540131f24ff83095`  
**Production:** unchanged  
**Non-production Supabase:** `lvpouzxqojgmmmzbnnwv`  
**Release decision:** pending live provider and physical-device evidence, then owner exact-SHA approval

## Narrow scope and results

| Proof | Result | Evidence and boundary |
| --- | --- | --- |
| Out-of-order callbacks | **PASS in non-production SQL rehearsal** | Delivered then failed kept delivery; failed then delivered cleared the retry. Callback replay returned duplicate; the first case left one delivery CRM event. Callback state is correlated to the specific accepted provider attempt. |
| Due retry and lost-response timeout | **PARTIAL** | A due retry was selected; a five-minute-or-older unknown provider response was quarantined to review instead of re-sent. A synthetic cron invocation queued exactly one fake endpoint request inside a rolled-back transaction. The live Edge worker has not been deployed or invoked, and the scheduler is disabled without explicit endpoint/token configuration. |
| Ambiguous inbound identity | **PASS in non-production SQL and source contract** | Two leads sharing one normalized phone returned ambiguous with no subject ID. Unique email returned its lead and unknown endpoint returned null. Twilio inbound now preserves unmatched source/message in the canonical provider event; STOP suppression is applied to the endpoint before identity resolution. Physical inbound webhook remains unproven. |
| Live provider delivery | **NOT PROVEN** | Clean consolidation project has zero Edge Functions and no provider-backed test send. Gmail search found no relevant Resend/Twilio/Bolt or Google Voice delivery evidence. A Gmail mailbox message cannot certify a provider callback. |
| Google Voice | **MANUAL PATH VERIFIED IN SOURCE; DEVICE PROOF PENDING** | Workspace manager can enable the manual number. The flow checks outbound policy, opens Google Voice, prompts for operator outcome on return, and records `manually_logged`/`operator_reported`. It makes no provider delivery claim. No Google Voice connector or physical device is available to the build agent. |
| Legacy sentinel policy | **DEFERRED** | No change to historical `interaction_logs` policy in this bounded communication sprint. |

## Implemented

- `20260923151034_communication_runtime_finish_truth.sql` stages server-only due retry listing, stale-send quarantine, an inert-by-default minute pickup schedule, provider-reference correlation and callback precedence, and protected unmatched inbound provider-event fields.
- `send-communication` accepts a high-entropy internal worker token only for a due transmission, then uses the existing locked action-time dispatch path. No provider attempt begins if its adapter is unconfigured.
- Twilio inbound records opt-out regardless of shared contact identity, and keeps unmatched content as provider evidence without attaching an arbitrary lead or contractor. Resolver and inbound persistence errors now return an error rather than acknowledging the webhook.
- The controlled SQL proof file is reproducible and rolls back its synthetic users, workspace, contacts, transmissions, events, config and fake HTTP request. It never contacts a provider.

## Verification

- Controlled post-migration SQL proof: PASS, with `finish-proof-pass` marker; fixture counts returned zero after rollback.
- Non-production ACL: authenticated cannot invoke retry pickup; service role can. Retry configuration has zero rows, so the scheduled function is inert.
- Local lint, build, 127-route inventory, 4 whole-system, 2 workspace-reconciliation, 5 automation, 5 communication truth, 4 finish, 15 visual and 616 acceptance checks: PASS.
- The Google Voice manual path is a source and contract proof only. Physical iPhone return, SMS/call handoff and provider delivery need owner-controlled evidence.

## Bolt and Gmail

Historical use of Bolt is not a current communication-provider connection. No Bolt code or branch was found in this repository, and the connected HomeLead Connect Gmail search did not show a Bolt/StackBlitz provider receipt. The old builder does not change the current Resend/Twilio/Google Voice state without a specific repository, workspace, or service configuration to reconcile.

## Promotion boundary

The new migration is staged and applied only to the clean non-production Supabase project. The worker schedule has no endpoint/token configuration and sends nothing. Production code, database, providers and domains remain unchanged. Do not claim live provider or iPhone certification from this rehearsal.
