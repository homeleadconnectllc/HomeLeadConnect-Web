# Pennsylvania V1 migration release plan

Status: production application is intentionally blocked until an isolated Supabase branch or clone proves the chain below.

## History reconciliation

The linked `homeconnect` project contains historical migration versions that are not present in this repository. Its latest recorded remote version is `20260810231636`. Local launch migrations begin at `20260810204523`, overlap the remote timeline, and remain unapplied remotely.

Do not run `supabase db push --linked` against production until a clone has proved both the migration order and the intended reconciliation of remote-only history. Do not mark remote-only versions reverted; they describe real production history.

## Ordered pending chain

1. `20260810204523_job_operations_assignment_scheduling.sql`
2. `20260810205049_atomic_job_appointment_reschedule.sql`
3. `20260810210000_allow_appointment_close_after_assignment_end.sql`
4. `20260810233000_profile_business_settings.sql`
5. `20260810234500_public_service_intake.sql`
6. `20260810235900_harden_public_ingest_and_worker_functions.sql`
7. `20260811000500_repair_causal_lead_ingest.sql`
8. `20260811000615_communication_compliance_gate.sql`
9. `20260811001014_hlc_v1_subscription_billing.sql`
10. `20260811002000_pin_existing_function_search_paths.sql`
11. `20260811003000_secure_workspace_switch.sql`
12. `20260811003512_billing_enrollment_consent.sql`
13. `20260811010000_portal_invitation_and_access.sql`
14. `20260811010546_hlc_agent_runtime.sql`
15. `20260811011000_canonical_messenger.sql`
16. `20260811011802_unify_contractor_assignment_authority.sql`
17. `20260811012000_restrict_legacy_dashboard_actions.sql`
18. `20260811012500_restrict_legacy_lead_automation.sql`
19. `20260811013000_communication_transports.sql`
20. `20260811013213_launch_completion_foundations.sql`
21. `20260811013500_google_voice_manual_channel.sql`
22. `20260811014000_canonical_notifications.sql`
23. `20260811015430_explicit_appointment_end_times.sql`
24. `20260811021550_unified_telephony_routing.sql`
25. `20260811023142_document_view_audit.sql`
26. `20260811024203_launch_notification_events.sql`
27. `20260811110214_normalize_launch_table_privileges.sql`
28. `20260812104540_reconciliation_positive_access_policies.sql`
29. `20260812110000_device_native_compliance_transport.sql`
30. `20260812110500_reconcile_convert_estimate_to_job.sql`
31. `20260812111000_reconciliation_operational_write_policies.sql`
32. `20260812111200_reconciliation_follow_up_policies.sql`
33. `20260812111300_reconciliation_public_intake_fidelity.sql`
34. `20260812111500_manual_communication_transport_logging.sql`
35. `20260812131415_ecosystem_launch_surfaces.sql`
36. `20260812132000_ecosystem_participant_surfaces.sql`
37. `20260812133800_ecosystem_surface_performance_hardening.sql`
38. `20260812191000_reconcile_leads_workspace_foreign_key.sql`
39. `20260812191500_reconciliation_billing_rls_and_appointment_trigger_cleanup.sql`
40. `20260812194900_persisted_automation_runtime.sql`
41. `20260812195500_reconciliation_automation_job_visibility.sql`
42. `20260812200000_dynamic_billing_enrollment_consent.sql`
43. `20260812200500_harden_automation_rpc_grants.sql`
44. `20260813114500_reconcile_hlc_plan_with_live_stripe.sql`
45. `20260813125000_harden_leads_api_privileges.sql`

## Isolated verification gate

1. Create a Supabase branch/clone from production without changing production.
2. Capture its project reference and link a clean working copy to the clone.
3. Reconcile remote-only migration history from database truth; never fabricate SQL bodies for missing historical migrations.
4. Apply the pending chain in order.
5. Run positive, cross-workspace, invalid-transition, invitation, communications, document/storage, billing-webhook, AI, appointment, telephony, Community, network, profile, participant-surface, and automation-runtime transactional tests.
6. Run database security and performance advisors. Treat RLS-without-policy tables as deny-by-default unless an established product contract requires access.
7. Verify Edge Function environment names and deploy functions only to the clone.
8. Exercise rollback by restoring the clone snapshot or discarding the branch; production rollback requires a separately captured pre-release restore point.

