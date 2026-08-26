# HomeLead Connect — Post-Production Verification Checklist

Date: 2026-08-26
Purpose: verify production after the approved launch merge without confusing post-launch enhancements with production regressions.

## Operating rules

- Production truth comes from the actual production domain and production backend.
- Do not use a branch preview as evidence that production is healthy.
- A failure is only a release regression when the production behavior is actually broken or materially unsafe.
- Mobile A+ polish remains post-launch unless a production route/action is unusable.
- Do not silently alter billing, tenancy, RLS, authentication, or consequential AI permissions during stabilization.
- Keep every emergency fix narrow and separately certified.

---

# T+0 to T+15 minutes — Immediate production smoke

## Deployment

- [ ] Record final merged production `main` SHA.
- [ ] Confirm Cloudflare production deployment corresponds to that SHA.
- [ ] Confirm deployment completed successfully.
- [ ] Confirm production root loads over HTTPS.
- [ ] Confirm no unexpected redirect loop.
- [ ] Confirm favicon/logo/header assets load.

## Authentication

- [ ] Sign in from a clean iPhone Safari session.
- [ ] Sign in from a clean desktop browser session.
- [ ] Confirm authenticated shell loads without white screen.
- [ ] Confirm sign-out works.
- [ ] Confirm returning authenticated session restores normally.

## Core routes

- [ ] `/dashboard`
- [ ] `/leads`
- [ ] jobs workspace / job detail
- [ ] `/messages`
- [ ] `/documents`
- [ ] `/calendar`
- [ ] Provider Network
- [ ] Community
- [ ] Profile
- [ ] Settings
- [ ] Billing
- [ ] AI/agent workspace routes available to the authorized role

For every route above:

- [ ] no blank/white screen;
- [ ] no fatal JavaScript error visible to the user;
- [ ] primary content loads;
- [ ] navigation remains available;
- [ ] role restrictions remain intact.

## Sev-1 stop conditions

Stop normal post-launch work immediately if any of these occur:

- tenant data can be accessed across unauthorized workspaces;
- authentication is broadly unavailable;
- production is white-screening on core routes;
- destructive writes are occurring incorrectly;
- billing creates material charging/account-integrity risk;
- deployment points to the wrong environment/project.

---

# T+15 to T+60 minutes — Critical workflow verification

## Lead workflow

- [ ] Open existing lead.
- [ ] Confirm lead data renders.
- [ ] Confirm allowed follow-up/next-step controls render.
- [ ] Confirm lead-to-job/navigation links remain valid.
- [ ] If a safe test record exists, perform one reversible/non-destructive update and verify persistence.

## Job workflow

- [ ] Open existing job.
- [ ] Confirm job status/detail data renders.
- [ ] Confirm schedule/follow-up actions remain available according to role.
- [ ] Verify no unauthorized write surface appears.

## Native HLC Calendar

- [ ] Open day view.
- [ ] Open week view.
- [ ] Open month view.
- [ ] Confirm known appointment/event renders at expected date/time.
- [ ] Confirm significance marker, selected date, and today states remain distinct.
- [ ] Open appointment/event detail.
- [ ] If safe, exercise one reversible calendar action and verify persistence.

## Messages / Resend

- [ ] Open Messages.
- [ ] Confirm thread/list state loads.
- [ ] Send one controlled production-safe message if an approved test recipient is available.
- [ ] Verify UI send state.
- [ ] Verify delivery/webhook evidence when available.
- [ ] Confirm no duplicate sends.

## Documents

- [ ] Open Documents.
- [ ] Confirm workspace documents list.
- [ ] Confirm existing production upload remains accessible.
- [ ] Upload one small production-safe test file if appropriate.
- [ ] Confirm registration/storage/audit path completes.

## Provider Network

- [ ] Directory loads.
- [ ] Saved-provider state loads where expected.
- [ ] Tenant filtering remains correct.
- [ ] Map/list route does not white-screen.

## Community

- [ ] Community hub loads.
- [ ] Authorized participation surfaces render.
- [ ] Moderation controls appear only for authorized roles.

## Billing / Stripe

- [ ] Billing workspace loads.
- [ ] Displayed state is authoritative and not invented.
- [ ] Subscription/customer state corresponds to expected production data.
- [ ] No test-mode object is presented as production truth.
- [ ] Do not create a real charge merely to prove launch unless explicitly approved.

## AI / agents

- [ ] Kendrell loads where authorized.
- [ ] Dion loads where authorized.
- [ ] Diamond loads where authorized.
- [ ] Contextual agent UI does not obscure required controls.
- [ ] Consequential actions remain confirmation/audit gated.
- [ ] No agent receives wider role access than intended.

---

# T+1 to T+24 hours — Stabilization monitoring

## Production health

