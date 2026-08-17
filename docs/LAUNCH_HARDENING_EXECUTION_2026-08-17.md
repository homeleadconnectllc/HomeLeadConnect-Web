# HomeLead Connect launch hardening — 2026-08-17

## Official destinations

- Account sign-in: `https://app.homeleadconnect.org/login`
- Workspace dashboard: `https://app.homeleadconnect.org/dashboard`
- Kendrell Command: `https://app.homeleadconnect.org/hq`
- Kendrell dedication: `https://app.homeleadconnect.org/hq/dedication`
- Dion operations: `https://app.homeleadconnect.org/operations`
- Diamond customer experience: `https://app.homeleadconnect.org/customer-experience`

These are the only canonical production destinations. Preview, deploy, and query-string release URLs are not customer-facing links.

## Automated evidence

| Area | Status | Evidence |
| --- | --- | --- |
| Candidate integrity | PASS locally; exact-head CI required | 110 acceptance contracts and 177 launch static checks passed. |
| Login and Turnstile | PASS for anonymous rendering and route protection | Production browser rendered the Turnstile-protected login page; anonymous `/hq` redirected to `/login`. Credential completion remains a real-account test. |
| Route wiring | PASS contract | Every launch navigation link resolves to one declared route; Kendrell command and dedication are distinct destinations. |
| Role access | PASS contract | Kendrell routes are owner/manager-only and account access resolution fails closed. |
| Like/Pass persistence | PASS contract | Matching persistence, ownership, membership and foreign-key regression contracts passed. |
| App installation | PASS metadata | Manifest starts at `/app`; the approved 1024x1024 HLC icon is declared for standard and maskable installation. |
| Cache update behavior | PASS contract | Service-worker registration bypasses cached worker scripts and requests an update without an automatic reload loop. |
| Database posture | REVIEW REQUIRED | Production Supabase is healthy. Security-advisor findings for authenticated `SECURITY DEFINER` RPCs and RLS tables without policies require function-by-function classification; they were not blindly changed. |

## Access matrix

| Destination | Owner | Manager | Technician | Customer / contractor / visitor |
| --- | --- | --- | --- | --- |
| Kendrell Command and dedication | Allow | Allow | Deny | Deny |
| Dion operations | Allow | Allow | Assigned operational access only | Deny |
| Diamond customer experience | Allow | Allow | Assigned operational access only | Deny |
| Billing authority | Allow | Deny | Deny | Deny |

Backend RLS remains the authority for data. Hiding a navigation item is presentation, not authorization.

## Human-only launch certification

Antoine Washington must record the final outcome for tests that require physical identity, hardware, carrier, or external money movement:

1. Sign in on a physical iPhone with separate owner, manager and non-management accounts; refresh each protected route and confirm the matrix above.
2. Install from Safari using **Add to Home Screen**, launch from the HLC icon, and confirm the app opens at the signed-in workspace.
3. Place a real Google Voice/phone call, return to HLC, confirm the outcome is logged automatically where available, and save a disposition/follow-up.
4. Send a real text/notification and confirm delivery, deep-link destination, permission denial, and disable/re-enable behavior.
5. If billing is launch-critical, run a controlled Stripe checkout, webhook, portal and cancellation test with a designated test account.
6. Verify the production backup/PITR setting and complete a documented restore drill into a non-production target.
7. Confirm family approval and rights for any authentic memorial photographs before publishing them.

## Merge and rollback rule

Merge only after the clean GitHub exact-head workflow passes lint, acceptance tests, launch audit, TypeScript compilation and production build. Preserve the immediately previous production commit as the rollback target, and do not certify launch until Antoine signs the physical-device and external-provider record.
