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

## Isolated verification gate

1. Create a Supabase branch/clone from production without changing production.
2. Capture its project reference and link a clean working copy to the clone.
3. Reconcile remote-only migration history from database truth; never fabricate SQL bodies for missing historical migrations.
4. Apply the pending chain in order.
5. Run positive, cross-workspace, invalid-transition, invitation, communications, document/storage, billing-webhook, AI, appointment, telephony, Community, network, profile, and participant-surface transactional tests.
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

## Production gate

Production application requires explicit deployment authorization, a verified backup/restore point, successful clone evidence, provider secrets configured through approved secret stores, and the consolidated browser/mobile/security acceptance run.
