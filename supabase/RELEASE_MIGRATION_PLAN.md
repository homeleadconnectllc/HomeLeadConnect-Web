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
63. `20260814144749_provider_map_coordinates_foundation.sql`
64. `20260814144914_secure_provider_map_coordinate_updates.sql`
65. `20260814145407_portal_identity_and_provider_profile_types.sql`
66. `20260814145501_harden_activity_log_as_append_only.sql`
67. `20260814145520_linked_provider_profile_read.sql`
68. `20260814150142_professional_portal_services_contract.sql`
69. `20260814150206_fix_professional_portal_availability_upsert.sql`
70. `20260814163950_professional_application_intake.sql`
71. `20260814182529_repair_auth_user_signup_profile_trigger.sql`
72. `20260814182821_align_assignment_notification_types.sql`
73. `20260814183500_fix_auth_signup_profile_trigger.sql`
74. `20260814184422_launch_portal_policy_and_fk_performance_hardening.sql`
75. `20260814204700_enforce_leads_single_writer.sql`
76. `20260814205500_complete_company_signup_workspace_membership.sql`
77. `20260814210500_workspace_team_roles_and_invitations.sql`
78. `20260814211500_support_workspace_invitee_signup.sql`
79. `20260814212000_fix_workspace_team_rpc_result_types.sql`
80. `20260814212500_tighten_workspace_members_browser_surface.sql`
81. `20260814223000_provider_map_coordinate_confidence.sql`
82. `20260815012500_harden_legacy_lead_routing.sql`
83. `20260815014000_launch_surface_fk_indexes.sql`
84. `20260815015000_harden_notification_browser_updates.sql`
85. `20260815020500_harden_portal_document_relationships.sql`
86. `20260815022000_align_voice_note_portal_storage.sql`
87. `20260815184500_harden_public_intake_rate_limit_and_honeypot.sql`
88. `20260815190000_lock_public_intake_guard.sql`
89. `20260816234500_expand_hlc_document_media_types.sql`

## Current production rules

