# HomeLead Connect — Launch Test Execution Record

Date: August 17, 2026  
Owner: Antoine Washington  
Tested branch: `agent/functional-completion`  
Tested candidate: `a00a99a20a8446ea6f3bbe739033f2a2aac0c985`  
QA deployment: `https://hlc-functional-e2e-641b807e.netlify.app`  
Production branch: `main` at `52e0190516607173e12d7eff3bb4adac6c48bf40` — not modified

## Decision

**NO-GO.** The first broken end-to-end boundary is Cloudflare Turnstile at authentication. A dedicated Apple touch icon is also missing. Dependent authenticated browser tests were stopped rather than reported as passing without valid evidence.

## Evidence summary

| Launch area | Result | Recorded evidence |
|---|---|---|
| Candidate integrity | PASS | Remote branch was `a00a99a…`; Launch Candidate #526, Netlify Branch Runtime #327 and Netlify E2E QA #324 passed for that exact SHA. |
| Public route and responsive baseline | PASS | `/hq` redirected signed-out traffic to `/login`; login rendered without an application overlay. At 1363×936, the main region was centered and body width did not overflow the viewport. |
| Login and Turnstile | BLOCKED | Turnstile script and response input loaded, but no challenge iframe or browser API appeared, token length remained zero, and Sign in stayed disabled. The supplied physical-iPhone screenshot independently showed the Cloudflare connection error. |
| Physical iPhone approval | PENDING — OWNER DEVICE | Antoine must repeat the route, rotation, larger-text, bottom-control and tap tests after Turnstile is fixed. |
| Dashboard and AI agents | BLOCKED BY AUTH | Static/automated candidate gates passed, but signed-in browser and physical-device behavior could not be certified past the failed auth boundary. |
| Like/Pass persistence | PARTIAL PASS | Production rollback-only SQL proved an authenticated member can insert, update and delete their own decision under RLS, leaving no test rows. iPhone refresh/reopen persistence remains blocked by auth. |
| Golden workflow | BLOCKED BY AUTH | Request → lead → estimate → assignment → appointment → job was not mutated in production and could not be certified through the signed-in UI. |
| Communications and notifications | BLOCKED BY AUTH | Relevant production Edge Functions are active, but no message, call, voice note or notification was sent during this run. No external communication was triggered. |
| Billing | PARTIAL PASS | Stripe Edge Functions are active and the price contract is covered by candidate tests. No live charge, webhook certification transaction or portal mutation was performed. |
| Database and matching security | PASS WITH FOLLOW-UP | Production migration `20260817111451`, matching RLS/policies, private storage buckets and hourly scan were verified. Fresh advisors found policy/index items requiring review before launch. |
| Backups and rollback | PENDING | Backup/PITR configuration and a non-destructive restore drill were not provable through the available interface. Previous `main` SHA is recorded; no rollback was executed. |
| App installation and family sharing | BLOCKED | Manifest uses `/app`, standalone mode and the HLC logo. `index.html` lacks `rel="apple-touch-icon"` and no dedicated Apple icon asset exists; fresh-device family-share behavior remains unverified. |
| Merge and production sequence | NOT STARTED | `main` remained untouched. Merge is prohibited while blocking gates remain. |
| Antoine final approval | NOT SIGNED | Only Antoine may record final approval after physical-iPhone and production certification. |

## Environment separation

The QA deployment uses Supabase project `agfwqnirspmptjiqrrtk` (`hlc-reconciliation-test`). Production is project `cguhtshclyybivvdnpig` (`homeconnect`). QA workflow success is not production certification.

## Production database evidence

- Latest recorded production migration: `20260817111451`.
- Community Matching RLS is enabled with four policies.
- Anonymous matching privileges are absent; authenticated operations remain constrained by RLS.
- An existing authenticated member completed own insert/update/delete in a transaction; the transaction was rolled back and zero test matching rows remained.
- `hlc-documents` and `communication-voice-notes` are private buckets.
- The Community Matching scan cron exists once on its hourly schedule.
- Fresh advisors were executed. RLS-enabled/no-policy informational findings, multiple-permissive-policy warnings and unused-index findings require explicit remediation or documented acceptance.

## Required path to launch

1. Fix Turnstile loading/token issuance on the QA hostname and verify sign-in is enabled.
2. Add and wire a dedicated iOS Apple touch icon; verify Add to Home Screen launches `/app`.
3. Rerun exact-head workflows after those changes.
4. Complete authenticated browser and physical-iPhone checks in checklist order.
5. Review/resolve Supabase advisor findings; record backup/PITR and restore-drill evidence.
6. Complete controlled communications, notification and Stripe certification without simulated success.
7. Record final candidate, QA permalink and rollback SHA.
8. Obtain Antoine’s explicit final approval; only then merge through the normal reviewed release path and perform production smoke certification.

## Approval record

Owner decision: `NOT APPROVED`  
Owner: Antoine Washington  
Reason: Turnstile and Apple install metadata are blocking; physical-iPhone and production certification remain incomplete.
