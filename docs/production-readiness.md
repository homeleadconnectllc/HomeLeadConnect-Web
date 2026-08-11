# Pennsylvania V1 production readiness

This is an operational checklist, not proof that production is ready. Do not
enable a feature flag until its database migrations, server functions, provider
configuration, and normal-browser acceptance have all passed in the same
production environment.

## Canonical deployment

- Deploy this Vite application from the reviewed `main` commit; do not attach the
  production domain to a historical Next.js or prototype deployment.
- Build with `npm run build` and serve `dist`. The root `vercel.json` supplies the
  SPA fallback required for authenticated deep links.
- Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the deployment
  secret store. Never expose a service-role key to Vite.
- Set the Supabase Auth Site URL to the canonical HTTPS origin and allow only the
  required callback paths for password recovery, portal invitations, and magic
  links.

## Feature activation gates

- Keep `VITE_PORTAL_INVITATIONS_ENABLED=false` until the portal migration and
  `send-portal-invitation` function are deployed, its email delivery is
  configured, and expired/revoked/reused/wrong-email tests pass.
- Keep `VITE_BILLING_ENABLED=false` until the billing migration and all three
  Stripe functions are deployed, the $99 monthly Price is configured, and a
  signed test webhook proves trial and entitlement persistence.
- Keep external communications unavailable until a provider, sending identity,
  webhooks, consent/suppression handling, and the compliance gate are proven.

## Supabase and provider controls

- Apply reviewed migrations in order, then rerun Supabase security and
  performance advisors. RLS tables with no policies remain deny-by-default unless
  an approved capability requires access.
- Enable leaked-password protection in Supabase Auth. Decide and configure
  CAPTCHA/bot protection for public auth and intake before launch.
- Deploy the Stripe webhook without JWT verification; Stripe authenticates with
  its webhook signature. Keep JWT verification enabled for user-invoked billing
  functions.
- Store provider secrets only in Supabase/Vercel secret configuration. Rotate any
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

## Final acceptance

- Test unauthenticated, business, homeowner, and contractor sessions on the
  production hostname at desktop and phone viewports.
- Prove reloads, deep links, logout/login, invalid invitations, tenant isolation,
  Stripe signed webhook state, and truthful unavailable provider states.
- Verify every visible control has loading, success, failure, and duplicate-click
  behavior appropriate to its risk. Remove or disable anything not backed by the
  deployed environment.
