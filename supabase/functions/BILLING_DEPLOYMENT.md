# HLC V1 billing deployment contract

These functions are prepared but must not be presented as enabled until the database migration, Stripe configuration, function deployment, and signed webhook test all pass.

Required server-side secrets:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SIGNING_SECRET`
- `STRIPE_PRICE_HLC_V1` — the recurring $99 USD monthly Price created for the single launch plan
- `APP_URL` — canonical production application origin; no `example.com` or localhost fallback
- Supabase-provided `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`

Deployment settings:

- `stripe-checkout-session`: JWT verification enabled
- `stripe-billing-portal`: JWT verification enabled
- `stripe-webhook`: JWT verification disabled because Stripe cannot send a Supabase user JWT; the function independently requires and verifies `Stripe-Signature`

Required webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.trial_will_end`
- `invoice.payment_failed`

Enable `VITE_BILLING_ENABLED=true` only after an end-to-end Stripe test proves Checkout, signed webhook receipt, `subscriptions`, `workspace_plan_status`, trial state, entitlement, billing portal, cancellation, and failure/grace behavior.
