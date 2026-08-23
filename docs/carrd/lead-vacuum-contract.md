# Carrd Lead Vacuum — HLC intake contract

Issue: #164

## Funnel

Facebook / Instagram / TikTok / direct / campaign → Carrd Lead Vacuum → server-controlled HLC intake → canonical lead → assignment/follow-up → communications/AI → source-to-close analytics.

## Existing safe boundary

The application already owns `public.submit_public_service_request(...)`, which resolves an enabled `public_forms` slug, validates input, deduplicates on `request_id`, and delegates canonical lead creation to `causal._ingest_lead_impl(...)`. Carrd must not receive privileged database credentials.

#164 extends that established boundary rather than creating a parallel Carrd-only lead store.

## Implemented on PR #165 branch

- `supabase/migrations/20260823014500_lead_vacuum_social_attribution.sql`
  - registers the `lead-vacuum` public form
  - adds `submit_public_lead_vacuum(...)`
  - requires explicit contact consent
  - deduplicates by `request_id`
  - persists normalized social source in `leads.source`
  - persists full attribution and consent evidence in canonical causal event metadata
  - grants execution only to `service_role`
- `supabase/functions/lead-vacuum-intake/index.ts`
  - public browser intake boundary with custom origin validation
  - no privileged browser credential
  - server-side field validation and length limits
  - honeypot bot trap
  - source normalization for Facebook, Instagram, TikTok, direct, and other
  - user-safe responses without internal database details
- `docs/carrd/lead-vacuum-embed.html`
  - copy/paste Carrd form implementation
  - mobile-first HLC presentation
  - UTM/referrer capture
  - request UUID retained across retries
  - explicit consent
  - success and retry-safe failure states

## Browser payload

Carrd should collect:

- `request_id` — UUID generated once per submission attempt and reused on retry
- `full_name`
- `phone`
- `email`
- `intent`
- `service_area`
- `timeline`
- `preferred_contact_method`
- `notes`
- `consent_contact` — explicit boolean
- `consent_timestamp`
- `source_platform` — `facebook`, `instagram`, `tiktok`, `direct`, or `other`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_content`
- `utm_term`
- `landing_url`
- `referrer`

Do not accept workspace IDs, lead status, assignee IDs, privileged routing instructions, or arbitrary database fields from the browser.

## Attribution behavior

Campaign query parameters are read on landing and retained through submission. `source_platform` is derived from explicit campaign metadata first, then known referrer host, then `direct`. Attribution must be persisted on the canonical HLC lead/event metadata; it must not exist only in Carrd email notifications.

## Consent behavior

The form must require explicit contact consent before submission. Consent state and timestamp travel with the intake event. This is an intake record, not blanket authorization for every communication channel; downstream communication compliance remains authoritative.

## Success contract

Return a non-sensitive acknowledgement such as `{ accepted: true, request_id }`. Do not expose internal workspace IDs, database details, service credentials, routing rules, or stack traces.

Retries with the same `request_id` must be idempotent.

## Failure contract

Return a user-safe validation or temporary-failure state. A retry must not create duplicate canonical leads.

## Rollout boundary

The repository implementation can be completed and certified without changing the live Carrd page. Production activation requires the database migration and public Edge Function to be deployed first; only then should the Carrd embed be pasted/published, so the public form never points at a missing endpoint.

## Launch proof

Before #164 closes, submit at least one production-safe test through the public form and prove:

1. Carrd reports success.
2. Exactly one usable lead appears in HLC.
3. Source/campaign attribution is present.
4. Consent state is recorded.
5. Existing assignment/follow-up behavior remains intact.
6. Replaying the same request ID does not create a duplicate lead.

## Carrd page presentation

Mobile-first HLC visual system. Primary CTA: **Get connected**. Keep the form short enough for social traffic; reveal optional detail progressively where Carrd permits it. Include Privacy Policy and Terms destinations and a concise consent statement adjacent to submit.
