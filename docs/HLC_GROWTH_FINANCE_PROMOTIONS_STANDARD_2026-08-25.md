# HLC Growth, Finance & Promotions Operating Standard

Date: 2026-08-25
Status: LOCKED POST-LAUNCH ARCHITECTURE STANDARD
Branch: postlaunch/ia-execution-20260825

## Core principle

HomeLead Connect should reduce work outside the platform. Accounting, marketing, promotions, campaign planning, recurring ideas, offer scheduling, performance tracking and connected-service status should be surfaced inside HLC wherever technically and legally appropriate.

External products are connected once in Settings; day-to-day work is performed from the relevant HLC operating surface.

## Primary placement

### More -> Growth

Growth is the operating home for marketing and promotion work.

Primary tabs:
- Overview
- Campaigns
- Offers
- Content
- Audience
- Calendar
- Ideas
- Analytics

Community Campaigns remain a first-class Community experience for member participation and community activation. Growth Campaigns is the business/marketing control surface that may publish into Community, email, SMS, in-app, public-site and partner channels through approved connections.

### More -> Finance

Finance is the operational finance/accounting surface.

Primary tabs:
- Overview
- Income
- Expenses
- Invoices
- Payments
- Payouts
- Taxes & Categories
- Reconciliation
- Reports

Subscription & Billing remains HLC SaaS account billing. Finance covers the user's business operating money flows. These must not be conflated.

### Settings -> Integrations & Connections

All connection setup belongs here:
- Payments
- Accounting connectors
- Banking/feed connectors where supported
- Email
- SMS/phone
- Calendar
- Storage
- Social/marketing platforms
- Maps
- CRM/business connectors
- Automation platforms
- APIs
- Webhooks

The operational pages consume those connections but do not own credentials or connector setup.

## Finance capabilities

Target capabilities:
- scan receipts and invoices
- OCR extraction with human review
- attach expense to job/vendor/project
- categorize income and expenses
- invoice creation and status tracking
- payment receipt and reconciliation
- deposit and balance tracking
- payout tracking
- tax-category tagging
- downloadable/exportable reports
- aging views
- revenue by service, source, provider, campaign and period
- expense by category, vendor, job and period
- profitability context when source data is sufficient
- audit history for edits and reconciliations

HLC must not silently change accounting records based solely on OCR or AI suggestions. Extracted and AI-derived values require review before becoming canonical where financial risk is material.

## Marketing capabilities

Target capabilities:
- campaign builder
- promotional calendar
- audience segmentation
- channel selection
- reusable templates
- content library
- offer library
- creative ideas
- seasonal suggestions
- recurring promotional cadence
- A/B variants where supported
- approvals
- performance analytics
- attribution to lead/request/source when technically available

## Offer engine

Offer states:
Draft -> Review -> Approved -> Scheduled -> Live -> Paused -> Ended -> Archived

Offer fields:
- title
- purpose
- audience
- service/category
- territory
- start/end
- channel
- terms
- eligibility
- exclusions
- CTA
- owner
- approval state
- budget/cost when relevant
- linked campaign
- linked automation
- outcome metrics

Offer types may include:
- seasonal maintenance
- limited-time service promotions
- first-time participant offers
- referral incentives
- review/re-engagement promotions
- professional recruitment incentives
- partner campaigns
- community participation campaigns
- educational/non-discount campaigns

HLC must not fabricate discounts or promotions on behalf of a service provider. Provider-funded or provider-specific offers require explicit authorization and stored terms.

## Recurring idea engine

HLC should maintain an idea queue rather than generating disconnected suggestions.

Cadences:
- Weekly ideas
- Monthly ideas
- Seasonal ideas
- Holiday/event ideas
- Weather-triggered ideas where data is available
- Local/community ideas
- Service-category ideas
- Provider-recruitment ideas
- Referral/review ideas
- Reactivation ideas

Idea states:
Suggested -> Saved -> Planned -> Converted to Campaign/Offer -> Dismissed

Idea cards should include:
- why now
- audience
- suggested channel
- suggested CTA
- effort level
- required assets
- compliance/approval notes
- expected measurable outcome

Randomized ideas may be used for creative variety, but production scheduling must never be random without explicit rules, eligibility and approval. Randomization is for ideation/rotation, not uncontrolled publishing.

## Seasonal planning

Suggested planning groups:
- Winter readiness
- Spring maintenance
- Summer cooling/outdoor
- Fall preparation
- Storm/weather readiness
- Moving season
- Rental turnover
- Holiday/home-hosting preparation
- New-year home planning
- Professional recruitment cycles

Seasonal plans should be configurable by geography and service category rather than globally assumed.

## Automation

Growth automations may include:
- campaign launch
- scheduled post/message
- audience inclusion/exclusion
- lead-source tagging
- follow-up sequence
- offer expiry
- review/referral request
- re-engagement
- provider recruitment follow-up
- campaign anomaly alert

Finance automations may include:
- invoice due reminder
- failed payment alert
- receipt/document ingestion queue
- reconciliation reminder
- overdue balance alert
- payout status alert

Material financial actions and external publishing should respect approval controls.

## Analytics

Growth analytics:
- campaign reach
- opens/clicks where available
- responses
- requests/leads
- matches
- appointments
- jobs
- reviews/referrals
- conversion rate
- source attribution
- cost/performance where available

Finance analytics:
- revenue
- collected vs outstanding
- expenses
- gross margin context where data supports it
- job profitability context
- recurring revenue
- refunds/failed payments
- aging

## AI placement

Kendrell:
- budget/approval summaries
- risk alerts
- campaign approval oversight
- financial anomaly summaries

Dion:
- operational campaign impact
- lead/job conversion
- service/category performance
- revenue and workload implications

Diamond:
- messaging ideas
- community campaigns
- engagement
- reviews/referrals
- customer-facing promotional concepts

AI may suggest copy, segments, offers, timing and ideas, but must not publish, charge, refund, alter accounting truth, or create binding promotional terms outside configured approval policy.

## No-orphan rule

Growth, finance, offers, marketing ideas and accounting integrations are now protected by the HLC no-orphan/no-regression checkpoint. Future navigation consolidation must classify each capability as KEEP, MERGE, MOVE, RENAME, REDIRECT, RETIRE or BLOCKED before removal or replacement.
