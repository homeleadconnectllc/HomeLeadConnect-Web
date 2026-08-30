# HLC Next Work Reconciliation — 2026-08-30

## Protected production baseline

- `main`: `b559ee4a27b003a45d3391f49a91b6214115e4c2`
- PR #219: merged and closed
- HLC Production Verification #80: PASS on the exact merge SHA

This baseline is frozen. Do not reopen or rewrite the certified PR #219 fixes unless a new live production regression is observed.

## Why a reconciliation branch is required

Several older post-launch PRs are still open, but they were built from stale production baselines. They must not be merged directly into the new protected `main`.

The current highest-value unfinished program is the global launch-readiness / hardening work represented by PR #210. PR #210 is materially stale relative to current production: its head is 20 commits ahead of its old merge base but 329 commits behind the current protected baseline. Therefore its work must be selectively reconciled onto a fresh branch rather than merged as-is.

## Current reconciliation branch

`postlaunch/next-work-reconciliation-20260830`

Created directly from protected production SHA `b559ee4a27b003a45d3391f49a91b6214115e4c2`.

## First workstream to reconcile

Source: PR #210 — Global launch-readiness research and hardening.

Candidate files/features to inspect one-by-one against current production before carrying anything forward:

- `docs/HLC_GLOBAL_LAUNCH_READINESS_RESEARCH_2026-08-27.md`
- `src/ai/agentQualityContract.ts`
- `src/ai/agentQualityContract.test.ts`
- `src/ai/agents.ts`
- `src/ai/agents.test.ts`
- `src/components/Navbar.tsx`
- `src/components/accessibility/MobileNavigationDialogAccessibility.tsx`
- `src/pages/dashboard/Notifications.tsx`
- `src/styles/global-launch-utility-header.css`
- `src/styles/AuthenticatedStyles.tsx`
- related route / visual acceptance contracts
- `supabase/functions/hlc-agent-chat/index.ts`

## Reconciliation rules

1. Current `main` wins every conflict by default.
2. Do not cherry-pick the stale PR wholesale.
3. Carry forward only behavior that is still missing from current production.
4. Preserve the already-certified iPhone/login/Command Center/request-service fixes from PR #219.
5. No direct production mutation while reconciling.
6. Each recovered change must receive fresh exact-head tests, rendered/visual evidence where applicable, and a new Cloudflare branch preview.
7. Human device QA remains required for user-visible mobile or desktop changes before any production promotion.

## Stale open PR handling

Older open PRs such as #210, #205, #204, #202, #196, #195, and #192 are evidence sources only until reconciled against the protected baseline. Their old green checks do not certify them against current `main`.

## Immediate execution order

1. Diff PR #210 candidate files against protected `main`.
2. Classify each item as already present, obsolete/conflicting, or still missing.
3. Port only still-missing safe changes to this branch.
4. Run fresh exact-head CI and branch deployment.
5. Continue through the next highest-value unfinished item only after this batch is stable.
