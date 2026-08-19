# HLC Backend Launch Acceptance

Backend launch acceptance remains open until the live production Supabase project and external provider paths are verified against the release candidate.

## Security classification

Supabase advisor warnings for `SECURITY DEFINER` functions are not automatically vulnerabilities. HLC intentionally uses privileged RPC boundaries for operations that must validate workspace/portal scope before writing protected tables.

### Intentional anonymous RPCs

- `submit_public_service_request`
- `submit_professional_application`
- `record_hlc_analytics_event`

The two intake RPCs retain request validation plus public-intake guards. `record_hlc_analytics_event` is a bounded first-party telemetry boundary: anonymous events resolve a workspace only from a configured site hostname, invalid/unresolved events return `null`, and the function does not expose protected workspace reads.

### Authenticated privileged RPCs

Authenticated `SECURITY DEFINER` RPCs must validate `auth.uid()` and the relevant workspace, portal link, record ownership, or role before performing privileged work. The launch audit verified these patterns on the current live database for core paths including workspace switching, lead creation, estimate conversion, communications, portal access, documents, agent actions, automation, and telephony configuration.

`log_google_voice_activity` delegates to the guarded `log_manual_communication_activity` function and does not independently bypass that authorization boundary.

## Verified against the current production hardening candidate

- [x] GitHub Launch Candidate #633 and Rendered Quality Gate #19 passed before backend hardening merge.
- [x] Backend hardening PR #54 merged at `9ef0a73cabdc312b005fbf01b1d02112008d04b4`.
- [x] Migration `backend_launch_hardening` is applied to production and appears in live Supabase migration history.
- [x] Supabase security and performance advisors were rerun after migration; targeted organization RLS and launch-critical FK findings were cleared. Remaining warnings are tracked separately and are not being hidden with unsafe changes.
- [x] Canonical Stripe checkout code attaches `workspace_id` and `plan_key` to subscription metadata. The observed failed `customer.subscription.created` event lacked required metadata and therefore did not match the canonical HLC checkout contract; processed subscription-update events and a persisted trialing subscription prove the webhook path is active.
- [x] Resend outbound transport has a persisted `sent` transmission and a production `send-communication` 200 response.
- [x] Production Resend webhook deployment drift was corrected by deploying the already-merged hardened `main` implementation (version 7).

## Remaining acceptance gates

- [ ] Leaked-password protection is enabled in Supabase Auth when supported by the current project plan.
- [ ] Core owner transaction journey is freshly verified against the final release candidate: sign in → workspace → lead → communication → schedule/job → dashboard data refresh.
- [ ] Stripe checkout/billing portal receives one fresh non-destructive canonical test-mode transaction through the HLC checkout path.
- [ ] A real Resend delivery callback reaches `resend-webhook` and persists a `communication_provider_events` row; outbound send alone does not prove inbound webhook delivery.
- [ ] No unresolved backend finding can cause unauthorized cross-workspace access, data loss, duplicate committed actions, false success state, or silent provider failure.

## Release rule

Backend launch acceptance closes only against the exact release-candidate SHA and live Supabase migration state. Advisor warnings that are expected by design must be documented; they must not be hidden with unsafe privilege changes solely to make a linter green.