- `main` is the production source branch. Netlify's native Git integration owns the production build so Netlify can inject production `VITE_*` values.
- GitHub production verification must pass lint, acceptance tests, the launch static audit, production build, Netlify site access, and exact-SHA-live verification before a release is considered complete.
- `workspace_members` establishes business-workspace membership and now stores the authoritative per-workspace internal role. `profiles.role` mirrors the active workspace role for backward-compatible UI/runtime checks. Customer/renter and contractor access is resolved through their dedicated portal links.
- Company-owner signup creates an isolated workspace, owner profile, and owner membership atomically. Workspace invitees create only an identity until an email-bound invitation is accepted, preventing orphan personal workspaces for invited staff.
- Internal workspace team invitations are hashed, email-bound, single-use, expiring, and role-limited. Owners may invite managers or technicians; managers may invite technicians. Team membership mutations run through role-checked RPCs rather than direct browser writes.
- Browser access to `workspace_members` is authenticated read-only for the caller's own membership. Anonymous SELECT and legacy direct membership-management policies are removed; role changes and membership mutation use audited RPCs/server paths.
- Internal workspace route policy recognizes `owner`, `manager`, and `technician`. Owner-only surfaces include HQ/command authority and subscription billing. Manager-level surfaces include workflow, automation, analytics, settings, team administration, operations, CX control, and moderation. Technicians receive operational workspace access but not manager/owner control planes.
- `public.leads` is a server-only write surface. Browser roles do not receive direct INSERT access; canonical lead creation must use the approved server/RPC ingestion boundary.
- `run_hlc_automation` and `automation_jobs` history are owner/manager control-plane capabilities. The production database enforces that rule in addition to the browser UI.
- `run_hlc_scheduled_workflow_scan()` is a system-only recurring read-only monitor. Normal browser roles cannot invoke it. It records workflow health, follow-up pressure, and owner-attention evidence without messaging customers, assigning providers, scheduling appointments, changing workflow state, or changing billing.
- Legacy SECURITY DEFINER operational/billing helpers must verify authenticated identity, canonical workspace membership, and internal role where the operation is staff-only.
- Balanced lead claiming must validate both the caller's workspace membership and the target assignee's membership in the same workspace. Legacy internal routing fallbacks are not directly executable by browser roles.
- Management RPCs for analytics/KPIs, provider configuration, and portal administration must enforce owner/manager authorization server-side rather than relying on route hiding.
- Browser roles must never retain database-administration privileges such as TRUNCATE, TRIGGER, or REFERENCES on public relations. Normal app behavior is limited to explicitly granted CRUD operations plus RLS/RPC enforcement.
- Profile self-service updates must not permit changes to `role`, `workspace_id`, `user_id`, or identity keys. Internal authority fields are server/admin controlled.
- Voice messages and legacy voice-audio storage use canonical `workspace_members` tenancy; the obsolete `org_members` path is not an authorization source.
- Community review eligibility must validate that the referenced completed job belongs to the same workspace as the review; a completed job ID from another workspace can never satisfy the review policy.
- Resident and professional portal document rows are relationship-scoped, not merely workspace-scoped: a portal user may see only explicitly shared documents tied to that user's linked lead/provider and eligible related estimates, jobs, or appointments. Storage signed-URL access inherits that same document RLS boundary.
- Conversation voice notes use the private `communication-voice-notes` bucket and authorize storage through canonical conversation participation plus matching workspace/conversation path segments; portal participants do not need internal workspace membership to use messaging voice notes.
- Provider Map coordinates are canonical location facts with confidence metadata. Exact owner/manager-entered coordinates are marked `verified`; safe city/ZIP centroids may be stored only as explicitly labeled `approximate` coordinates and must never be presented as an exact storefront or live location. Coordinate mutation remains management controlled and range validated.
- Provider/resident profile-type labels are presentation metadata, never authorization. Renter and subcontractor workflow mechanics that remain undefined must be represented as setup-required rather than fabricated.
- Professional portal self-service is anchored to an active `contractor_portal_links` relationship. It may update the linked provider's approved profile/service/availability fields but cannot self-grant workspace authority, verification, licensing approval, assignments, billing authority, or map-coordinate authority.
- Normal browser roles may append and read authorized activity but cannot rewrite/delete audit history.
- Notification recipients may update only their own `read_at` state; browser roles cannot rewrite canonical notification title, body, routing, event type, recipient, or source metadata.
- Anonymous/public callers must never receive direct execution access to internal automation, billing, owner approval, system-health, or staff-only functions.
- UI hiding is not an authorization boundary. Direct-route, RLS/RPC, storage, and server-side checks must continue to enforce the same access rules.
- Anonymous service-request and professional-application intake is throttled server-side with append-only attempt evidence. Honeypot submissions fail closed; direct browser execution of the internal guard is revoked.
- The private `hlc-documents` bucket permits controlled document, photo, and short-video evidence only. It remains private, capped at 25 MB per object, and storage access stays governed by canonical document relationship/RLS checks.

## Production verification evidence — 2026-08-14