- [ ] Review Cloudflare deployment/runtime errors.
- [ ] Review Supabase Auth errors.
- [ ] Review database/API errors affecting core workflows.
- [ ] Review Edge Function failures.
- [ ] Review Resend delivery/failure events.
- [ ] Review Stripe webhook failures/retries.
- [ ] Check for repeated client-side white-screen/error reports.
- [ ] Check for unexpected spikes in auth/session failures.

## Data integrity

- [ ] Confirm new lead writes are workspace-scoped.
- [ ] Confirm job updates remain workspace-scoped.
- [ ] Confirm calendar event writes are workspace-scoped.
- [ ] Confirm document rows/storage references are correct.
- [ ] Confirm communications records are not duplicated.
- [ ] Confirm billing/subscription state is not drifting from Stripe authority.

## User-facing quality

- [ ] Review iPhone production shell on at least one real device after deployment caches settle.
- [ ] Review desktop production shell after deployment caches settle.
- [ ] Record any actual regression separately from polish.
- [ ] Do not reopen V1 for cosmetic requests that do not impair use.

## Incident classification

Use these categories:

- **Sev-1:** security/tenancy, broad auth outage, destructive corruption, production unavailable.
- **Sev-2:** core workflow unusable for a material user segment, major repeated white-screen route failure, billing integrity issue without active loss.
- **Sev-3:** localized workflow defect with workaround.
- **Post-launch hardening:** reliability/security improvement not currently breaking production.
- **Post-launch enhancement:** Mobile A+, OCR, optional integrations, UX polish, expanded analytics, etc.

---

# T+24 to T+72 hours — Early production review

- [ ] Confirm no unresolved Sev-1 incident.
- [ ] Confirm no unresolved Sev-2 incident requiring rollback.
- [ ] Review top production errors by frequency.
- [ ] Review authentication/session reliability.
- [ ] Review message delivery reliability.
- [ ] Review document upload reliability.
- [ ] Review Calendar usage/errors.
- [ ] Review Stripe webhook consistency.
- [ ] Review provider/network route behavior.
- [ ] Review agent invocation/audit behavior.
- [ ] Record real user feedback separately from internal polish preferences.
- [ ] Close any emergency hotfix branches that are no longer needed.

## Resume post-launch programs

When production is stable:

- [ ] Resume Mobile A+ Sprint 1 certification.
- [ ] Resolve GitHub Actions registration/account execution issue if still present.
- [ ] Complete Sprint 1 exact-head Launch Candidate + Rendered Quality gates.
- [ ] Complete Sprint 1 physical iPhone QA.
- [ ] Promote Sprint 1 only within the Mobile A+ program.
- [ ] Execute Sprints 2–7 sequentially using their acceptance matrix.
- [ ] Keep Mobile A+ work off production `main` until each promotion/release decision is explicitly made.

---

# T+3 to T+7 days — Post-launch baseline review

## Reliability

- [ ] No recurring white-screen route class.
- [ ] No recurring broad auth/session failure.
- [ ] No unresolved tenancy/security regression.
- [ ] No sustained message/webhook failure pattern.
- [ ] No sustained document storage/registration failure pattern.
- [ ] No sustained calendar persistence failure pattern.
- [ ] No sustained Stripe reconciliation issue.

## Product operations

- [ ] Leads workflow remains usable.
- [ ] Jobs workflow remains usable.
- [ ] Follow-ups remain usable.
- [ ] Provider Network remains usable.
- [ ] Community remains usable.
- [ ] Messages remain usable.
- [ ] Documents remain usable.
- [ ] Native Calendar remains authoritative and usable.
- [ ] Billing remains Stripe-authoritative.
- [ ] AI agents remain role/audit scoped.

## Post-launch backlog classification

Classify every new item as exactly one of:

1. Production regression.
2. Post-launch hardening.
3. Post-launch enhancement.
4. Mobile A+ program work.
5. Deferred integration.
6. Research / future roadmap.

Do not reopen the completed V1 baseline for item 2–6 unless a deliberate release is planned.

## Deferred items already known

- [ ] Google Calendar optional interoperability.
- [ ] OCR/extraction production hardening/promotion.
- [ ] Full Mobile A+ seven-sprint program.
- [ ] Advanced mobile analytics.
- [ ] Offline/retry and saved-state expansion.
- [ ] Large-data mobile administration patterns.
- [ ] Additional voice/dictation workflows.
- [ ] Optional communications/provider integrations.

---

# Production launch closeout

The launch stabilization window may be marked CLOSED when:

- [ ] production deployment is stable;
- [ ] no open Sev-1;
- [ ] no open launch-related Sev-2 requiring rollback;
- [ ] core route/workflow smoke checks pass;
- [ ] auth/session behavior is stable;
- [ ] communications/documents/calendar/billing integrity checks are acceptable;
- [ ] remaining work is classified as post-launch rather than release-blocking.

After closeout, normal post-launch sprint governance resumes.
