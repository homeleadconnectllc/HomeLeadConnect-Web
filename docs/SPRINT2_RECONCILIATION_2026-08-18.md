# Sprint 2 Reconciliation — 2026-08-18

## Purpose
Safely reconcile useful work from the stale `sprint-2-launch` branch into current `main` without merging the old branch wholesale.

## Current evidence
- `sprint-2-launch` is 5 commits ahead and 863 commits behind current `main`.
- PR #1 is conflicted across core application files and is not mergeable as-is.
- The old branch commits a `.env` file pointing at Supabase project `cguhtshclyybivvdnpig`, which is not the currently verified HLC Supabase project `agfwqnirspmptjiqrrtk`.
- Current `main` has substantially newer routing, access-control, agent, mobile, workspace-shell, and presentation work.

## Do not carry forward wholesale
The following categories must be treated as obsolete/conflict-prone unless individually revalidated against current `main`:
- `.env` and runtime configuration
- application router/App shell replacements
- authentication/context replacements
- old Navbar/layout replacements
- public homepage replacements
- old dashboard shell replacements

## Candidate salvage area
The old Sprint 2 branch contains a comparatively self-contained Leads/CRM implementation under `src/features/leads/`, including:
- lead detail
- lead form
- filters/search
- priority/status badges
- lead row/table
- loading/empty states
- `useLeads` data hook
- lead types

These are candidates only. They must be reconciled against current database schema, RLS/RPC rules, current routes, current workspace authorization, and current HLC design system before any code is copied.

## Security findings relevant to reconciliation
The live Supabase security advisor currently reports:
- several RLS-enabled tables with no policies
- broad-role access to multiple `SECURITY DEFINER` RPCs
- leaked-password protection disabled

These are review findings, not automatic defects. Public intake and portal RPCs may intentionally be callable by broader roles, so no grants/policies should be changed without verifying each function's internal authorization and intended access path.

## Safe work order
1. Keep `main` untouched.
2. Use `reconcile/sprint2-salvage` as the only salvage branch.
3. Reconcile Leads/CRM pieces one capability at a time against current `main` and current Supabase schema.
4. Do not copy the stale `.env`, auth, router, Navbar, layout, or public-page changes.
5. Add regression coverage for every salvaged behavior.
6. Run the full launch candidate suite before any merge.
7. Keep the PR draft until exact-head verification is green and the diff has been reviewed.

## Current status
No Sprint 2 product code has been copied yet. This branch currently records the reconciliation evidence and safe plan only.
