# Sprint 2 Reconciliation — 2026-08-18

## Purpose
Safely reconcile useful work from the stale `sprint-2-launch` branch into current `main` without merging the old branch wholesale.

## Current evidence
- `sprint-2-launch` is 5 commits ahead and 863 commits behind current `main`.
- PR #1 is conflicted across core application files and is not mergeable as-is.
- Current `main` has substantially newer routing, access-control, agent, mobile, workspace-shell, presentation, and Leads CRM work.

## Configuration correction
The earlier reconciliation note incorrectly described Supabase project `cguhtshclyybivvdnpig` as obsolete. Live schema inspection on 2026-08-18 confirms that project contains the current `public.leads` schema used for this reconciliation. The stale branch `.env` still must not be copied or treated as configuration authority; runtime configuration should continue to come from the current deployment/repository setup.

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

### Verified reusable concepts
- Server-side pagination/filter/sort patterns from the old `useLeads` hook may be useful when adapted to the current API layer.
- The richer lead field inventory in the old hook matches the live `public.leads` table, including stage, priority, source, appointment, SLA, scoring, and dial-attempt fields.
- Search sanitization and explicit loading/empty/error states are reasonable implementation patterns to reuse selectively.

### Do not copy directly
- The old hook queries Supabase directly instead of using the current workspace-scoped API layer.
- Several summary/options queries rely on RLS alone rather than explicitly selecting the active workspace; current `main` explicitly resolves and filters by current workspace.
- The old Add Lead form performs a direct `insert` into `public.leads`. Live RLS currently has SELECT, UPDATE, and DELETE policies for authenticated workspace members but no INSERT policy, so that form is not safe/functional to transplant as written.
- The old UI uses standalone inline styling and should not replace the newer HLC workspace/CRM presentation.
- The old duplicated `Lead` type should not become a second schema authority; current database types/API contracts should be extended deliberately instead.

## Live database evidence
On 2026-08-18, `public.leads` contains the richer Sprint 2-era columns, including `lead_code`, `notes`, `assigned_to`, `source`, `priority`, `appointment_at`, `pipeline_stage_id`, `stage`, `sla_status`, `conversion_score`, `intent_tags`, `attempt_count`, `next_eligible_dial_at`, and `priority_weight`.

Current `public.leads` policies observed:
- authenticated SELECT scoped to `workspace_id IN get_user_workspace_ids()`
- authenticated UPDATE scoped to workspace membership
- authenticated DELETE scoped to workspace membership
- no INSERT policy observed

This means read/update enrichment can be evaluated without inventing a second lead model, while lead creation needs an intentional existing RPC/server path or a separately reviewed policy change before UI work is enabled.

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
5. Do not enable Add Lead until the existing intended creation path is identified and verified; do not create a duplicate model or casually broaden RLS.
6. Do not copy the stale `.env`, auth, router, Navbar, layout, or public-page changes.
7. Add regression coverage for every salvaged behavior.
8. Run the full launch candidate suite before any merge.
9. Keep the PR draft until exact-head verification is green and the diff has been reviewed.

## Current status
No Sprint 2 product code has been copied. Reconciliation has now classified the old Leads implementation: its richer field/query concepts are partially reusable, but its direct data mutations and duplicated architecture are not safe to transplant. The next implementation gate should extend the existing current-main Leads API/read experience with verified richer fields before considering mutations.
