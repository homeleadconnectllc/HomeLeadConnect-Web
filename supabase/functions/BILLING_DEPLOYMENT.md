# HLC V1 billing deployment contract

These functions are prepared but must not be presented as enabled until the database migration, Stripe configuration, function deployment, and signed webhook test all pass.

## Approved launch plan

- Product: `Pro`
- Billing: `$49.99 USD / month`
- Stripe Price: `price_1Tdo5cLE7v3WdqBuj7Jgt3T1`
- `STRIPE_PRICE_HLC_MONTHLY` must be set to that exact Price ID for the launch candidate.
- Starter remains available in Stripe but is not the canonical HLC launch plan.

Required server-side secrets/config:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SIGNING_SECRET`
- `STRIPE_PRICE_HLC_MONTHLY=price_1Tdo5cLE7v3WdqBuj7Jgt3T1`
- `APP_URL` — canonical application origin for the deployment context; no `example.com` or localhost fallback
- Supabase-provided `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`

Deployment settings:

- `stripe-checkout-session`: JWT verification enabled
- `stripe-billing-portal`: JWT verification enabled
- `stripe-webhook`: JWT verification disabled because Stripe cannot send a Supabase user JWT; the function independently requires and verifies `Stripe-Signature`

Required webhook endpoint for reconciliation:

- URL: `https://agfwqnirspmptjiqrrtk.supabase.co/functions/v1/stripe-webhook`
- Stripe account must have a webhook endpoint pointing to that exact reconciliation function URL before signed webhook testing.

Required webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_failed`

Enable `VITE_BILLING_ENABLED=true` only after an end-to-end Stripe test proves Checkout, signed webhook receipt, `subscriptions`, `workspace_plan_status`, trial state, entitlement, billing portal, cancellation, and failure/grace behavior.

The Checkout function requires disclosure version `pa-v1-2026-08-10` and stores
the authenticated user's affirmative enrollment evidence before creating a
session. Trial-ending and payment-failure webhooks persist notice obligations as
`email_not_connected` until the approved transactional email provider is wired;
that state is not proof a notice was delivered.

## Current reconciliation state

- Billing Edge Functions are deployed in the reconciliation Supabase project.
- Stripe currently has no webhook endpoint configured for this account, so signed webhook proof is still blocked.
- Stripe currently has no customer portal configuration, so portal-session proof remains blocked until a portal configuration is created in Stripe.
- Do not enable billing merely because Checkout returns successfully; entitlement remains webhook-derived only.
