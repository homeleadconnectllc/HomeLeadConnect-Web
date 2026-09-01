# HLC E6 Trial + Entitlements execution

E6 extends the existing centralized billing policy; it does not create duplicate trial routes or a second subscription authority.

## State contract

- `full_trial_preview`: Stripe webhook-confirmed `trialing` access.
- `full_paid_access`: Stripe webhook-confirmed active access, or billing intentionally disabled in a non-billing environment.
- `limited_mode`: webhook-confirmed grace/past-due access or an unknown active provider state that must fail down safely.
- `membership_gate`: no active webhook-confirmed entitlement.
- `verification_unavailable`: provider evidence could not be checked and must not be mislabeled inactive.

Settings and billing recovery remain reachable in every state. Existing profile identity, saved work, Academy progress, achievements, documents, matches, and legitimate history are not deleted because a trial ends. Role authorization remains independent and is evaluated before entitlement state.

Stripe card data and secret credentials stay outside the browser. Subscription state remains derived from signature-verified webhook records. No automatic tax collection is enabled by E6; tax activation requires confirmed registrations and a separate authorized launch decision.
