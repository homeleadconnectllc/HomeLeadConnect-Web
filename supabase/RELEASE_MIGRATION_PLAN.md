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
- Management RPCs for analytics/KPIs, provider configuration, and portal administration must enforce owner/manager authorization server-side rather than relying on route hiding.
- Browser roles must never retain database-administration privileges such as TRUNCATE, TRIGGER, or REFERENCES on public relations. Normal app behavior is limited to explicitly granted CRUD operations plus RLS/RPC enforcement.
- Profile self-service updates must not permit changes to `role`, `workspace_id`, `user_id`, or identity keys. Internal authority fields are server/admin controlled.
- Voice messages and legacy voice-audio storage use canonical `workspace_members` tenancy; the obsolete `org_members` path is not an authorization source.
- Community review eligibility must validate that the referenced completed job belongs to the same workspace as the review; a completed job ID from another workspace can never satisfy the review policy.
- Resident portal documents must be shown only through the resident portal route and remain limited to files explicitly shared with `sharing_scope = 'homeowner'` and authorized by portal linkage/RLS.
- Provider Map coordinates are canonical location facts with confidence metadata. Exact owner/manager-entered coordinates are marked `verified`; safe city/ZIP centroids may be stored only as explicitly labeled `approximate` coordinates and must never be presented as an exact storefront or live location. Coordinate mutation remains management controlled and range validated.
- Provider/resident profile-type labels are presentation metadata, never authorization. Renter and subcontractor workflow mechanics that remain undefined must be represented as setup-required rather than fabricated.
- Professional portal self-service is anchored to an active `contractor_portal_links` relationship. It may update the linked provider's approved profile/service/availability fields but cannot self-grant workspace authority, verification, licensing approval, assignments, billing authority, or map-coordinate authority.
- Normal browser roles may append and read authorized activity but cannot rewrite/delete audit history.
- Anonymous/public callers must never receive direct execution access to internal automation, billing, owner approval, system-health, or staff-only functions.
- UI hiding is not an authorization boundary. Direct-route, RLS/RPC, storage, and server-side checks must continue to enforce the same access rules.

## Production verification evidence — 2026-08-14

- HLC production was published from `main` after Netlify team credits were restored.
- Production verification confirms the exact Git SHA served by Netlify, not merely a successful local build.
- Unverified phone/Google/Apple/Facebook sign-in methods remain hidden unless explicitly enabled after end-to-end provider verification.