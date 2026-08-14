# HomeLead Connect production migration plan

Status: **production is live**. The ordered list below is the canonical local migration chain and must remain an exact filename-ordered mirror of `supabase/migrations`.

The active production Supabase project is `homeconnect` (`cguhtshclyybivvdnpig`). Do not apply launch migrations to the reconciliation/test project as a substitute for production. Production DDL changes must be represented here, applied intentionally, verified, and followed by security/performance checks appropriate to the change.

## Ordered canonical chain

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
46. `20260814102238_launch_core_fk_indexes.sql`
47. `20260814103000_telephony_realtime_notification_spine.sql`
48. `20260814104000_widen_business_phone_provider_support.sql`
49. `20260814110000_hlc_first_party_analytics.sql`
50. `20260814112000_hlc_web_push_subscriptions.sql`
51. `20260814114000_hlc_business_kpis.sql`
52. `20260814115000_harden_hlc_analytics_ingest.sql`
53. `20260814115000_reconcile_telephony_notification_constraints.sql`
54. `20260814120000_property_mechanical_intelligence.sql`
55. `20260814134500_harden_internal_automation_access.sql`
56. `20260814135500_enable_hourly_workflow_automation.sql`
57. `20260814141000_harden_legacy_security_definer_rpcs.sql`
58. `20260814142000_align_management_rpc_roles.sql`
59. `20260814143000_remove_browser_admin_table_privileges.sql`
60. `20260814143500_remove_browser_view_admin_privileges.sql`
61. `20260814144000_reconcile_voice_access_to_workspace_members.sql`
62. `20260814144347_harden_community_review_workspace_linkage.sql`

## Current production rules

- `main` is the production source branch. Netlify's native Git integration owns the production build so Netlify can inject production `VITE_*` values.
- GitHub production verification must pass lint, acceptance tests, the launch static audit, production build, Netlify site access, and exact-SHA-live verification before a release is considered complete.
- `workspace_members` establishes business-workspace membership. `profiles.role` is the internal role signal. Customer/renter and contractor access is resolved through their dedicated portal links.
- Internal workspace route policy recognizes `owner`, `manager`, and `technician`. Owner-only surfaces include HQ/command authority and subscription billing. Manager-level surfaces include workflow, automation, analytics, settings, operations, CX control, and moderation. Technicians receive operational workspace access but not manager/owner control planes.
- `run_hlc_automation` and `automation_jobs` history are owner/manager control-plane capabilities. The production database enforces that rule in addition to the browser UI.
- `run_hlc_scheduled_workflow_scan()` is a system-only recurring read-only monitor. Normal browser roles cannot invoke it. It records workflow health, follow-up pressure, and owner-attention evidence without messaging customers, assigning providers, scheduling appointments, changing workflow state, or changing billing.
- Legacy SECURITY DEFINER operational/billing helpers must verify authenticated identity, canonical workspace membership, and internal role where the operation is staff-only.
- Management RPCs for analytics/KPIs, provider configuration, and portal administration must enforce owner/manager authorization server-side rather than relying on route hiding.
- Browser roles must never retain database-administration privileges such as TRUNCATE, TRIGGER, or REFERENCES on public relations. Normal app behavior is limited to explicitly granted CRUD operations plus RLS/RPC enforcement.
- Profile self-service updates must not permit changes to `role`, `workspace_id`, `user_id`, or identity keys. Internal authority fields are server/admin controlled.
- Voice messages and legacy voice-audio storage use canonical `workspace_members` tenancy; the obsolete `org_members` path is not an authorization source.
- Community review eligibility must validate that the referenced completed job belongs to the same workspace as the review; a completed job ID from another workspace can never satisfy the review policy.
- Resident portal documents must be shown only through the resident portal route and must remain limited to files explicitly shared with `sharing_scope = 'homeowner'` and authorized by portal linkage/RLS.
- Anonymous/public callers must never receive direct execution access to internal automation, billing, owner approval, system-health, or staff-only functions.
- UI hiding is not an authorization boundary. Direct-route, RLS/RPC, storage, and server-side checks must continue to enforce the same access rules.

## Production verification evidence — 2026-08-14

- HLC production was published from `main` after Netlify team credits were restored.
- Production verification now confirms the exact Git SHA served by Netlify, not merely a successful local build.
- The internal ecosystem readiness matrix was removed from normal production navigation and `/ecosystem` redirects to `/dashboard`.
- Unverified phone/Google/Apple/Facebook sign-in methods are hidden unless explicitly enabled after end-to-end provider verification.
- Production API logs showed authenticated `200` responses for user/session reads, workspace membership, leads, jobs, appointments, follow-ups, KPI/analytics RPCs, and analytics-event ingestion during launch acceptance.
- Web Push dispatch returned `200` in production.
- `hlc-agent-chat` version 2 is active and uses an authenticated workspace-aware deterministic fallback when the external AI provider is unavailable. A fresh authenticated Kendrell production invocation returned `POST 200` on version 2.
- Migration `20260814134500_harden_internal_automation_access.sql` was applied to production and verified: automation history is owner/manager scoped and `run_hlc_automation` is executable by authenticated/service roles rather than PUBLIC, while the function itself enforces owner/manager authorization.
- Migration `20260814135500_enable_hourly_workflow_automation.sql` was applied to production. Cron job `hlc-workflow-automation-hourly` is active on `7 * * * *`. A manual verification run created a successful read-only `workflow_automation_scan` record with live workflow/follow-up/owner-attention counts.
- Legacy SECURITY DEFINER RPCs were hardened so cross-workspace IDs and unauthorized staff actions fail closed.
- Management-only analytics/KPI, communications-provider configuration, and portal-revocation RPCs now enforce owner/manager role checks at the database boundary.
- Public browser database-administration grants were removed and verified at `browser_admin_grants_remaining = 0` across public tables/views.
- Authenticated profile UPDATE privileges are column-scoped to safe self-service fields; role/workspace/identity fields cannot be browser-updated directly.
- Voice message and `voice-audio` policies were reconciled to `workspace_members` and verified in production.
- Resident documents now have a dedicated portal route so homeowner/renter users are not sent to the internal workspace Documents surface.
- Community review insert authorization was hardened to require the completed job and review to share the same `workspace_id`.
- Security and performance advisors were rerun after launch DDL. Existing linter findings remain tracked; no broad index rewrites were made as a launch-day shortcut.

## Change procedure after launch

1. Make the smallest coherent source change on `main` or a verified release branch as appropriate.
2. Add every DDL change as a new timestamped migration; never edit already-applied production history to disguise a new change.
3. Keep this ordered list synchronized with `supabase/migrations`.
4. Verify RLS, function grants, tenant predicates, role checks, storage policies, and column privileges for any changed data surface.
5. Run `npm run verify:launch`.
6. Let Netlify build with production environment variables.
7. Require the exact-SHA-live production gate to pass.
8. Review fresh production auth/API/Edge/Cron logs for regressions.
9. Do not expose secrets, service-role credentials, VAPID private material, Stripe secret keys, or provider tokens to browser code or documentation.