### Reconciliation evidence recorded 2026-08-12

The `hlc-reconciliation-test` project has the expanded launch schema and includes migration `20260812104540_reconciliation_positive_access_policies`. Simulated authenticated access proved that a Workspace A member can read Workspace A lead/estimate/job/assignment/appointment records while a Workspace B member receives zero Workspace A rows. Estimate insertion succeeds for the member's own workspace and is rejected by RLS for a cross-workspace insert.

Device-native calling/texting now uses the same communication compliance function as connected providers, with `device_native` exempt only from the provider-connection requirement. A transactional Workspace A service-call test returned `ALLOW` with no compliance reasons. A second transaction proved that an allowed device-native call can be written to `communication_transmissions` as operator-reported evidence and the transaction was rolled back after verification.

Production already contained the canonical `convert_estimate_to_job(uuid)` contract used by the frontend, but the reconciliation project did not. Migration `20260812110500_reconcile_convert_estimate_to_job.sql` restores that contract in the launch chain. A transactional authenticated test created an accepted Workspace A estimate and converted it to a pending CRM job with the same lead/workspace/contract value and source estimate.

The reconciliation baseline also lacked authenticated operational writes for CRM jobs, job assignments, and appointments. Migration `20260812111000_reconciliation_operational_write_policies.sql` restores the existing client contract while preserving workspace membership and actor checks. The complete rolled-back golden workflow then passed with the correct authority handoff: Workspace A owner created an accepted estimate, converted it to a pending job, offered that job to the linked contractor, the contractor accepted through `contractor_decide_assignment`, and the owner scheduled a valid appointment.

The security advisor then exposed `follow_ups` as a user-facing RLS table with no policies even though the launch UI directly reads, creates, and completes follow-ups. Migration `20260812111200_reconciliation_follow_up_policies.sql` scopes those operations through the linked lead workspace and requires the authenticated user to own new follow-ups. A rolled-back Workspace A test successfully created and read its own follow-up.

The reconciliation database also lacked the causal lead-state internals and `submit_public_service_request` RPC required by the public request form. Migration `20260812111300_reconciliation_public_intake_fidelity.sql` restores that established intake contract. A test-only `request-service` form mapping to Workspace A was seeded in the reconciliation project, and an anonymous rolled-back request returned `accepted=true` with a lead id. The `send-portal-invitation` Edge Function was also deployed to the reconciliation project with JWT verification enabled; invitation email delivery still requires its `PORTAL_SITE_URL` runtime secret. These are reconciliation tests only; they do not authorize a production migration.

Migrations `20260812131415_ecosystem_launch_surfaces.sql` and `20260812132000_ecosystem_participant_surfaces.sql` add tenant-scoped Community, review/referral/moderation, provider service-area/availability/saved-provider, participant-preference, resident-property, provider-service, and Community-group records. RLS remains enabled on every added table; completed-job review eligibility and workspace/member boundaries are enforced in database policies rather than UI-only checks.

Migration `20260812133800_ecosystem_surface_performance_hardening.sql` adds covering indexes for new foreign keys and rewrites new user-scoped RLS predicates to use stable `select auth.uid()` evaluation. This addresses advisor findings introduced by the new ecosystem surfaces without weakening authorization.

Migration `20260812191000_reconcile_leads_workspace_foreign_key.sql` corrects the reconciliation-only `leads.workspace_id` foreign key so canonical HLC intake can reference `workspaces(id)` instead of the legacy organizations domain. A public-intake transactional probe returned `accepted=true` against the canonical HLC workspace after the repair.

Migration `20260812191500_reconciliation_billing_rls_and_appointment_trigger_cleanup.sql` restores authenticated workspace-member read access to `workspace_plan_status`, keeps subscription mutation backend-only, and removes the duplicate appointment validation trigger while preserving the canonical validator.