- HLC production was published from `main` after Netlify team credits were restored.
- Production verification confirms the exact Git SHA served by Netlify, not merely a successful local build.
- Unverified phone/Google/Apple/Facebook sign-in methods remain hidden unless explicitly enabled after end-to-end provider verification.
- Production API logs showed authenticated `200` responses for user/session reads, workspace membership, leads, jobs, appointments, follow-ups, KPI/analytics RPCs, and analytics-event ingestion during launch acceptance.
- Web Push dispatch returned `200` in production; push controls now support explicit per-device disable/unsubscribe and foreground/background notification links are constrained to internal HLC routes.
- `hlc-agent-chat` is deployed with JWT verification and separate internal/resident/professional authorization boundaries. Gemini provider configuration is server-side only.
- `hlc-agent-voice` uses server-side Gemini neural TTS; browser system TTS is disabled for agent replies. Physical-device quality/playback acceptance remains a release gate until Kendrell, Dion, and Diamond are heard on iPhone/Mac.
- Hourly workflow automation is active at minute 07 and has a verified real cron execution. The de-duplication guard correctly suppresses redundant snapshot rows inside its 50-minute window.
- Legacy SECURITY DEFINER RPCs were hardened so cross-workspace IDs and unauthorized staff actions fail closed.
- Balanced lead claiming rejects target user IDs that are not members of the same workspace, and the legacy two-argument routing fallback is service-role/internal only.
- Management-only analytics/KPI, communications-provider configuration, and portal-revocation RPCs enforce owner/manager role checks at the database boundary.
- Public browser database-administration grants were removed and verified at `browser_admin_grants_remaining = 0` across public tables/views.
- Authenticated profile UPDATE privileges are column-scoped to safe self-service fields; role/workspace/identity fields cannot be browser-updated directly.
- Voice message and `voice-audio` policies were reconciled to `workspace_members` and verified in production.
- Portal document SELECT RLS now mirrors the exact resident/provider relationship checks used by document-view auditing, preventing one portal user from listing another relationship's shared-document metadata inside the same workspace.
- Portal/internal conversation voice-note storage now uses the deployed private bucket and participant-scoped storage policies, with orphan cleanup limited to unregistered objects in an authorized conversation.
- Community review insert authorization requires the completed job and review to share the same `workspace_id`.
- Provider Map coordinate columns, validation, management-only update controls, and approximate/verified confidence metadata are applied in production.
- Resident identity/provider profile types, linked-provider profile reads, professional portal services/availability contracts, and append-only activity history are applied in production.
- The auth-user onboarding trigger creates isolated company workspaces atomically and supports invite-only staff identities without creating throwaway owner workspaces.
- Per-workspace owner/manager/technician roles and secure company-team invitation RPCs are applied in production. A real owner-context test successfully listed the team and created a disposable technician invitation inside a rolled-back transaction; the RPC result-type defect found by that test was fixed in migration 79.
- A technician-context production test verified that technicians cannot list the company team or create workspace invitations. Membership grants were tightened afterward to remove anonymous SELECT and obsolete browser INSERT/DELETE policy paths.
- Dedicated provider, resident, manager, and technician E2E identities were created. Provider/resident identities have no internal workspace membership; manager/technician identities are explicitly scoped to the HomeLead Connect workspace.
- The live provider identity accepted the existing offered assignment through `contractor_decide_assignment`. That runtime attempt exposed and then verified a notification-type constraint defect; assignment accepted/rejected/cancelled events are now allowed by the canonical notification constraint.
- The manager runtime identity scheduled appointment `15` for the accepted provider assignment, and both contractor and resident portal RPCs returned the linked job and scheduled appointment under their own authenticated identities.
- The manager runtime identity then completed appointment `15` and the linked CRM job. The live golden chain now has persisted accepted assignment, completed appointment, and completed job evidence.
- Launch portal SELECT policies were consolidated without changing authorization semantics and rewritten to use init-plan-safe `(select auth.uid())`; authenticated provider and resident portal RPCs were retested successfully afterward.
- Covering indexes were added for the professional-application reviewer FK and launch-critical provider/public-form workspace FKs.
- Covering indexes were added for launch-critical AI audit/handoff, automation, Community, messenger/portal-participant, and workspace-invitation foreign keys.
- Security and performance advisors were rerun after launch DDL. Leaked-password protection remains an external Supabase Auth setting gate; existing intentional public/server RPC linter findings remain tracked rather than being silenced by unsafe broad revocation.
- The stable isolated QA site is used for physical-device acceptance before `main` is released.
- `hlc-documents` was verified private with a 25 MB object cap after expanding its allowlist to include MP4, MOV, and WebM short-video evidence alongside the existing document/photo types.

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