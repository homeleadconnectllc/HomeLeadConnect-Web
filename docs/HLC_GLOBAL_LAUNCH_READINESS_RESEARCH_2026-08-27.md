# HomeLead Connect — Global Launch-Readiness Research Standard

Date: 2026-08-27
Status: Post-launch hardening research baseline
Scope: Entire HomeLead Connect ecosystem

## 1. Purpose

This document is the single research-backed launch-readiness standard for HomeLead Connect. It exists to prevent contradictory local fixes, one-off page styling, unsupported claims, and feature behavior that is visually present but not operationally complete.

Every HLC surface must be evaluated as a complete user task: discoverability → understanding → action → authorization → backend/state change → visible result → notification/side effect → recovery → auditability.

## 2. Research foundations

Primary authoritative references reviewed for this standard include:

- Apple Human Interface Guidelines — navigation, searching, controls, mobile interaction, accessibility.
- W3C WCAG 2.2 — focus visibility, target sizing, keyboard access, accessible authentication, redundant entry, error prevention.
- OpenAI Agents SDK / Realtime guidance — agent instructions, handoffs, guardrails, realtime voice, interruption handling, conversation state.
- Supabase production/security guidance — RLS, auth hardening, rate limits, MFA, abuse prevention, production checklist.
- Stripe Billing/Webhooks — asynchronous subscription state, webhook-derived entitlement, idempotent event processing.
- Cloudflare Pages/security guidance — production headers, CSP, caching, deployment safety, production verification.
- Twilio messaging guidance — consent, STOP/START/HELP, suppression, sender identification, opt-out enforcement.
- FTC Consumer Reviews and Testimonials Rule — review provenance, fake review prohibition, incentive restrictions, disclosure.
- NIST/OWASP principles — least privilege, data minimization, session security, tenant isolation, logging and recovery.
- Established CRM / field-service interaction patterns — queues, records, command surfaces, scheduling, dispatch, evidence, completion.

## 3. Global product rules

### 3.1 Every screen has one job

Each route must clearly communicate:
1. Where am I?
2. What needs attention?
3. What can I do now?
4. What happens after I do it?
5. How do I recover if it fails?

Avoid generic dashboards, decorative cards, unexplained status values, and duplicate page titles.

### 3.2 Global utilities are global

Search and Alerts are high-frequency cross-system utilities and must not be buried inside More.

Mobile authenticated header target:
- brand/home anchor
- Search icon/button
- Alerts/Notifications icon/button with meaningful unread state
- Menu/More control

At narrow widths, reduce/hide secondary brand copy before hiding Search or Alerts.

Search must support:
- recent queries
- useful placeholder text
- keyboard focus
- clear action
- scoped/contextual filters where justified
- route-aware results
- people, work, tools, records and settings
- empty/no-result recovery

Alerts must support:
- what happened
- why it matters
- required action
- deep link
- timestamp
- read/unread state
- role/workspace targeting
- durable history
- no duplicate alert storms

### 3.3 Mobile primary navigation

Keep five primary destinations for business users:
- Home
- Work
- Network
- Community
- More

Do not add Search or Alerts as sixth/seventh bottom tabs. They belong in the global utility layer.

Bottom navigation must reserve safe-area clearance and may not obscure focused fields, modals, agent controls, or page actions.

### 3.4 Desktop is not enlarged mobile

Desktop may use:
- side navigation
- inspectors
- split views
- dense rows/tables
- command bars
- keyboard affordances
- persistent context

But mobile must remain task-first and one-column where content density requires it.

## 4. Visual design system

### 4.1 Brand

- Canonical HLC transparent logo only.
- No white matte/corners around the independent circular mark.
- No purple branding.
- Primary system: deep navy / blue / white with restrained warm-gold executive accent and role-specific non-purple accents.
- Avoid generic SaaS gradients, giant rounded cards, pale white controls, decorative bubbles, glassmorphism overload.

### 4.2 Geometry

- Mobile page rail: approximately 16–20 CSS px.
- Primary touch targets: target 44×44 CSS px where practical; never below WCAG minimum without spacing/equivalent control.
- Related spacing: 8–16 px.
- Section spacing: 24–32 px.
- Controls/cards: restrained radius generally 8–12 px.
- No horizontal page overflow at 320–430 px.
- No text column so narrow that words or characters stack vertically.

### 4.3 Surfaces

