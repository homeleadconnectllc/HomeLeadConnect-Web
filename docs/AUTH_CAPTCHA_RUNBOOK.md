# HLC Production Auth CAPTCHA Runbook

Canonical production Supabase project: `cguhtshclyybivvdnpig`.

## Current contract

The frontend already supports Cloudflare Turnstile and passes `captchaToken` to Supabase Auth for password, magic-link, and phone OTP sign-in.

Two settings must always agree:

1. Supabase Authentication > Bot and Abuse Protection > Enable CAPTCHA protection.
2. Frontend build configuration:
   - `VITE_AUTH_CAPTCHA_REQUIRED=true`
   - `VITE_TURNSTILE_SITE_KEY=<real production Cloudflare Turnstile site key>`

Never enable Supabase CAPTCHA while the production frontend is built without a real site key. That causes password sign-in to fail with `captcha_failed` / `no captcha_token found`.

## Emergency rollback

If Supabase CAPTCHA is enabled before the frontend has a valid production Turnstile site key, temporarily disable Supabase CAPTCHA protection to restore sign-in. Do not use Cloudflare test keys in production.

## Permanent enablement sequence

1. Create a production Turnstile widget for `app.homeleadconnect.org` in Cloudflare.
2. Configure the Turnstile secret key in Supabase Auth CAPTCHA settings.
3. Configure the public site key in the production build environment as `VITE_TURNSTILE_SITE_KEY`.
4. Set `VITE_AUTH_CAPTCHA_REQUIRED=true` for production.
5. Deploy and verify the Turnstile widget returns a token before sign-in is enabled.
6. Enable Supabase CAPTCHA protection.
7. Verify password sign-in, magic-link sign-in, registration, password reset, and any enabled phone OTP flow.
8. Confirm Supabase Auth logs no longer contain `captcha_failed` for valid user attempts.

## Production incident evidence

On 2026-08-22, canonical production Auth logs recorded repeated HTTP 400 password-grant failures with `error_code: captcha_failed` and `captcha protection: request disallowed (no captcha_token found)`. At that time `.env.production` explicitly set `VITE_AUTH_CAPTCHA_REQUIRED=false` while Supabase CAPTCHA enforcement was enabled.
