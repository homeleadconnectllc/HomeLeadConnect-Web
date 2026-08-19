# HLC Backend Launch Acceptance

Backend launch acceptance remains open until the live production Supabase project and external provider paths are verified against the release candidate.

## Security classification

Supabase advisor warnings for `SECURITY DEFINER` functions are not automatically vulnerabilities. HLC intentionally uses privileged RPC boundaries for operations that must validate workspace/portal scope before writing protected tables.

### Intentional anonymous RPCs

- `submit_public_service_request`
- `submit_professional_application`

Both are public intake boundaries. They must remain callable without a signed-in user and must retain form enablement, request-id idempotency, honeypot/rate-limit intake guards, and input validation.

### Authenticated privileged RPCs

Authenticated `SECURITY DEFINER` RPCs must validate `auth.uid()` and the relevant workspace, portal link, record ownership, or role before performing privileged work. The launch audit verified these patterns on the current live database for core paths including workspace switching, lead creation, estimate conversion, communications, portal access, documents, agent actions, automation, and telephony configuration.

`log_google_voice_activity` delegates to the guarded `log_manual_communication_activity` function and does not independently bypass that authorization boundary.

## Remaining acceptance gates

- [ ] GitHub launch candidate and rendered quality gates pass for the backend hardening migration.
- [ ] Migration is applied to the live Supabase project and migration history remains aligned with the repository.
- [ ] Supabase security advisor is rerun and all remaining warnings are classified as intentional or non-blocking.
- [ ] Supabase performance advisor is rerun; launch-critical FK and RLS warnings are cleared or explicitly accepted.
- [ ] Leaked-password protection is enabled in Supabase Auth when supported by the current project plan.
- [ ] Core owner transaction journey is verified: sign in → workspace → lead → communication → schedule/job → dashboard data refresh.
- [ ] Stripe checkout/billing portal and webhook behavior are verified with non-destructive test-mode transactions.
- [ ] Resend send/webhook persistence and retry behavior are verified.
- [ ] No unresolved backend finding can cause unauthorized cross-workspace access, data loss, duplicate committed actions, false success state, or silent provider failure.

## Release rule

Backend launch acceptance closes only against the exact release-candidate SHA and live Supabase migration state. Advisor warnings that are expected by design must be documented; they must not be hidden with unsafe privilege changes solely to make a linter green.
