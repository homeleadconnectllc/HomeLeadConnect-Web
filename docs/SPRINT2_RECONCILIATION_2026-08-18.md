# Sprint 2 Reconciliation — 2026-08-18

## Purpose
Safely reconcile useful work from the stale `sprint-2-launch` branch into current `main` without merging the old branch wholesale.

## Current evidence
- `sprint-2-launch` is 5 commits ahead and 863 commits behind the current-main base used for reconciliation.
- PR #1 is conflicted across core application files and is not mergeable as-is.
- Current `main` has substantially newer routing, access-control, agent, mobile, workspace-shell, presentation, and Leads CRM work.

## Configuration correction
The earlier reconciliation note incorrectly described Supabase project `cguhtshclyybivvdnpig` as obsolete. Live schema inspection confirms that `homeconnect` (`cguhtshclyybivvdnpig`) is the active production project and contains the current `public.leads` schema. The stale Sprint 2 `.env` must not be copied or treated as configuration authority.

## Do not carry forward wholesale
The following categories remain obsolete/conflict-prone unless individually revalidated against current `main`:
- `.env` and runtime configuration
- application router/App shell replacements
- authentication/context replacements
- old Navbar/layout replacements
- public homepage replacements
- old dashboard shell replacements

## Leads/CRM reconciliation findings
The old Sprint 2 branch contains a self-contained Leads implementation under `src/features/leads/`, but current `main` already has a newer Leads route and API layer (`src/pages/dashboard/Leads.tsx`, `src/api/leads.ts`) plus later premium CRM presentation work.

### Implemented salvage slice
The reconciliation branch preserves the current-main workspace-scoped API boundary while reading verified richer lead fields. The Leads experience now uses pipeline context such as stage, priority, source, appointment, SLA, and conversion information without transplanting the old Sprint 2 architecture.

The Leads UI also includes a guarded Add Lead flow that calls `public.create_workspace_lead(...)`; the browser never inserts directly into `public.leads`.

### Verified reusable concepts
- Richer lead field inventory from Sprint 2 matches the live `public.leads` table.
- Search, loading, empty, and error-state patterns can be reused selectively.
- Old direct-Supabase query patterns should be adapted into the current workspace-scoped API boundary rather than copied wholesale.

### Do not copy directly
- The old hook queries Supabase directly instead of using the current workspace-scoped API layer.
- Several old summary/options queries rely on RLS alone instead of explicitly selecting the active workspace.
- The old Add Lead form performs a direct `insert` into `public.leads`; production deliberately forbids that browser write path.
- The old UI should not replace the newer HLC workspace/CRM presentation.
- The old duplicated `Lead` type should not become a second schema authority.

## Live database evidence
`public.leads` contains the richer Sprint 2-era columns needed by the current CRM, including `lead_code`, `notes`, `assigned_to`, `source`, `priority`, `appointment_at`, `pipeline_stage_id`, `stage`, `sla_status`, `conversion_score`, `intent_tags`, `attempt_count`, `next_eligible_dial_at`, and `priority_weight`.

Current `public.leads` policy/privilege posture:
- authenticated SELECT is workspace-scoped
- authenticated UPDATE is workspace-scoped
- authenticated DELETE is workspace-scoped
- normal browser roles do not have direct INSERT
- direct INSERT remains limited to privileged server/database roles

## Canonical lead creation boundary
Production uses a controlled two-layer write path:

1. `public.create_workspace_lead(...)` is the browser-facing authenticated boundary. It derives the active workspace from the signed-in profile, verifies canonical workspace membership and internal role (`owner`, `manager`, or `technician`), enforces the plan lead limit for genuinely new phone identities, validates inputs, and delegates to the canonical writer.
2. `causal.ingest_lead(...)` is the canonical lead writer. It normalizes phone identity, enforces workspace membership, upserts `public.leads`, and records causal state evidence. Normal browser roles do not execute it directly.

An older `public.create_lead_if_under_limit(...)` path is not used because it targets legacy `public.leads_new`, not canonical `public.leads`.

## Applied production migrations
The following forward-only migrations from this reconciliation branch are applied to production and mirrored in `supabase/RELEASE_MIGRATION_PLAN.md`:

- #96 `20260818124500_internal_workspace_lead_creation.sql` — adds the authenticated internal Add Lead wrapper without restoring browser INSERT.
- #97 `20260818131500_fix_internal_workspace_lead_upsert_defaults.sql` — ensures required insert values remain non-null even when an existing phone identity takes the conflict/update path.
- #98 `20260818133000_schema_qualify_causal_lead_digest.sql` — keeps the canonical writer's locked search path while schema-qualifying `extensions.digest(...)` for pgcrypto.

## Runtime certification
Owner-context rollback-only production certification now passes through `public.create_workspace_lead(...)` into the canonical `public.leads` row and `causal.leads_state` evidence path. The certification intentionally rolls back its mutation and verifies that the original lead remains unchanged afterward.

Post-certification authorization checks confirm:
- `anon` cannot execute `create_workspace_lead`
- `authenticated` can execute the guarded RPC
- direct browser INSERT on `public.leads` remains unavailable

## Isolated QA caveat
The older isolated QA Supabase project is schema-drifted from production; notably, its `workspace_members` table lacks the current authoritative `role` column. It is therefore not authoritative for Add Lead authorization testing. Production authorization must not be weakened to match stale QA. A fresh production-schema branch would be the correct isolated database environment for browser-level Add Lead E2E if one is created later.

## Security findings relevant to reconciliation
The live Supabase security advisor still reports pre-existing review items, including:
- multiple RLS-enabled tables with no policies
- multiple intentionally exposed `SECURITY DEFINER` RPCs that require per-function authorization review
- leaked-password protection disabled

The new `create_workspace_lead` RPC is expected to appear as an authenticated `SECURITY DEFINER` warning because signed-in users intentionally call it; its internal membership, role, tenant, plan-limit, and validation checks are the authorization boundary.

## Safe work order
1. Keep `main` untouched until release review is complete.
2. Use `reconcile/sprint2-salvage` as the reconciliation branch.
3. Preserve `src/api/leads.ts` as the current workspace-scoped data boundary.
4. Continue salvaging capabilities, not old files.
5. Never restore direct browser INSERT on `public.leads` or use legacy `leads_new` as a second CRM source of truth.
6. Add every production DDL change as a new timestamped migration and keep the canonical migration plan synchronized.
7. Do not copy stale auth, router, layout, `.env`, or public-page changes from Sprint 2.
8. Keep regression coverage for each salvaged behavior.
9. Require exact-head launch CI before merge.
10. Keep the PR draft until final product/release review is complete.

## Current status
The read-only CRM enrichment and guarded Add Lead flow are implemented on PR #31. Production migrations #96–#98 are applied and rollback-only runtime certification passes. Exact head `4568347344f36115d4e15c07af6e1fa99d0b01e5` passed HLC Launch Candidate run #590 before this documentation-only correction; a fresh exact-head run is required for the documentation-updated commit before the branch is considered release-ready.