Use contained cards only for semantic objects, dialogs, inspectors and meaningful records. Prefer continuous workspace surfaces, rows, dividers, rails, toolbars and sections for navigation and operating views.

### 4.4 Forms

All authenticated controls are natively dark, not painted white by browser defaults.

Every form must have:
- explicit label
- helper text only when useful
- visible required state
- inline validation near the field
- error summary for long forms when appropriate
- preserved input after recoverable errors
- correct input type/autocomplete
- keyboard-safe layout
- visible focus
- disabled/loading/success/failure states
- clear submit consequence

Never use placeholder text as the only label.

## 5. Language and copy standard

### 5.1 Voice

HLC copy should be clear, calm, professional, specific and operational. Avoid hype, generic AI language, internal implementation terms, blame, jargon, and unsupported certainty.

Prefer:
- “Needs attention” over “Error state 4”
- “No provider has accepted yet” over “Pending assignment” when context requires explanation
- “Send estimate” over “Execute estimate workflow”
- “Try again” or “Review details” over “Operation failed”

### 5.2 Labels

A label should describe the user’s object or action, not the database field or developer concept.

Never expose raw enums as primary UI copy. Translate internal state into user-facing language while preserving exact underlying data.

### 5.3 Buttons

Buttons use verb-first, consequence-aware labels:
- Save changes
- Send estimate
- Schedule visit
- Assign provider
- Mark complete
- Contact customer
- Review alert

Avoid ambiguous primary labels such as Submit, Continue, Process, Execute, OK when a more specific consequence can be stated.

Destructive actions must identify the consequence and require confirmation where loss or irreversibility is material.

### 5.4 Empty states

Every empty state must answer:
- what is empty
- whether that is normal
- what to do next
- whether a filter/search is hiding results

“No data” alone is unacceptable.

## 6. Accessibility baseline

Target WCAG 2.2 AA minimum, with AAA improvements where low-cost.

Required:
- keyboard navigation
- visible focus
- focus not obscured by sticky/fixed UI
- no color-only status meaning
- appropriate landmarks/headings
- useful accessible names
- form labels and described errors
- target-size compliance
- non-drag equivalent for drag interactions
- reduced-motion respect
- readable contrast
- accessible authentication without cognitive-test dependence
- redundant-entry reduction in multi-step forms

## 7. Authentication and account recovery

- Fail closed on unresolved workspace/portal access.
- Preserve recovery from stale/invalid refresh-token state.
- Clear expired local auth state without weakening other sessions.
- Email confirmation and secure recovery flows.
- MFA-ready account architecture.
- Session/device management surfaced to users with appropriate authority.
- Bot protection/rate limits on public auth and intake.
- No secret/service-role credential in browser code.

## 8. CRM / Work system

Canonical service lifecycle:
Request → Qualify → Estimate → Match → Schedule → Job → Complete → Payment → Review → Referral/Repeat.

Every record must expose:
- human-readable identity
- status/stage
- priority/attention reason
- owner/assignee
- timestamps
- next action
- relevant communications
- related records
- audit/history

Queue views must optimize for action, not decoration.

## 9. Leads

A lead must support:
- source
- participant identity/contact
- project need
- renter/homeowner/household context
- consent state
- qualification state
- priority/SLA
- responsible operator
- next action
- follow-up timing
- estimate/match/job handoff
- activity history

Do not infer customer intent from missing data.

## 10. LeadScope / estimates

Measurement evidence labels must remain explicit:
- Device measured
- Customer confirmed
- Estimated
- Needs professional verification

Never call manually entered or calculated dimensions “device measured.”

Distinguish:
- HLC Preliminary Estimate
- Professional Final Proposal

Estimate workflow must preserve quantities, assumptions, options, pricing basis, approval state, send history, and conversion to job.

## 11. Jobs

Job records must support:
- linked lead/request
- provider assignment
- schedule
- status
- evidence/documents
- customer/provider communications
- completion criteria
- issue/escalation path
- financial handoff

“Complete” means canonical state/evidence supports completion, not merely that someone discussed it.

## 12. Scheduling / Calendar

Scheduling must support:
- day/week/agenda views
- appointment status
- participant availability
- assigned provider
- location/address
- reschedule/cancel reason
- reminder state
- route/map context where useful
- conflict handling
- timezone clarity

Every mutation must result in visible confirmation and appropriate participant notification behavior.

## 13. Follow-ups

Every follow-up has:
- reason
- related record
- due time
- channel
- owner
- completion/disposition
- overdue state
- next action when not reached

