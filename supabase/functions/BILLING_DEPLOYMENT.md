# HLC V1 billing deployment contract

These functions are prepared but must not be presented as enabled until the database migration, Stripe configuration, function deployment, and signed webhook test all pass.

## Approved launch plan

- Product: `Pro`
- Billing: `$49.99 USD / month`
- Live Stripe Product: `prod_Ud4EJYnEeLow78`
- Live Stripe Price: `price_1Tdo5cLE7v3WdqBuj7Jgt3T1`
- Preferred secret: `STRIPE_PRICE_HLC=price_1Tdo5cLE7v3WdqBuj7Jgt3T1`
- Backward-compatible fallback: `STRIPE_PRICE_HLC_MONTHLY=price_1Tdo5cLE7v3WdqBuj7Jgt3T1`
- Starter remains available in Stripe but is not the canonical HLC launch plan.

The checkout function reads the published `hlc_v1` plan and refuses enrollment unless the configured Stripe Price matches the HLC amount, currency, and interval exactly. Migration `20260813114500_reconcile_hlc_plan_with_live_stripe.sql` prepares that repository-side reconciliation; it remains pending until the normal database migration gate authorizes it.

Required server-side secrets/config:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SIGNING_SECRET`
- `STRIPE_PRICE_HLC=price_1Tdo5cLE7v3WdqBuj7Jgt3T1` preferred; the legacy `STRIPE_PRICE_HLC_MONTHLY` name remains accepted during transition
- `APP_URL` — canonical application origin for the deployment context; no `example.com` or localhost fallback
- Supabase-provided `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`

Deployment settings:

- `stripe-checkout-session`: JWT verification enabled
- `stripe-billing-portal`: JWT verification enabled
- `stripe-webhook`: JWT verification disabled because Stripe cannot send a Supabase user JWT; the function independently requires and verifies `Stripe-Signature`

Required webhook endpoint for reconciliation:

- URL: `https://agfwqnirspmptjiqrrtk.supabase.co/functions/v1/stripe-webhook`
- Live Stripe endpoint: `we_1U3jBILE7v3WdqBuMWtsW3MO`
- Current Stripe status: enabled

Required webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_failed`

The live endpoint is currently configured for all six required events. Configuration is not a substitute for a signed end-to-end event test.

Customer portal configuration:

- Active default live configuration: `bpc_1U3jwtLE7v3WdqBukWebWo8O`
- Payment-method updates: enabled
- Subscription cancellation: enabled at period end with no proration
- Invoice history: enabled
- Subscription plan changes: disabled

Enable `VITE_BILLING_ENABLED=true` only after an end-to-end Stripe test proves Checkout, signed webhook receipt, `subscriptions`, `workspace_plan_status`, trial state, entitlement, billing portal, cancellation, and failure/grace behavior.

The Checkout function requires disclosure version `pa-v1-2026-08-10` and stores
the authenticated user's affirmative enrollment evidence before creating a
session. Trial-ending and payment-failure webhooks persist notice obligations as
`email_not_connected` until the approved transactional email provider is wired;
that state is not proof a notice was delivered.

## Current reconciliation state

- Billing Edge Functions are deployed in the reconciliation Supabase project.
- The approved live Pro Product/Price is active at $49.99 USD per month.
- The required live Stripe webhook endpoint now exists, is enabled, and subscribes to all six required events.
- An active default live Stripe customer portal configuration now exists with payment-method update and end-of-period cancellation enabled.
- Signed webhook transaction evidence and the full Checkout → webhook → entitlement → portal round trip are still required before billing can be enabled.
- Do not enable billing merely because Checkout returns successfully; entitlement remains webhook-derived only.
