# HLC Intelligent Call Dispositions Standard

Date: 2026-08-25
Branch: postlaunch/ia-execution-20260825
Status: Locked post-launch architecture standard

## Purpose

HomeLead Connect Call Center should not force staff to choose from a dead dropdown after a call. Dispositioning should help finish the work: identify what happened, recommend the correct outcome, require missing details, trigger the next step, schedule follow-up, surface the right script/rebuttal, update the lead/job/customer state, and create an auditable timeline entry.

## Core model

Each call disposition contains:
- outcome code
- human-readable label
- applicable record types
- required fields
- recommended next action
- optional follow-up timing
- applicable script/rebuttal
- automation trigger
- workflow-stage effect
- escalation rule
- customer communication behavior
- compliance guardrails
- owner/team assignment
- analytics category
- audit metadata

## Disposition families

### Contact outcomes
- Connected — qualified
- Connected — not qualified
- Connected — information only
- Connected — requested callback
- Connected — needs another decision-maker
- Connected — needs more time
- No answer
- Busy
- Left voicemail
- Voicemail unavailable/full
- Wrong number
- Disconnected number
- Language assistance needed

### Scheduling outcomes
- Appointment scheduled
- Appointment rescheduled
- Appointment confirmation pending
- Appointment declined
- No scheduling availability
- Decision-maker unavailable
- Customer requests specific date/time

### Estimate and project outcomes
- Needs estimate
- Estimate sent
- Estimate follow-up required
- Estimate approved
- Estimate declined
- Price concern
- Scope not ready
- Project postponed
- Already has provider
- Comparing options

### Matching/provider outcomes
- Ready for provider matching
- Provider matched
- Provider declined
- Provider unavailable
- No eligible provider found
- Customer wants different provider
- Service area mismatch

### Closed/loss outcomes
- Not interested
- Duplicate request
- Outside service scope
- Outside service area
- Invalid/spam lead
- Customer requested no further contact
- Resolved elsewhere
- Closed — other

### Safety/compliance outcomes
- Do-not-contact request
- Consent issue
- Complaint/escalation
- Safety concern
- Fraud/scam concern
- Harassment/inappropriate contact
- Legal/policy review needed

## Intelligent recommendation behavior

The system may recommend a disposition using available call context, transcript/notes, current workflow stage, previous contact history, requested service, appointment state, customer preferences, provider state, and existing follow-up commitments.

Recommendations are suggestions unless a deterministic rule applies. Consequential outcomes such as Do Not Contact, fraud, safety escalation, account restriction, or legal/policy flags must require explicit human confirmation unless an existing authoritative rule says otherwise.

The UI should show:
1. Suggested disposition
2. Why it was suggested
3. Required fields still missing
4. Recommended next action
5. Follow-up timing
6. Related script/rebuttal
7. Automations that will run if confirmed

## Required-field examples

Appointment scheduled requires:
- date/time
- appointment type
- assigned owner/provider where applicable
- decision-maker attendance confirmation where applicable

Callback requested requires:
- callback date/time or daypart
- preferred channel
- reason/context

Not qualified requires:
- reason category
- optional notes
- whether future reactivation is allowed

Do-not-contact requires:
- channel(s) covered
- customer request source
- confirmation timestamp
- suppression update

## Follow-up intelligence

Disposition confirmation may generate:
- immediate task
- same-day follow-up
- next-business-day follow-up
- scheduled callback
- estimate follow-up
- appointment confirmation
- post-job check-in
- review/referral request
- reactivation reminder

Follow-up timing should respect business hours, quiet hours, consent, communication preferences, and existing scheduled actions.

## Script integration

Call Center should surface relevant approved scripts from the central Scripts Library based on:
- current disposition recommendation
- call stage
- known objection
- audience/persona
- service/project context
- previous contact attempts

Examples:
- Price concern → approved price/value objection handling
- Needs to think → low-pressure follow-up script
- Another decision-maker → decision-maker scheduling script
- No answer → voicemail + text follow-up options
- Already has provider → respectful close / future-resource script

## Workflow effects

A confirmed disposition may update the canonical record, for example:
- Connected — qualified → Qualified
- Needs estimate → Estimate stage
- Ready for matching → Matching stage
- Appointment scheduled → Scheduled
- Not interested → Lost/Closed
- Do-not-contact → suppression + communication guardrail

The disposition engine must never create a second disconnected status system. It maps to the canonical HLC workflow.

## Automation examples

No answer:
- increment contact attempt
- optionally create follow-up
- surface voicemail/text script
- avoid duplicate outreach if another automation is already scheduled

Appointment scheduled:
- create/update appointment
- send confirmation when consent allows
- schedule reminders
- update workflow stage

Estimate follow-up required:
- set next action
- schedule reminder sequence
- stop sequence if estimate is approved/declined

Provider unavailable:
- return record to matching queue
- recommend next eligible provider
- alert operations only when no eligible provider remains

## Analytics

Track:
- disposition frequency
- contact rate
- appointment-set rate
- qualification rate
- callback conversion
- estimate conversion
- no-answer rate
- wrong/disconnected numbers
- loss reasons
- objection frequency
- disposition-to-next-action completion
- agent overrides of suggested dispositions
- automation success/failure after disposition

Do not use disposition analytics as an opaque punitive employee score. Analytics should primarily improve workflow quality, routing, coaching, scripts, and customer experience.

## AI role placement

Dion owns operational disposition intelligence, queue optimization, next-action recommendations, and performance patterns.
Diamond contributes customer-experience language, recovery, objection tone, and complaint handling.
Kendrell handles policy, safety, legal/compliance, high-risk escalations, and approval boundaries.

## Mobile UX

After a call, show a compact wrap-up panel rather than navigating away:
- Suggested outcome
- Required details
- Next action
- Save & Continue

High-frequency dispositions should be one tap; uncommon cases can be searched.

## Governance

Dispositions are centrally configured and versioned. Every change should identify:
- name/code
- description
- required fields
- workflow mapping
- follow-up rule
- automation rule
- script mapping
- compliance implications
- effective date/version

## No-orphan rule

Existing call notes, follow-ups, scripts, communications records, appointments, leads, jobs, suppression state, and workflow history must remain linked when Intelligent Dispositions is introduced.

## Acceptance criteria

- Call Center exposes intelligent disposition recommendations.
- Every confirmed disposition maps to the canonical HLC workflow.
- Required fields are enforced before completion where necessary.
- Next actions/follow-ups can be created in the same wrap-up flow.
- Approved scripts/rebuttals can surface contextually.
- Consent/suppression and safety rules override convenience.
- Disposition changes are auditable.
- Automation outcomes are visible.
- No duplicate status system is introduced.
