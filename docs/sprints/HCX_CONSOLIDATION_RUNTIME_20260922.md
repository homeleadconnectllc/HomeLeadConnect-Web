# HCX Consolidation Runtime — 2026-09-22

## Scope

This document records the non-production runtime bridge for the clean Supabase consolidation destination:

- Project: `HOMELEAD CONNECT HCX`
- Project ref: `lvpouzxqojgmmmzbnnwv`
- Production remains `homeconnect` (`cguhtshclyybivvdnpig`).
- Existing E3/reconciliation preview remains `hlc-reconciliation-test` (`agfwqnirspmptjiqrrtk`).

This work must not redirect `app.homeleadconnect.org` away from production and must not make provider-backed features appear connected before their external configuration is proven.

## Runtime targeting

`src/lib/supabase.ts` now supports an explicit non-production target:

```text
VITE_SUPABASE_TARGET=consolidation
```

Rules:

1. `app.homeleadconnect.org` always resolves to production, even if the build environment attempts to select consolidation.
2. A non-production runtime may opt into the consolidation project with `VITE_SUPABASE_TARGET=consolidation`.
3. Existing Cloudflare preview behavior remains pinned to the reconciliation project unless the explicit consolidation target is selected.
4. Local/other environments continue to use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` when no named target applies.

## Database rehearsal completed

The clean consolidation destination now contains the production-plan September stabilization batch plus explicitly staged rehearsal hardening already recorded in the migration ledger.

Security follow-up verified on 2026-09-22:

- `resolve_billing_workspace_access()`: `anon EXECUTE = false`; `authenticated EXECUTE = true`; `service_role EXECUTE = true`.
- `rls_auto_enable()` was removed from this hardening contract after clean effective-production replay confirmed that the function is not present in canonical database history; no replacement function was created.
- Supabase anonymous SECURITY DEFINER advisor findings dropped from 5 to 3 after this correction.
- Remaining anonymous SECURITY DEFINER findings are the explicitly public-facing boundaries:
  - `record_hlc_analytics_event(...)`
  - `submit_professional_application(...)`
  - `submit_public_service_request(...)`

These remaining findings still require narrow-scope/abuse/idempotency verification, but they are not automatically classified as defects.

## Edge Function deployment matrix

The repository currently contains 17 Edge Function source directories. The clean destination currently has zero deployed Edge Functions.

### Do not deploy yet — provider/secret required

- `stripe-checkout-session`
- `stripe-billing-portal`
- `stripe-webhook`
- `resident-job-checkout`
- `resend-webhook`
- `send-communication`
- `twilio-webhook`
- `google-calendar-sync`
- `hlc-agent-chat`
- `hlc-agent-voice`
- `hlc-agent-voice-male-preview`
- `hlc-connect-roleplay`
- `process-document`
- `dispatch-internal-notification`

These require one or more of Stripe, Resend, Twilio, Google Calendar, OpenAI, canonical app URL, verified sender identities, webhook secrets, or internal alert destinations.

### Do not deploy yet — environment record/config required

- `dispatch-hlc-push`: requires per-environment VAPID/config row, dispatch token, and target Edge URL in `web_push_config`.
- `lead-vacuum-intake`: public endpoint is technically Supabase-only, but the destination has no application workspace/public-form seed and publishing the endpoint before intake routing is configured would create a false-ready public surface.
- `send-portal-invitation`: requires `PORTAL_SITE_URL` and verified Auth email/redirect configuration before it can be truthfully enabled.

## External configuration gates

Before deploying the corresponding runtime:

- Supabase Auth Site URL and required redirect allowlist
- leaked-password protection
- optional Turnstile decision/config
- Stripe secret key, signing secret, canonical HLC price, webhook endpoint
- Resend API key/from identity/webhook secret
- OpenAI key/model configuration
- Google Calendar OAuth/refresh token/calendar id
- optional Twilio account/sender/webhook configuration
- internal alert destination addresses
- web-push VAPID keys and dispatch token
- feature flags remain false until same-environment E2E proof exists

## Release rule

This branch and PR are consolidation/rehearsal work only. Do not merge or promote to production without exact-head certification and owner approval.
