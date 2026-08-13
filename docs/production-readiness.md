# Pennsylvania V1 production readiness

This is an operational checklist, not proof that production is ready. Do not
enable a feature flag until its database migrations, server functions, provider
configuration, and normal-browser acceptance have all passed in the same
production environment.

## Canonical deployment

- Deploy this Vite application from the reviewed `main` commit; do not attach the
  production domain to a historical Next.js or prototype deployment.
- Build with `npm run build` and serve `dist`. Netlify SPA fallback configuration
  must preserve authenticated deep links.
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the deployment
  secret store. Never expose a service-role key to Vite.
- Set the Supabase Auth Site URL to the canonical HTTPS origin and allow only the
  required callback paths for password recovery, portal invitations, and magic
  links.

## Feature activation gates

- Keep `VITE_PORTAL_INVITATIONS_ENABLED=false` until the portal migration and
  `send-portal-invitation` function are deployed, its email delivery is
  configured, and expired/revoked/reused/wrong-email tests pass.
- Keep `VITE_BILLING_ENABLED=false` until the billing migrations and all three
  Stripe functions are deployed, the published HLC plan matches the approved live
  Stripe Price exactly, and a signed test webhook proves trial and entitlement
  persistence.
- Keep external communications unavailable until a provider, sending identity,
  webhooks, consent/suppression handling, and the compliance gate are proven.

## Supabase and provider controls

- Apply reviewed migrations in order, then rerun Supabase security and
  performance advisors. RLS tables with no policies remain deny-by-default unless
  an approved capability requires access.
- Enable leaked-password protection in Supabase Auth. Decide and configure
  Cloudflare Turnstile in Auth > Bot and Abuse Protection, place the Turnstile
  secret only in Supabase, and configure `VITE_TURNSTILE_SITE_KEY` in the hosting
  environment. Login, signup, and password reset pass the resulting token to
  Supabase Auth. Verify all three after activation.
- Deploy the Stripe webhook without JWT verification; Stripe authenticates with
  its webhook signature. Keep JWT verification enabled for user-invoked billing
  functions.
- Store provider secrets only in Supabase/Netlify secret configuration. Rotate any
  secret that has ever appeared in client code or logs.

## Observability, recovery, and rollback

- Configure client error reporting and Edge Function alerting before traffic is
  admitted. Alert on failed intake, portal invitation, webhook, and communication
  operations without logging message bodies, tokens, or secrets.
- Confirm the active Supabase backup/PITR policy and perform a documented restore
  drill. A configured backup without a tested restore is not recovery proof.
- Retain the previously accepted application deployment and database migration
  inventory as rollback inputs. Database rollback requires a reviewed corrective
  migration; never use destructive reset/clean operations against production.
- Record the deployed Git SHA, migration versions, Edge Function versions,
  provider webhook endpoints, and feature-flag values in the launch record.

## Verified launch-candidate evidence

- The approved live Stripe Product is `Pro` (`prod_Ud4EJYnEeLow78`).
- The approved live recurring Price is `price_1Tdo5cLE7v3WdqBuj7Jgt3T1` at
  `$49.99 USD / month` and is active in live mode.
- The required live Stripe webhook endpoint is enabled for all six HLC billing
  events at the reconciliation webhook URL.
- An active default live Stripe customer portal configuration exists with payment
  method updates and end-of-period cancellation enabled.
- These configuration checks do not replace the required signed webhook and
  end-to-end subscription transaction proof.

## Final acceptance

- Test unauthenticated, business, homeowner, and contractor sessions on the
  production hostname at desktop and phone viewports.
- Prove reloads, deep links, logout/login, invalid invitations, tenant isolation,
  Stripe signed webhook state, and truthful unavailable provider states.
- Verify every visible control has loading, success, failure, and duplicate-click
  behavior appropriate to its risk. Remove or disable anything not backed by the
  deployed environment.
