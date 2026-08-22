# HomeLead Connect — Codex Functional Completion Handoff

## Objective
Finish HomeLead Connect as a genuinely operating application, not just a complete route map. Work from current `main` and preserve the existing production architecture unless a verified defect requires change.

## Production source of truth

For production verification, incident response, and launch certification, use Supabase project **`cguhtshclyybivvdnpig`**.

- Production API URL: `https://cguhtshclyybivvdnpig.supabase.co`
- `app.homeleadconnect.org` is explicitly pinned to this project in `src/lib/supabase.ts`.
- `.env.production` must point to the same project and its active browser-safe publishable key.
- Do **not** use `agfwqnirspmptjiqrrtk` as production evidence for agent/runtime certification.
- Before diagnosing a production runtime defect, first verify the project ref used by the live frontend and inspect logs/data in that same project.
- Current certified AI runtime baseline (2026-08-21): `hlc-agent-chat` v16 and `hlc-agent-voice` v15 on `cguhtshclyybivvdnpig`; authenticated Kendrell runs have succeeded with `gpt-5.6-terra`, `fallback: false`, and `error_code: null`.

Current production head context:
- desktop full-width fix: `5c24095ba93b71b6f6980736e29eab1a712e00fe`
- obsolete ecosystem-readiness surface removed: `e5a3cfb7d4238517e7301f72cb3afed4902f7910`
- production verification for `e5a3cfb...` completed successfully
- GitHub tracking issue: `#6` — `Codex handoff: finish HLC functional completion and verification`

## Non-negotiable product standard
For every major surface, verify real behavior rather than route existence:

1. Data loads from the authoritative Supabase source.
2. Create/update/delete actions exist where the product requires them.
3. Permissions, RLS, and access-policy behavior match role intent.
4. Empty states are truthful and usable.
5. No placeholder/inert controls or stale `MISSING` / `UNPROVEN` audit UI.
6. Mobile and desktop both work without overflow or unusable fixed overlays.
7. End-to-end workflows persist state correctly.
8. Errors are surfaced clearly; never fabricate success.

## Priority audit order

### Core operator flow
- `/dashboard`
- `/leads`
- `/estimator`
- `/jobs`
- `/jobs/:jobId`
- `/calendar`
- `/follow-ups`
- `/documents`
- `/call-center`
- `/manual-communications`
- `/notifications`

### Golden workflow
Prove and repair as needed:

`Request -> Lead -> LeadScope/Estimate -> Provider eligibility/offer -> Provider acceptance -> Appointment -> Job -> Completion -> Review/referral/community continuation`

### Provider / network
- `/providers`
- `/providers/:providerId`
- `/map`
- `/network/map`
- `/matching`
- `/network/service-areas`
- `/network/availability`
- `/network/saved`

### Resident portal
- `/homeowner-portal`
- requests
- appointments
- jobs
- documents
- profile/settings
- properties
- matches

### Professional portal
- `/contractor-portal`
- profile
- services
- documents
- team
- professional application / verification path

### Community
- `/community-hub`
- discussions
- reviews
- referrals
- events
- moderation
- groups

### Owner / operations / agents
- `/hq`
- `/operations`
- `/customer-experience`
- `/hq/approvals`
- `/hq/system-health`
- contextual agent dock on relevant pages

### Billing / settings
- `/settings`
- `/settings/billing`
- Stripe checkout
- trial consent
- webhook-backed entitlement state
- billing portal
- never treat a return URL as entitlement proof

## Architecture and contracts to preserve
- Vite + React + React Router
- Supabase Auth + Postgres + RLS
- workspace tenancy via `workspace_id`
- single-writer lead ingestion model
- browser clients must not gain direct mutation paths to `public.leads`
- Cloudflare Pages is the canonical production and preview app host
- locked agent identities: Kendrell, Dion, Diamond
- provider-agnostic device-native communications must never fabricate delivery/receipt state

## Verification
Run and keep green:

```bash
npm run verify:launch
```

This currently covers:
- lint
- acceptance tests
- static launch audit
- production build

Add focused tests for every real defect fixed. Extend `scripts/launch-static-audit.mjs` when a regression can be caught statically.

## Execution rules
- Work on a dedicated branch, not directly on `main`.
- Keep commits narrow and descriptive.
- Do not delete working features to make tests pass.
- Do not mask broken features by removing controls unless the feature is intentionally unsupported and the UI clearly explains the boundary.
- Do not alter production secrets.
- Do not introduce service-role or elevated keys into client code.
- Do not weaken RLS or security-definer boundaries to make flows work.
- Do not claim a feature passes until its interaction and persistence are verified.

## Required completion deliverable
Open a PR to `main` containing:

- concise defect/completion matrix by surface
- exact files changed
- tests added
- `npm run verify:launch` result
- remaining external blockers, only if truly external
- manual acceptance checklist for Mac desktop and iPhone

## Target state
- no stale readiness UI
- no inert product surfaces
- every supported HLC workflow works end to end with real persistence and authorization
- Mac desktop uses the authenticated workspace width correctly
- iPhone remains responsive and usable
- no feature is labeled complete unless it is actually operating
