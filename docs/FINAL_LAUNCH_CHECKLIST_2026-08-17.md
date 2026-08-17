# HomeLead Connect — Final Launch Checklist

Date prepared: August 17, 2026  
Owner: Antoine Washington  
Release branch: `agent/functional-completion`  
Verified application candidate before this checklist: `f7c7edce68563e7799d782584ad6ecdc4f8105f6`  
Production branch: `main` — **DO NOT MERGE until every blocking item below is PASS**

## Status key

- **PASS** — supported by recorded evidence for the stated candidate/environment.
- **PENDING** — must be completed before launch approval.
- **BLOCKED** — launch must stop until corrected and reverified.
- **N/A** — intentionally excluded from this release with truthful unavailable UI.

## 1. Candidate integrity

| Gate | Status | Required evidence |
|---|---|---|
| Release work is isolated on `agent/functional-completion` | PASS | `main` remained untouched during candidate work. |
| Launch Candidate workflow | PASS | GitHub Actions run #525 passed for `f7c7edce…`. |
| Netlify Branch Runtime | PASS | GitHub Actions run #326 passed for `f7c7edce…`. |
| Isolated Netlify E2E QA deployment | PASS | GitHub Actions run #323 passed for `f7c7edce…`. |
| Focused agent/product regression contracts | PASS | 27/27 passed. |
| Launch static audit | PASS | 177/177 passed. |
| Final release commit is recorded before merge | PENDING | Replace the candidate SHA above with the final checklist commit SHA and require exact-head gates to pass. |

## 2. Brand and responsive acceptance

| Gate | Status | Acceptance requirement |
|---|---|---|
| HLC palette | PASS | Navy, royal blue, light blue/cyan, white and blue-gray only on the updated agent experience. |
| Kendrell memorial composition | PASS | Centered structure, controlled mobile typography, equal legacy cards and symbolic-image disclosure are contract-covered. |
| Kendrell, Dion and Diamond identity assets | PASS | Locked portrait paths remain unchanged and independently attributed. |
| 320–430 px containment | PASS | Static responsive contracts prevent horizontal overflow and enforce centered route gutters. |
| Latest physical iPhone visual acceptance | PENDING | Antoine checks `/dashboard`, `/hq`, `/operations`, `/customer-experience`, `/matching`, `/messages`, and `/settings` at normal text size and one larger Accessibility text size. |
| Mobile controls do not cover content | PENDING | On iPhone, scroll every tested page to its final control and confirm the work dock, agent bubble and bottom navigation never prevent tapping or reading it. |
| Landscape and rotation recovery | PENDING | Rotate once on an authenticated page, return to portrait and confirm no clipping, misplaced dock or forced refresh. |

## 3. Authentication and account entry

| Gate | Status | Acceptance requirement |
|---|---|---|
| Public login route loads without an application error overlay | PASS | Cloud-browser check reached `/login`, rendered meaningful content and found no Vite error overlay. |
| Email/password login | PENDING | Real owner account signs in, reaches the authorized dashboard and survives one refresh. |
| Logout and second login | PENDING | Session clears completely; a new login returns to the intended HLC route. |
| Password recovery | PENDING | Recovery email, callback, new password and subsequent login complete on the production-intended hostname. |
| Email-link login, if visible | PENDING | Complete it end to end or hide it before launch. |
| Cloudflare Turnstile | PENDING | The widget must show a successful usable state on iPhone. A persistent “Unable to connect to website / Troubleshoot” state is not launch-approved even if another login path happens to work. |
| Unverified social/phone providers | N/A | Keep hidden until each provider is configured and passed end to end. |

## 4. Core owner experience

| Gate | Status | Acceptance requirement |
|---|---|---|
| Dashboard command center | PASS | Business Pulse, agent workspaces and primary operational destinations are present in the verified candidate. |
| Every dashboard card opens its intended HLC route | PENDING | Tap every visible card once on iPhone; no card may return to the marketing homepage, a 404 or an unrelated module. |
| Persistent bottom navigation | PENDING | Home, Leads, Jobs, Messages and More open the correct internal routes and show the correct active state. |
| Mobile work actions | PENDING | Call, Text, Schedule, Follow Up and Voice Note open the intended internal tool without duplicate submissions. |
| Kendrell guidance | PENDING | “Ask Kendrell,” guidance panel, prompt entry and dismissal work without covering the active page. |
| Dion and Diamond workspaces | PENDING | Each loads the correct locked identity, role copy, available capabilities and handoff destination. |
| AI provider truthfulness | PENDING | Configured agents respond; unconfigured providers clearly report setup required and never pretend a model action occurred. |
| Agent voice quality | PENDING | Hear Kendrell, Dion and Diamond on a physical iPhone; verify playback, stop/replay behavior and truthful failure state. |

## 5. Golden workflow and data persistence

| Gate | Status | Acceptance requirement |
|---|---|---|
| Production migration chain and database controls | PASS | Canonical release plan records the deployed production chain, RLS hardening and Community Matching ownership certification. |
| Community Matching Like | PENDING | Like a provider on iPhone, refresh, reopen Matching and confirm the decision persists. |
| Community Matching Pass | PENDING | Pass a different provider, refresh, reopen Matching and confirm the decision persists. |
| Matching privacy | PENDING | A second authenticated identity cannot read or alter the first user’s decisions. |
| Request → Lead | PENDING | Submit one production-safe launch test request and confirm one canonical lead—never duplicates—is created. |
| Lead → LeadScope | PENDING | Open the same lead, complete an estimate and confirm totals and evidence state persist. |
| Assignment → Appointment → Job | PENDING | Complete one controlled workflow through provider assignment, scheduling and job completion with correct timestamps and ownership. |
| Refresh persistence | PENDING | Refresh after each major state transition; the UI must return from canonical stored data. |
| Cross-workspace denial | PENDING | Direct IDs/routes from another workspace fail closed without leaking record details. |

