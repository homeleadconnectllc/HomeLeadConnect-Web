# Communications deployment contract

HomeLead Connect launches with provider-agnostic communications. The canonical communication history, consent, suppression, compliance decision, and audit records stay inside HLC; the transport may be swapped without changing those records.

## Launch transport: device native

The launch path uses the phone and messaging applications already available on the operator's device through explicit `tel:` / `sms:` handoff. HLC must never claim that a call or text was delivered merely because the device handoff opened successfully.

Before a device-native call or text is offered, the same communication-compliance gate used by connected providers must run. `BLOCK` and `REVIEW` decisions must not be presented as successful sends. Operator-reported outcomes may be recorded only through the audited manual/device-native communication contract.

No Twilio account, Twilio phone number, paid telephony provider, or provider-specific verification is required for the HLC V1 launch gate.

## Optional provider integrations

Provider integrations may be enabled later without replacing the canonical HLC communication model.

### Twilio (optional future connector)

If Twilio is intentionally enabled in a future environment, its server-only values may include `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, sender identity, webhook base URL, and reviewed voice application URL. `send-communication` requires JWT verification. `twilio-webhook` must not require a Supabase JWT because callbacks are authenticated with `X-Twilio-Signature`; the function must validate that signature before any write.

Twilio verification, sender registration, and paid-provider readiness are connector-specific gates only. They are not HLC launch prerequisites while device-native transport is the selected launch path.

### Email provider (optional connector)

Email transport remains disabled until a real provider and verified sender are configured. When a provider such as Resend is connected, credentials stay server-side and delivery callbacks must be authenticated, deduplicated, and persisted. Until then HLC must show `Email Setup Required / Not Connected` rather than reporting a fake send.

## Acceptance

- Prove compliance `BLOCK` / `REVIEW` results cannot be logged as completed outbound communication.
- Prove the same client request ID does not create duplicate communication history.
- Prove device-native handoff never fabricates provider delivery or receipt state.
- Prove cross-workspace communication reads and writes fail.
- Prove suppression/consent rules are applied before any enabled transport.
- Do not log credentials, authorization headers, sensitive message bodies, or invitation tokens.
- Test each optional provider independently before marking that connector `Connected`.
