# Sprint 2 Reconciliation — 2026-08-18

## Purpose
Safely reconcile useful work from the stale `sprint-2-launch` branch into current `main` without merging the old branch wholesale.

## Current evidence
- `sprint-2-launch` is 5 commits ahead and 863 commits behind current `main`.
- PR #1 is conflicted across core application files and is not mergeable as-is.
- Current `main` has substantially newer routing, access-control, agent, mobile, workspace-shell, presentation, and Leads CRM work.

## Configuration correction
The earlier reconciliation note incorrectly described Supabase project `cguhtshclyybivvdnpig` as obsolete. Live schema inspection on 2026-08-18 confirms that `homeconnect` (`cguhtshclyybivvdnpig`) is the active production project and contains the current `public.leads` schema used for this reconciliation. The stale branch `.env` still must not be copied or treated as configuration authority; runtime configuration should continue to come from the current deployment/repository setup.

## Do not carry forward wholesale
The following categories must be treated as obsolete/conflict-prone unless individually revalidated against current `main`:
- `.env` and runtime configuration
- application router/App shell replacements
- authentication/context replacements
- old Navbar/layout replacements
- public homepage replacements
- old dashboard shell replacements

## Leads/CRM reconciliation findings
The old Sprint 2 branch contains a self-contained Leads implementation under `src/features/leads/`, but current `main` already has a newer Leads route and API layer (`src/pages/dashboard/Leads.tsx`, `src/api/leads.ts`) plus later merged premium CRM presentation work.

### Implemented salvage slice
The draft reconciliation branch now preserves the current-main workspace-scoped API boundary while reading verified richer lead fields. The current Leads experience can use pipeline context such as stage, priority, source, appointment, SLA, and conversion information without transplanting the old Sprint 2 architecture. Exact-head HLC Launch Candidate run #572 passed after the TypeScript boundary was corrected.

### Verified reusable concepts
- Server-side pagination/filter/sort patterns from the old `useLeads` hook may be useful when adapted to the current API layer.
- The richer lead field inventory in the old hook matches the live `public.leads` table, including stage, priority, source, appointment, SLA, scoring, and dial-attempt fields.
- Search sanitization and explicit loading/empty/error states are reasonable implementation patterns to reuse selectively.

### Do not copy directly
- The old hook queries Supabase directly instead of using the current workspace-scoped API layer.
- Several summary/options queries rely on RLS alone rather than explicitly selecting the active workspace; current `main` explicitly resolves and filters by current workspace.
- The old Add Lead form performs a direct `insert` into `public.leads`. Production deliberately revokes direct browser INSERT and treats `public.leads` as a server-only write surface.
- The old UI uses standalone inline styling and should not replace the newer HLC workspace/CRM presentation.
- The old duplicated `Lead` type should not become a second schema authority; current database types/API contracts should be extended deliberately instead.

## Live database evidence
On 2026-08-18, `public.leads` contains the richer Sprint 2-era columns, including `lead_code`, `notes`, `assigned_to`, `source`, `priority`, `appointment_at`, `pipeline_stage_id`, `stage`, `sla_status`, `conversion_score`, `intent_tags`, `attempt_count`, `next_eligible_dial_at`, and `priority_weight`.

Current `public.leads` policies observed:
- authenticated SELECT scoped to `workspace_id IN get_user_workspace_ids()`
- authenticated UPDATE scoped to workspace membership
- authenticated DELETE scoped to workspace membership
- no browser INSERT policy

The production migration plan explicitly states that `public.leads` is a server-only write surface and canonical lead creation must use an approved server/RPC ingestion boundary.

## Canonical lead creation boundary
Production has two relevant layers:

1. `causal.ingest_lead(...)` is the canonical full lead writer. Browser `anon` and `authenticated` roles cannot execute it; `service_role` can. It normalizes phone identity, enforces workspace membership internally, upserts `public.leads`, and records causal state evidence.
2. `causal._ingest_lead_impl(...)` is an even more private implementation helper and is not executable by normal browser or service roles directly. Hardened public intake RPCs invoke it from controlled SECURITY DEFINER code.

`public.submit_public_service_request(...)` is the verified public example: it validates the enabled form, rate/honeypot guard, request identity, name, phone, email, and project details, then calls the private causal writer and records the request ID.

An older `public.create_lead_if_under_limit(...)` RPC must not be used for the current CRM because it writes to `public.leads_new`, not canonical `public.leads`.

### Safe internal Add Lead design
If internal CRM lead creation is enabled, the correct shape is a new narrow authenticated SECURITY DEFINER RPC that:
- derives the workspace from the authenticated profile rather than accepting arbitrary workspace identity from the browser
- requires canonical `workspace_members` membership and an internal role (`owner`, `manager`, or `technician`)
- calls `public.can_insert_lead(workspace_id)` to preserve active-plan lead limits
- validates name, normalized phone, optional email, notes length, and source length
- delegates the actual write to the canonical causal writer
- grants EXECUTE only to `authenticated` and never restores direct INSERT on `public.leads`

A concrete SQL design for this wrapper was drafted during reconciliation, but it was intentionally not left as a production migration because every new DDL file must also be inserted into the canonical `supabase/RELEASE_MIGRATION_PLAN.md` chain and then intentionally applied/verified in production. No production DDL was changed during this reconciliation step.

## Security findings relevant to reconciliation
The live Supabase security advisor currently reports:
- several RLS-enabled tables with no policies
- broad-role access to multiple `SECURITY DEFINER` RPCs
- leaked-password protection disabled

These are review findings, not automatic defects. Public intake and portal RPCs may intentionally be callable by broader roles, so no grants/policies should be changed without verifying each function's internal authorization and intended access path.

## Safe work order
1. Keep `main` untouched.
2. Use `reconcile/sprint2-salvage` as the only salvage branch.
3. Preserve current `src/api/leads.ts` as the workspace-scoped data boundary and extend it only with verified fields/operations.
4. Prefer salvaging capabilities, not old files: richer read fields, filtering/sorting/pagination, then safe update actions.
5. For Add Lead, use a new role-checked authenticated RPC that delegates to the canonical single writer; never restore direct browser INSERT and never use legacy `leads_new` as a second CRM source of truth.
6. Represent that RPC as a new timestamped migration and add it to the canonical release migration plan before database application.
7. Do not copy the stale `.env`, auth, router, Navbar, layout, or public-page changes.
8. Add regression coverage for every salvaged behavior.
9. Run the full launch candidate suite before any merge.
10. Keep the PR draft until exact-head verification is green and the diff has been reviewed.

## Current status
The first read-only Leads enrichment slice is implemented and previously passed exact-head launch CI. Internal lead creation is now architecturally resolved but not enabled: the canonical writer and safe wrapper contract are known, while production DDL and the Add Lead UI remain intentionally unchanged pending migration-chain staging, CI, and intentional production verification.
