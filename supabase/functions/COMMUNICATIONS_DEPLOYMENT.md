# Communications deployment contract

External communications remain unavailable until the migration, functions,
provider verification, and end-to-end acceptance all pass in the same environment.

## Twilio secrets

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_MESSAGING_SERVICE_SID` when Messaging Services are used
- `TWILIO_WEBHOOK_BASE_URL` — the public Supabase Functions origin, without a trailing slash
- `TWILIO_VOICE_URL` — reviewed TwiML/application URL for permitted outbound calls

Deploy `send-communication` with JWT verification enabled. Deploy
`twilio-webhook` without JWT verification because Twilio authenticates callbacks
with `X-Twilio-Signature`; the function validates that signature before writes.

Configure Twilio inbound message, message status, inbound voice, and call status
callbacks to the exact `twilio-webhook` URL. The configured URL must exactly match
`TWILIO_WEBHOOK_BASE_URL + /twilio-webhook` for signature verification.

Production SMS remains blocked until toll-free verification is approved. Only a
trusted server process may mark the workspace `sms`/`call` provider connection as
`connected`, using the exact normalized Twilio sender identity.

## Email

No transactional provider is selected. The canonical queue records an honest
`Email Setup Required / Not Connected` failure and sends nothing. Add a provider
adapter only after its account, sender domain, secret, webhook signature, delivery
events, unsubscribe behavior, and retention contract are approved.

## Acceptance

- Prove compliance BLOCK/REVIEW records never reach Twilio.
- Prove the same client request ID creates one transmission.
- Prove Twilio signatures, duplicate callbacks, sent/delivered/failed states, and
  inbound STOP suppression.
- Prove cross-workspace reads and sends fail.
- Do not log credentials, authorization headers, message bodies, or invitation
  tokens.