## 6. Communications, alerts and documents

| Gate | Status | Acceptance requirement |
|---|---|---|
| Messages and Chat History | PENDING | Send one approved test message, refresh and confirm it remains in the correct conversation only. |
| Voice note | PENDING | Record, send, reload and replay one short test voice note on iPhone. |
| Call and text logging | PENDING | Record one controlled outbound activity and verify the canonical history entry. |
| Notifications | PENDING | Receive one launch-safe notification; foreground and background taps must open only an internal HLC route. |
| Device-alert disable | PENDING | Disable on one device and confirm it does not silently re-enroll. |
| Document/photo/video evidence | PENDING | Upload one allowed small test file, view through an authorized relationship and confirm an unauthorized identity is denied. |
| External provider unavailable states | PENDING | Any provider not production-configured must be disabled or clearly labeled unavailable—never simulated. |

## 7. Billing and public truth

| Gate | Status | Acceptance requirement |
|---|---|---|
| Public launch price | PASS | Candidate contracts use the approved `$49.99/month` launch price and contain no legacy `$99` public subscription copy. |
| Live Stripe product/price configuration | PASS | Production readiness evidence records the approved live Product and Price. |
| Signed live webhook proof | PENDING | One controlled live or approved production-certification transaction proves signature verification, idempotency and entitlement persistence. |
| Customer portal | PENDING | Authorized customer opens the live portal, returns safely to HLC and cannot gain access through a return URL alone. |
| Billing-disabled behavior | PENDING | If billing is not being launched, keep it disabled and remove/disable every purchase claim and control. |
| Refund/cancel/support wording | PENDING | Visible launch copy matches the actual Stripe/customer-support process approved by Antoine. |

## 8. Security, monitoring and recovery

| Gate | Status | Acceptance requirement |
|---|---|---|
| Secrets remain server-side | PASS | No service-role, Stripe secret, provider credential or private signing material is exposed to Vite/browser code. |
| Supabase leaked-password protection | PENDING | Enable and verify in the production Auth settings. |
| Fresh Supabase security/performance advisors | PENDING | Capture results after the final production migration state; resolve launch-relevant findings or document approved exceptions. |
| Error and Edge Function monitoring | PENDING | Confirm alerts for auth, intake, billing, invitation, communication and agent failures without logging sensitive content. |
| Backup policy | PENDING | Record the active backup/PITR setting. |
| Restore drill | PENDING | Complete and document a non-destructive restore test; configured backup alone is not recovery proof. |
| Rollback package | PENDING | Record previous production app SHA, final migration inventory, feature flags and rollback owner before merge. |

## 9. Installation and family share test

| Gate | Status | Acceptance requirement |
|---|---|---|
| Shareable app link | PENDING | The shared link opens the HLC app entry point—not the Carrd/marketing homepage. |
| iPhone Add to Home Screen | PENDING | Install from Safari; the approved HLC icon and app name appear correctly. |
| Home-screen launch destination | PENDING | Opening the installed icon returns to HLC and preserves or safely requests authentication. |
| Fresh-device test | PENDING | Antoine’s mother or another approved tester opens the shared link on a device without the existing developer session and can understand the next step without assistance. |

## 10. Release sequence

Complete these steps in order. Do not skip ahead after a failure.

1. Finish every **PENDING** item in sections 2–9 that is in the launch scope.
2. Mark intentionally excluded capabilities **N/A** and make their UI unavailable or truthful.
3. Fix every failure on `agent/functional-completion`; rerun the complete exact-head gates.
4. Record the final candidate SHA and preserve the QA permalink.
5. Antoine performs the final physical-iPhone acceptance and records **APPROVED** below.
6. Review the branch diff and migration inventory one final time.
7. Merge the approved candidate into `main` using the repository’s normal reviewed release procedure.
8. Require Netlify production to build the exact merged `main` SHA with production environment variables.
9. Verify the production hostname, authentication, primary routes and one controlled golden workflow.
10. Review fresh production Auth/API/Edge/Netlify logs.
11. Record production SHA, deployment URL/time, migration versions, feature flags and rollback target.
12. Announce launch only after the post-deploy checks are PASS.

## 11. Final decision record

**Current decision: NO-GO / PENDING PHYSICAL AND PRODUCTION CERTIFICATION**

Database controls and the automated branch candidate are in a passing state. This is not yet final public-launch approval because authentication, Turnstile, latest iPhone behavior, end-to-end persistence, production provider behavior, recovery evidence and post-merge production verification still require certification.

Final candidate SHA: `________________________________________`  
QA permalink: `________________________________________`  
Production SHA: `________________________________________`  
Production deploy time: `________________________________________`  
Rollback SHA: `________________________________________`  

Owner decision: `APPROVED / NOT APPROVED`  
Owner: Antoine Washington  
Date/time: `________________________________________`  
Notes: `________________________________________________________________`