Migration `20260812194900_persisted_automation_runtime.sql` adds persisted execution state and the deterministic `run_hlc_automation` RPC for workflow health, follow-up, and owner-attention scans. The RPC derives workspace identity from the authenticated profile, enforces membership, supports idempotency, records results, and writes an activity audit event.

Migration `20260812195500_reconciliation_automation_job_visibility.sql` keeps persisted automation-job history readable only to authenticated members of the owning workspace while leaving job creation and state mutation backend-controlled. The `/automations` surface reads this history instead of presenting configuration alone.

Migration `20260812200000_dynamic_billing_enrollment_consent.sql` removes the stale fixed $99/month enrollment constraint and instead requires a positive recurring amount with an approved monthly or yearly interval. Checkout records the configured Stripe Price server-side, while the existing 14-day trial, USD currency, and Stripe Billing Portal cancellation contract remain enforced.

Migration `20260812200500_harden_automation_rpc_grants.sql` is the final launch-chain grant hardening step for the automation RPC surface. It is listed explicitly so the release plan remains a complete, ordered mirror of the local migration chain; this documentation update does not apply the migration to any Supabase project.

Migration `20260813114500_reconcile_hlc_plan_with_live_stripe.sql` reconciles the published `hlc_v1` plan row with the approved live Stripe Pro product and active Price `price_1Tdo5cLE7v3WdqBuj7Jgt3T1` at $49.99 USD per month. The checkout function now cross-checks the published HLC plan against Stripe and refuses enrollment on any amount, currency, or interval mismatch. This migration remains pending and must not be applied to production outside the production migration gate.

Migration `20260813125000_harden_leads_api_privileges.sql` adds defense in depth to the single-writer lead model by revoking API-role mutation privileges on `public.leads`, revoking anonymous SELECT, and preserving authenticated SELECT. RLS already limits the reconciliation project to one workspace-member SELECT policy; the privilege hardening prevents a future policy mistake from silently re-opening browser writes.

The three prepared Stripe billing Edge Functions were deployed to the reconciliation project with the intended verification boundaries: checkout and billing portal require JWTs; the webhook does not require a Supabase JWT and instead independently verifies `Stripe-Signature`. The approved live recurring Price, enabled Stripe webhook endpoint, and active customer portal configuration are now present. Billing remains blocked until the required server-side secrets are confirmed in the target environment and the full Checkout → signed webhook → entitlement → billing portal transaction is proven end to end. The checkout function derives the recorded recurring amount and interval from the configured Stripe Price rather than trusting browser input.

### Reconciliation evidence recorded 2026-08-13

Read-only database inspection confirms `public.leads` currently has exactly one authenticated RLS policy in the reconciliation project and that policy is SELECT-only through `workspace_members`. The legacy high-risk lead mutation RPCs probed (`perform_dashboard_action`, `create_lead_if_under_limit`, `claim_next_lead_balanced`, `call_lead`, `change_lead_stage`, and `route_lead`) are not exposed there. Broad inherited table grants remain present underneath RLS, which is why migration `20260813125000_harden_leads_api_privileges.sql` was added before promotion.

Reconciliation Edge Functions are active for portal invitations, Stripe checkout, Stripe billing portal, Stripe webhook, and HLC agent chat. Checkout and portal require Supabase JWTs; Stripe webhook correctly disables Supabase JWT verification and verifies `Stripe-Signature` itself. Auth logs show successful `200` user/session reads from the Netlify sprint branch origin on 2026-08-13, proving the branch origin was successfully wired to the reconciliation auth project before the later Netlify branch-deploy availability failure.

The connected live Stripe account currently has no subscriptions. Its enabled webhook endpoint targets the reconciliation project's `stripe-webhook` function and listens for the six required HLC billing events. This is appropriate only for isolated launch testing; production promotion must intentionally deploy the production webhook with custom Stripe signature verification and move the Stripe endpoint only after production secrets/schema are ready.

## Production gate

Production application requires explicit deployment authorization, a verified backup/restore point, successful clone evidence, provider secrets configured through approved secret stores, and the consolidated browser/mobile/security acceptance run.