Automated and human follow-ups must remain distinguishable.

## 14. Provider network / matching

Matching must explain why a provider is suggested.

Signals may include:
- trade/category fit
- service area
- availability
- verification/evidence
- distance
- prior outcomes/ratings where valid

Do not imply “best” without transparent criteria.

Provider eligibility and assignment must be evidence-backed and workspace scoped.

## 15. Maps

Maps require:
- usable mobile viewport
- clustering/decluttering at density
- selected state
- list/card fallback
- filters
- accessible non-map alternative
- precise vs approximate location distinction
- address-first user language
- no accidental coordinate exposure

Map is not a replacement for a directory/list.

## 16. Community

Community needs:
- feed/discussions/events/updates
- reviews
- referrals
- reporting
- moderation
- appeal/history where applicable
- block/mute/privacy controls

Moderation must use specific content records and workspace/role authorization.

## 17. Reviews and referrals

Reviews must be tied to genuine experience where HLC can verify it.

Never create, buy, synthesize, suppress or reward reviews based on positive/negative sentiment.

Disclose material connections where applicable.

Referral attribution must record source/status without fabricating conversion.

## 18. Communications

All channels use one consent/suppression truth model.

Required:
- explicit sender identity
- consent state
- opt-out/suppression
- delivery/provider state
- related HLC record
- history
- failure/retry path

Do not claim delivered/sent if provider confirmation is absent.

SMS must respect STOP/START/HELP and suppression behavior. Opt-out must be one-step and durable.

## 19. Call Center / device handoff

HLC may coordinate calls from user devices or configured providers; do not pretend browser telephony exists when it does not.

Call activity requires:
- contact
- direction
- channel/transport
- result/disposition
- notes
- follow-up
- timestamp/operator

Scripts are guidance, not coercion.

## 20. Documents

Document system must distinguish:
- uploaded original
- generated record
- extracted/processed information
- reviewed/approved information
- shared/archive state

OCR/extraction must never silently become canonical business data without required review.

Use human-readable names; do not expose raw storage UUIDs as user-facing filenames.

## 21. AI team — shared operating quality

Kendrell, Dion and Diamond share one quality framework:
- same session reliability
- same context retention mechanics
- same evidence-vs-assumption discipline
- same tool authorization pattern
- same guardrail architecture
- same failure/retry behavior
- same interruption and cancellation behavior
- same multilingual quality requirements
- same audit/tracing expectations
- same latency targets
- same handoff payload completeness

They do NOT have the same role, personality, authority or voice identity.

### Kendrell
Executive command: priorities, risk, approvals, cross-agent orchestration.
Tone: steady, calm, concise, confident, conversational.

### Dion
Operations & BI: live work, bottlenecks, SLA, next actions, operational evidence.
Tone: practical, precise, crisp, grounded, slightly quicker than Kendrell.

### Diamond
Customer Experience & Community: clarity, guidance, onboarding, recovery, community support.
Tone: composed, natural, polished, empathetic without over-softening.

### Agent response contract
Each agent should:
1. identify known facts
2. identify missing/uncertain facts when material
3. answer the user’s actual question
4. recommend the safest/most useful next action
5. execute only within permission
6. confirm execution only from evidence
7. hand off with context when another agent owns the work

## 22. AI guardrails and handoffs

Use guardrails at the correct boundary:
- input guardrails for user input where appropriate
- output guardrails for final response quality/safety
- tool guardrails on every sensitive function call
- explicit authorization checks inside handoff callbacks when handoff arguments affect authority

Handoff payload must include:
- objective
- participant/record context
- verified state
- blocker
- urgency
- attempted work
- required decision/action
- definition of done

Users should not have to repeat information after a handoff.

## 23. Voice agents

Production voice behavior should prioritize natural turn-taking over “radio voice.”

Required qualities:
- low latency
- conversational pacing
- sentence-level prosody
- natural pauses
- interruption support
- barge-in cancellation
- no overlapping stale playback
- pronunciation lock for canonical names
- language/locale-aware speech
- transcript/history continuity
- clear fallback to text when voice fails

Do not auto-speak deterministic fallback/error copy as if it were fresh reasoning.

Voice identity differences are intentional; quality mechanics must be equal.

## 24. Notifications / alerts

Alert families include:
- new lead / SLA / missing information
- estimate/LeadScope attention
- appointment changes
- follow-ups
- jobs/provider assignment
- communications failures
- provider matching
- documents
- billing
- security
- community moderation
- integrations/system degradation
- AI escalation

