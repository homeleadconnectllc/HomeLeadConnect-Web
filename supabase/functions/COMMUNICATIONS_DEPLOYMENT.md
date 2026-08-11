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

## Resend email

- `RESEND_API_KEY` — server-only API credential
- `RESEND_FROM_EMAIL` — verified sender, for example `HomeLead Connect <notifications@updates.homeleadconnect.org>`
- `RESEND_WEBHOOK_SECRET` — signing secret for the deployed `resend-webhook` endpoint

The canonical queue sends through Resend with the transmission request ID as the
provider idempotency key and stores the provider message ID. Until the account,
sending domain, and required server values are configured, it records and returns
`Email Setup Required / Not Connected`; it never reports a fake send.

Deploy `resend-webhook` without Supabase JWT verification. Register its exact
public HTTPS URL for delivered, delayed, failed, bounced, and complained events.
The function validates the raw request with the Svix headers, rejects timestamps
outside five minutes, deduplicates `svix-id`, persists delivery/failure state,
and suppresses bounced or complained recipient addresses.

## Acceptance

- Prove compliance BLOCK/REVIEW records never reach Twilio.
- Prove the same client request ID creates one transmission.
- Prove Twilio signatures, duplicate callbacks, sent/delivered/failed states, and
  inbound STOP suppression.
- Prove cross-workspace reads and sends fail.
- Do not log credentials, authorization headers, message bodies, or invitation
  tokens.
