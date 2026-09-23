# HCX Connected Core — Communication Truth Sprint 03

**Date:** 2026-09-23  
**Starting authority:** `5ccb1d415e87c530a3947a3914c3a0bb6ee81c0f`  
**Branch:** `sprint/hcx-communication-truth-20260923`  
**Production:** protected and unchanged  
**Rehearsal database:** `HOMELEAD CONNECT HCX` (`lvpouzxqojgmmmzbnnwv`)  
**Milestone state:** **PARTIAL — communication action-time/provider truth slice complete; Connected Core not yet certified**

## Milestone map

`canonical contact → consent/suppression → quiet/business-hour decision → delivery attempt → provider result/callback → CRM evidence → terminal notification → retry/exhaustion`

| Layer | Finding | Disposition |
| --- | --- | --- |
| Queue | Provider-neutral queue and idempotency already existed. | Preserved. Queue state remains intent, not delivery. |
| Action-time policy | Consent/suppression was checked while queueing, but no persisted organization business/quiet-hours authority existed. | Added server-enforced workspace policy and a policy snapshot on every compliance check. |
| Consent | SMS consent was enforced; marketing email consent was not explicit. | Added action-time marketing-email consent proof. |
| Attempt | Transmission had an integer count but no durable per-attempt evidence. | Added `communication_delivery_attempts` with immutable attempt numbers and result evidence. |
| Provider request | Edge Function directly changed summary transmission state. | Routed dispatch through server-only begin/complete attempt RPCs. |
| Callback | Webhooks updated transmissions directly. | Routed signed provider outcomes through one idempotent canonical RPC. |
| Retry | Provider failure became terminal immediately. | Added bounded three-attempt retry with exponential wait and explicit exhaustion. |
| CRM | Manual activity reached lead history; provider outcomes did not consistently do so. | Added provider delivered/failed lead activity evidence. |
| Notification | No terminal provider-exhaustion alert existed. | Added one deduplicated owner/manager notification only after authoritative exhaustion. |
| Presentation | Manual communication UI did not distinguish REVIEW from BLOCK. | Added accurate review wording and organization policy controls in workspace settings. |

## Controlled rehearsal evidence

The migration `20260923134940_harden_communication_action_time_truth.sql` was syntax-tested in a rolled-back transaction, then applied only to the consolidation project.

The controlled fixture transaction proved:

- ordinary service email inside business hours returned `ALLOW`;
- an active quiet-hours window returned `BLOCK` with `quiet_hours_active`;
- three simulated provider failures produced two `retry_wait` attempts and one terminal `exhausted` attempt;
- four attempt rows existed across the failure and success journeys: two retry waits, one exhaustion, one delivered;
- exactly one terminal notification was produced for exhaustion;
- provider acceptance produced `sent`, while only the later callback produced `delivered`;
- replaying the same callback returned `duplicate` and created no duplicate CRM evidence;
- provider outcome and terminal failure produced separate CRM activity evidence;
- the fixture transaction rolled back, leaving zero users, workspaces, policies, transmissions, attempts, or provider events.

## Security and authority

- Policy rows and attempt evidence have RLS enabled.
- Workspace members may read organization policy; only owner/manager may change it through the governed RPC.
- Attempt history is owner/manager-readable.
- Begin, completion, and provider-outcome mutation RPCs are executable only by the server role.
- Provider secrets remain server-side.
- Production database, data, Auth, Storage, functions, provider credentials, and deployment remain unchanged.

## Truth boundaries

- A queued transmission is not a delivery.
- A provider request acceptance is `sent`, not `delivered`.
- Only provider callback evidence may mark provider-backed communication delivered.
- A notification reports terminal failure; it does not cause or complete the workflow.
- Sound remains presentation feedback and is not communication state.
- Organization communication policy overrides personal preference; personal quiet-hour preferences cannot weaken controlled rules.

## Remaining communication work

- Production promotion remains owner-controlled and requires its own exact-SHA release process.
- Live Resend/Twilio provider delivery is not claimed because provider secrets and endpoints were not configured in the consolidation project.
- Out-of-order callback precedence and provider-timeout worker pickup need a later controlled runtime slice.
- Inbound endpoint attachment still depends on promotion of the ambiguity-safe contact resolver.
- Physical iPhone call/SMS handoff and reconnect evidence remains required.