Every alert must answer what, why, action, destination.

## 25. Billing / subscriptions

Subscription access is asynchronous and webhook-derived.

Required:
- signed Stripe webhook verification
- idempotent event processing
- clear active/past-due/canceled/incomplete state
- invoice/payment history
- recovery path
- no client-side self-entitlement
- no “paid” UI claim before canonical entitlement state

## 26. Security / tenancy

- RLS on exposed business data.
- Workspace membership/role enforcement.
- No anonymous raw writes to protected records.
- SECURITY DEFINER functions must have explicit purpose, strict validation and locked search-path behavior.
- Public intake uses rate limiting, bot/honeypot controls and idempotency.
- Webhooks authenticate providers before privileged writes.
- Sensitive actions are logged.
- Destructive/high-impact actions require appropriate authority.
- Security Advisor warnings are tracked; performance warnings are not mislabeled as security vulnerabilities.

## 27. Performance

Performance is a product feature.

- Avoid shipping master-size artwork into tiny UI slots.
- Lazy-load protected route bundles where appropriate.
- Keep public landing path lightweight.
- Cache immutable assets.
- Use realistic rendered performance gates.
- Treat repeated single-run Lighthouse variance as a measurement-design issue, not permission to lower standards.

## 28. Cloudflare / production headers

Evaluate and test:
- Content-Security-Policy
- X-Content-Type-Options
- frame-ancestors / anti-clickjacking
- Referrer-Policy
- Permissions-Policy
- immutable caching for versioned static assets

Security header changes must be tested in staging/preview before production enforcement.

## 29. Error/recovery standard

Every async feature must define:
- loading
- empty
- success
- validation failure
- authorization denied
- backend unavailable
- provider failure
- retry/recovery
- stale-session handling

Never leave a blank screen as error handling.

## 30. Observability

Launch-critical operations need enough evidence to answer:
- what happened?
- who initiated it?
- which workspace/record?
- which provider/tool?
- did it succeed?
- what failed?
- can it be retried safely?

AI runs, tool calls, webhooks, communications, billing mutations and privileged administrative changes should have durable audit evidence appropriate to sensitivity.

## 31. Launch certification model

A feature is not GREEN because code exists.

GREEN requires:
1. implementation exists
2. static/acceptance contract passes
3. exact-head CI passes
4. rendered browser verification passes where applicable
5. backend/authorization path is proven
6. visible success and failure states are proven
7. recovery path is proven
8. production deployment/health evidence exists after promotion

Physical-device-specific behavior that cannot be reproduced in automation is labeled separately, never silently invented.

## 32. Research-driven immediate priorities

P0 — global shell
- Search in authenticated global utility area
- Alerts in authenticated global utility area
- More remains lower-frequency navigation/settings
- compact mobile header
- correct safe areas and focus clearance

P0 — contradictions
- remove remaining purple/indigo brand styling where it violates HLC no-purple rule
- remove contradictory legacy CSS/action/copy contracts instead of stacking overrides
- canonicalize user-facing state terminology

P0 — AI parity
- unify shared reliability/guardrail/handoff/voice mechanics for Kendrell, Dion and Diamond
- preserve role/personality/voice distinctions
- add parity tests so one agent cannot silently receive weaker behavior

P1 — route-by-route operating audit
- Home / Command Center
- Leads
- Estimates / LeadScope
- Jobs
- Calendar
- Follow-Ups
- Network / Matching / Map
- Community / Reviews / Referrals / Moderation
- Messages / Call Center / Manual Communications
- Documents / Help / Tutorials / Rules
- Portals
- Settings / Team / Billing
- Analytics / System Health / Automations
- AI workspaces
- public/auth/legal surfaces

P1 — copy/action audit
- action labels
- empty states
- errors
- confirmations
- alert copy
- permission denial
- destructive actions
- billing language
- estimate/measurement evidence language

P1 — compliance/security audit
- consent/suppression
- review provenance
- RLS/tenant boundaries
- public intake abuse controls
- webhook verification
- auth hardening
- security headers

## 33. Definition of launch-ready

HomeLead Connect is launch-ready only when the platform behaves as one coherent operating system: same language rules, same visual system, same authorization model, same evidence discipline, same recovery quality, same accessibility baseline and the same reliability standard across every route and every agent.

No route, action, alert, tool, document, workflow or AI response is exempt from this standard.
