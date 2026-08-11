# Pennsylvania V1 consolidated browser acceptance

Run this once against the fully migrated/configured production candidate. Record
the hostname, deployed Git SHA, user role, workspace, viewport, persisted record
IDs, expected result, actual result, and screenshot/error artifact for each case.

## Public and authentication

- Public navigation, truthful LeadScope/Community states, Privacy, Terms, platform disclosure, and 404.
- Valid/invalid Pennsylvania service request; confirmation; exactly one CRM lead after retry; no client tenant authority.
- Login, logout, session reload, protected deep link, registration confirmation, password recovery, and Turnstile failure/success.
- Expired, revoked, reused, and wrong-email homeowner/contractor invitation failures.

## Business operations

- Authorized workspace switch refreshes all tenant data; unauthorized workspace ID fails.
- Lead → LeadScope draft → sent → accepted → CRM Job, with totals and reload persistence.
- Contractor create/filter → offer; duplicate active offer rejected; history retained after reject/cancel and reassignment.
- Contractor magic link → direct accept/reject with actor/time audit; staff does not impersonate acceptance.
- Accepted assignment → appointment → Calendar → reschedule (old cancelled + replacement) → complete/cancel/no-show.
- Final CRM job completion and follow-up create/due/complete/history.

## Portals, messaging, and providers

- Homeowner sees only linked customer-facing estimate/job/appointments/messages/shared documents.
- Contractor sees only explicitly linked company/workspace offers, assigned work, permitted contact/schedule/messages/documents.
- Internal conversation/post/reload/read state; unauthorized participant receives no rows.
- Compliance BLOCK and REVIEW never reach Twilio.
- Approved SMS send → Twilio callback → sent/delivered or failed history; duplicate callback is idempotent; inbound STOP suppresses future SMS.
- Allowed call → Twilio status history; blocked call shows the compliance reason. Do not record calls silently.
- Voice-note record/upload/playback/reload; private object denied to a nonparticipant.
- Email remains `Setup Required / Not Connected` until an approved provider test proves send, webhook state, and unsubscribe behavior.

## Billing and resilience

- Consent checkbox is required and persists the exact 14-day/$99 monthly disclosure before Checkout.
- Stripe Checkout requires a payment method; signed webhook—not redirect—creates trial entitlement.
- Trial-ending and payment-failure notice obligations persist; email delivery is not claimed while disconnected.
- Billing portal payment-method/cancellation action → webhook → HLC status/entitlement update; seven-day failed-payment grace behavior.
- Reload, browser back, expired session, duplicate clicks, invalid transitions, failed network requests, and understandable errors.

## Isolation, responsive, and accessibility

- Workspace A cannot access Workspace B leads, estimates, jobs, contractors, assignments, appointments, conversations, notifications, portal records, transmissions, voice notes, billing, or documents through URL/API manipulation.
- Repeat launch-critical paths at desktop, tablet, and phone widths; no clipped or covered action.
- Keyboard-only navigation, visible focus, labels, headings, touch targets, error association, status announcements, contrast, and dialog focus where applicable.

Any required failure keeps Pennsylvania V1 NO-GO. Compilation, migration success,
or a rendered component alone does not clear this checklist.
