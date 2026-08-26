# HomeLead Connect — Production Launch Execution Runbook

Date: 2026-08-26
Owner: HomeLead Connect LLC
Repository: `homeleadconnectllc/HomeLeadConnect-Web`

## 1. Release boundary — locked

Production `main` remains frozen until explicit production merge approval.

Current production PR: #198 — `postlaunch/production-integration-20260825` → `main`

Certified exact production candidate:

`d19a826545e454306e776fe20f0aaf5a840ff3ab`

Production base:

`3db9f982ee36f903d6a098f66636fba71d852394`

Immutable candidate preview:

`https://a085ecaf.homeleadconnect-web.pages.dev`

Branch preview:

`https://postlaunch-production-integr.homeleadconnect-web.pages.dev`

No post-launch enhancement, Mobile A+ sprint, documentation branch, or experimental integration may alter this certified candidate before explicit production approval.

## 2. What is already launch-certified

Status: AUTOMATED / SYSTEM EVIDENCE GREEN

- HLC Launch Candidate #1083: PASS.
- HLC Rendered Quality Gate #469: PASS.
- Acceptance suite: 399/399 PASS.
- Launch static audit: 178/178 PASS.
- TypeScript/Vite production build: PASS.
- npm production dependency audit: 0 vulnerabilities.
- Exact-head Cloudflare deploy: PASS.
- Security / tenancy hardening: verified for launch.
- Resend message delivery path: verified end-to-end.
- Workspace document upload path: verified end-to-end.
- HLC Native Calendar: verified for launch.
- Growth analytics aggregate path: verified.
- Stripe-backed billing workspace contract: verified at launch/runtime contract level.
- Provider Network tenant boundary: verified.
- Community participation foundation: verified.
- AI / automation consequential writes remain confirmation/audit scoped.

## 3. Explicitly NOT launch blockers

These remain post-launch work and must not reopen the certified V1 release without a genuine new production regression.

- Mobile A+ Sprint 1–7 program.
- Current GitHub Actions registration/startup problem on Mobile A+ Sprint 1.
- Google Calendar interoperability.
- OCR / extraction production promotion.
- Additional mobile polish that is not a functional launch regression.
- Optional provider/browser telephony enhancements.
- Further analytics depth and large-data mobile optimization.

## 4. Remaining pre-launch gates

### Gate A — final iPhone production candidate sweep

Status: HUMAN OBSERVATION REQUIRED

Use the certified production-candidate preview, not a Mobile A+ branch.

Required compact-screen checks:

- Sign in successfully.
- Authenticated shell loads without white screen.
- Five-tab navigation works: Home / Work / Network / Community / More.
- Dashboard/Home renders without overlap, clipping, or unusable controls.
- Leads opens and primary actions are usable.
- Jobs opens and job detail is usable.
- Messages opens and composer is usable.
- Documents opens and workspace upload remains available.
- Native HLC Calendar opens and day/week/month navigation works.
- Appointment/native-event detail can be opened.
- Provider Network opens.
- Community opens.
- Profile / Settings / Billing open without route failure.
- Contextual agent surface does not obscure required controls.
- Bottom navigation clears the iPhone home indicator.
- Keyboard does not permanently trap/cover required controls.
- No route produces a blank/white screen.

PASS declaration required from a real device: `iPhone QA PASS`.

Any real blocker found here gets one narrow release-line fix, a new exact candidate SHA, and full exact-head recertification.

### Gate B — final Mac/desktop production candidate sweep

Status: HUMAN OBSERVATION REQUIRED

Required checks:

- Sign in successfully.
- Dashboard and navigation render correctly.
- Leads / Jobs / Messages / Documents / Calendar / Network / Community open without route failure.
- Shared responsive components have no desktop regression.
- No severe spacing, clipping, hidden primary action, unreadable form, or white-screen defect.

PASS declaration required: `Mac QA PASS`.

Any real blocker follows the same narrow-fix + exact-head recertification rule.

### Gate C — final exact release reconciliation

Status: AUTOMATABLE AFTER A + B

Immediately before production approval:

1. Re-fetch PR #198.
2. Confirm base is still `main`.
3. Confirm base SHA is still the expected production base or explicitly reconcile any legitimate movement.
4. Confirm head remains the certified candidate SHA unless a defect-only recertification occurred.
5. Confirm PR is mergeable.
6. Reconfirm exact-head automated evidence.
7. Confirm no unresolved review thread represents a release blocker.
8. Confirm deployment target/environment is production.
9. Record rollback SHA (pre-launch `main`).

### Gate D — explicit production merge approval

Status: OWNER APPROVAL REQUIRED

Do not merge PR #198 to `main` until the owner explicitly sends:

`APPROVE PRODUCTION MERGE`

This is intentionally separate from iPhone/Mac QA declarations.

## 5. Production cutover execution

After Gate D only:

1. Merge PR #198 using the approved merge strategy and expected exact head SHA.
2. Record resulting production `main` SHA.
3. Confirm Cloudflare production deployment starts for that SHA.
4. Confirm deployment completes successfully.
5. Open production domain on a clean session.
6. Run the immediate post-production checklist in `HLC_POST_PRODUCTION_CHECKLIST.md`.
7. If a release-blocking regression appears, stop feature work and use the rollback/hotfix procedure below.

## 6. Rollback / emergency hotfix rule

Rollback is for genuine production regressions only, including:

- white-screen production failure;
- authentication unavailable for normal users;
- major tenant boundary/security failure;
- destructive workflow malfunction;
- core lead/job/calendar/messages/documents route unavailable;
- billing state materially wrong in a way that risks charging/account integrity.

Procedure:

1. Freeze all post-launch merges.
2. Preserve production evidence/logs.
3. Identify whether fastest safe recovery is revert or narrow hotfix.
4. Use a dedicated emergency branch from production.
5. Apply the smallest possible change.
6. Run launch verification and rendered quality gates on the exact hotfix SHA.
7. Human-check the affected production workflow.
8. Merge only the verified recovery.
9. Document root cause after service is restored.

Do not bundle polish or unrelated fixes into an emergency hotfix.

## 7. Mobile A+ relationship to launch

Mobile A+ is a post-launch quality program, not a prerequisite for the already-certified production candidate.

Current Mobile A+ Sprint 1 PR: #199.

Current Sprint 1 exact head:

`c2b7e805da5e5c940e9900294cc6d50131025ee7`

Current Sprint 1 state: IMPLEMENTED / BLOCKED ON GITHUB ACTIONS REGISTRATION + HUMAN DEVICE QA.

Rules:

- Keep Mobile A+ branches isolated from production `main`.
- Do not lower CI or rendered thresholds.
- Do not treat automated QA as physical-device QA.
- Do not promote a Mobile A+ sprint without its required evidence.
- Resume Mobile A+ after production stabilization without reopening the frozen V1 launch baseline for polish.

## 8. Launch status board

| Area | Status | Launch blocker? | Next action |
|---|---|---:|---|
| Production candidate code | Certified | No | Keep frozen |
| Launch Candidate gate | PASS | No | Preserve evidence |
| Rendered Quality gate | PASS | No | Preserve evidence |
| Cloudflare candidate deploy | PASS | No | Preserve exact preview |
| Security / tenancy | Verified | No | Post-launch monitor |
| Resend | Verified E2E | No | Post-launch monitor |
| Documents | Verified E2E | No | Post-launch monitor |
| Native Calendar | Verified | No | Post-launch monitor |
| iPhone final sweep | Pending human | YES | Real-device declaration |
| Mac final sweep | Pending human | YES | Real-device declaration |
| Production merge approval | Pending owner | YES | `APPROVE PRODUCTION MERGE` |
| Mobile A+ Sprint 1 | Blocked on Actions registration | No | Continue post-launch program |
| Google Calendar | Deferred | No | Optional post-launch |
| OCR production | Deferred | No | Post-launch hardening/enhancement |

## 9. Definition of launched

HomeLead Connect is considered production-launched only when all of the following are true:

- final iPhone QA declaration recorded;
- final Mac QA declaration recorded;
- exact release candidate reconciled immediately before merge;
- explicit production merge approval recorded;
- PR #198 merged to `main`;
- production Cloudflare deployment for the resulting `main` SHA completes;
- immediate production smoke checks pass;
- no Sev-1/Sev-2 regression is open.

Automated green evidence alone is not the definition of production launch.
