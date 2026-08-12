# HomeLead Connect Full Ecosystem Gap and Launch Map

**Date:** 2026-08-11  
**Governing branch:** `sprint/ecosystem-integration`  
**Production rule:** `main`, the live database, and production remain unchanged until a branch build and complete browser acceptance pass succeed.

## 1. Executive truth

HomeLead Connect is not launch-complete. It has a meaningful authenticated application foundation and a live Carrd marketing presence, but the public acquisition surface and the application are not yet one proven system.

The current public domain is a one-page Carrd site. Its About, Platform, Contact, Privacy, Terms and Demo experiences live on separate Carrd subdomains. The two homepage hero buttons both lead to the demo page. The planned same-domain public page architecture and distinct journeys for residents, professionals and partners are therefore **MISSING or UNPROVEN**.

The launch product remains a B2B SaaS plus marketplace:

- Homeowners and renters use discovery/request experiences without a SaaS fee.
- Businesses and contractors pay HLC for software access or an explicitly approved acquisition offer.
- HLC is a technology/referral platform, not the contractor or service provider.
- Contractor-to-customer service payments remain off-platform at launch.
- `workspace_id` remains the tenant boundary.
- Existing CRM, Supabase, scheduling and auth architecture must be extended, not duplicated.

## 2. Canonical domain architecture

| Surface | Purpose | Canonical destination | Current state |
|---|---|---|---|
| `homeleadconnect.org` | Public acquisition, education, trust, legal, service request and professional conversion | Existing Carrd site, reorganized as the public front door | **BROKEN** as an ecosystem: live but fragmented across Carrd subdomains |
| `app.homeleadconnect.org` | Login, portals, SaaS workspaces, CRM, operations and agents | Existing React/Supabase application | **UNPROVEN** end to end |
| Public forms | Request service, professional application, demo, contact, partner inquiry | One canonical intake API with source attribution and idempotency | **UNPROVEN** |
| Stripe-hosted surfaces | HLC SaaS subscription Checkout and customer portal | Stripe, synchronized to workspace entitlement by signed webhooks | **UNPROVEN** |
| Communications providers | Calls, text, email and device handoff | Provider-agnostic adapter; phone-native handoff works without Google | **UNPROVEN** |

## 3. Public-first page map

The first release should preserve Carrd and use the available homepage plus nine additional pages. All pages need the same logo, header/footer, contact identity, legal links, mobile behavior and analytics conventions.

| Order | Public page | Primary audience | Required content | Primary CTA | Destination | Status |
|---:|---|---|---|---|---|---|
| 1 | Home | Everyone | Clear value proposition, resident/professional/partner paths, trust, service categories, how it works | Choose a path | Homeowners, Professionals or Partners | **BROKEN**: both current hero CTAs lead to Demo |
| 2 | Homeowners & Renters | Residents | Service categories, what HLC does/does not do, safety, request expectations, no-guarantee disclosure | Request service | Canonical `/request-service` intake | **MISSING** on the live public domain |
| 3 | Professionals | Contractors, subcontractors and trades | Who qualifies, service areas, profile requirements, opportunity model, subscription/acquisition offer | Join as a professional | Registration/application with role intent | **MISSING** on the live public domain |
| 4 | Services & Network | Everyone | Roofing, painting, HVAC, plumbing, electrical, cleaning, moving, landscaping/tree, water damage, general home services and expandable taxonomy | Find/request help | Request flow with category preselected | **MISSING** |
| 5 | Platform | Businesses and partners | CRM, LeadScope, scheduling, communications, portals, Network/Map, Community and agent team—only truthful availability labels | Request demo | Demo form with persona/source | **WORKING** as isolated Carrd copy; product claims remain **UNPROVEN** |
| 6 | How It Works | Everyone | `Request → Lead → LeadScope → eligible provider offer → acceptance → schedule → work → review/referral` | Start | Persona-appropriate intake | **MISSING** as a public Carrd page |
| 7 | About & Trust | Everyone | Company, mission, contact, platform role, safety/due diligence, brand attribution | Contact HLC | Contact | **WORKING** as isolated Carrd page; navigation integration **BROKEN** |
| 8 | Pricing & Offers | Businesses | Approved plans, trial, entitlement, cancellation; separate any `5 Confirmed Appointments = $250` acquisition offer from SaaS | Subscribe or talk to HLC | Stripe Checkout only after offer approval; otherwise contact | **UNDEFINED** because current source material conflicts on offer and $99/month plan |
| 9 | Demo, Contact & Help | Everyone | Demo form, contact form, phone `717-288-1785`, canonical public email `info@homeleadconnect.org`, FAQ, response expectations, accessibility/support path | Submit | Canonical CRM intake plus receipt | **UNPROVEN**; the published identity is established, but mailbox delivery and form-to-CRM receipt require operational tests |
| 10 | Legal, Privacy & Safety | Everyone | Terms, privacy, platform disclosure, communications consent, cookies, accessibility, community rules, provider disclosure, deletion/export request | Manage request / contact | Verified privacy workflow | **UNPROVEN** and attorney review required |

### Public navigation

**Header:** Home · Homeowners & Renters · Professionals · Services · Platform · How It Works · About · Help · Login  
**Prominent action:** Request Service  
**Footer:** Contact · Pricing · Demo · Privacy · Terms · Platform Disclosure · Accessibility · Community Rules · Status

Do not expose the long internal SaaS navigation on the public marketing surface.

## 4. Role and profile ecosystem

| Participant | Canonical profile requirements | Primary experience | Status |
|---|---|---|---|
| Homeowner | Identity/contact, property/service location, request history, preferences, consent, documents/photos, appointments, messages | Request + homeowner portal | **UNPROVEN** |
| Renter | Identity/contact, service location, owner/manager authorization where relevant, request history, preferences, consent | Resident request + homeowner/resident portal variant | **MISSING** as a defined workflow |
| Contractor business | Legal/business identity, service categories, service areas, availability, insurance/license evidence where applicable, subscription, staff, portfolio, reviews | Professional onboarding + workspace | **UNPROVEN** |
| Subcontractor / crew member | Parent business, trade/skills, territory, availability, permissions, assignment history | Mobile field experience | **FUTURE / UNDEFINED** |
| Trade professional | Normalized trade taxonomy plus trade-specific evidence; no fabricated verification | Directory/profile + contractor portal | **MISSING** |
| Partner | Organization, partnership type, territory, contacts, permissions and referrals | Partner intake/portal | **MISSING** |
| HLC owner/admin | Workspace/owner privileges, approvals, escalations, audit and system health | HQ | **UNPROVEN** |
| Appointment setter / sales / dispatcher | Scoped queues, scripts, contact permission, dispositions, next actions | Call Center and CRM | **UNPROVEN** |

Trade categories must be data-driven, not separate hard-coded products. Initial taxonomy includes roofing, painting, HVAC, plumbing, electrical, cleaning, moving, landscaping/tree, restoration/water damage, handyman and general contracting. Each supports specialties, service radius, emergency availability, residential/commercial capability and evidence fields.

## 5. Agent and chatbot operating map

| Agent | Scope | Where present | Required behavior | Status |
|---|---|---|---|---|
| Kendrell / Ken / Bossman Ken | Executive command, risk, approvals, system summaries, cross-agent orchestration | HQ and contextual owner surfaces | Threaded chat, workspace context, approval queue, explainable recommendations, handoff to Dion/Diamond, audit record; never silently perform irreversible actions | **UNPROVEN**; dedicated workspace exists, global contextual chat is missing |
| Dion | Operations and business intelligence: leads, LeadScope, jobs, providers, schedules, Call Center and reporting | Operational pages | Threaded “Ask Dion,” current-record context, next actions, safe drafts, operational handoffs and measured outcomes | **UNPROVEN** |
| Diamond | Customer experience, onboarding, communications, Community, reviews, referrals and brand | Customer/CX surfaces | Threaded “Ask Diamond,” role tutorials, message drafting, community moderation assistance, feedback recovery and handoffs | **UNPROVEN** |
| Public concierge | Route visitors without exposing private data or claiming a match exists | Public pages | Explain choices, collect minimal consented intake, escalate to human; no account data before authentication | **MISSING** |

Every assistant needs a real conversation thread, composer, history, scoped context, citations/record links, action preview, confirmation for consequential writes, failure state, handoff, and audit trail. An avatar or static guidance drawer is not a working agent.

## 6. End-to-end product spine

| Stage | Canonical record/action | Required next route | Gate | Status |
|---|---|---|---|---|
| Discover | Public page + campaign attribution | Persona landing page | Truthful content and working links | **BROKEN** |
| Request | Validated, consented intake | Confirmation + canonical lead | Idempotency, attribution, receipt | **UNPROVEN** |
| Lead | One CRM lead with timeline | Lead detail | Workspace authorization | **UNPROVEN** |
| LeadScope | Four-state evidence and itemized estimate | Estimate approval/job creation | No fabricated evidence or measurements | **UNPROVEN** |
| Job | Job created from approved operational facts | Eligible-provider workflow | Transition invariants | **UNPROVEN** |
| Eligibility | Filtered provider candidates | Offer | Approved rules only | **UNDEFINED** |
| Offer | Provider offer with expiry/status | Accept/reject | Authorized provider, auditable response | **UNPROVEN** |
| Assignment | One active accepted assignment | Schedule | Atomic assignment rule | **UNPROVEN** |
| Appointment | Scheduled visit/job | Portals + notifications | Conflict and reschedule handling | **UNPROVEN** |
| Work | Status, checklist, notes, media and communications | Completion | Role permissions and audit | **MISSING / UNPROVEN** |
| Completion | Completion record | Review/referral | Customer-visible confirmation | **MISSING** |
| Retention | Review, referral, re-engagement | Community/profile/CRM | Moderation and consent | **MISSING** |

## 7. Complete gap register

### P0 — launch blockers

1. **Public routing is fragmented.** Same-domain public pages are not implemented; primary CTAs are not persona-specific.
2. **Forms are not proven end to end.** Demo, contact, resident request and professional application need canonical CRM records, attribution, idempotency and receipts.
3. **Business identity reconciliation.** `info@homeleadconnect.org` is the canonical public HLC email. Any `homeleadconnect@gmail.com` reference is legacy/internal unless explicitly retained for provider administration. Before launch, send and receive a real message through `info@homeleadconnect.org` and record the evidence; do not use public page text as proof of mailbox delivery.
4. **Brand asset equivalence is unproven.** Required locked logo/seal/emblem filenames are absent from the repository, although agent avatars exist.
5. **Auth matrix is unproven.** Email/password, recovery, invitations, homeowner links, contractor links, workspace membership and cross-tenant denial need complete tests. Phone/passkey/social login are not approved merely because they are desirable.
6. **Workflow transitions are unproven.** Request-to-lead, LeadScope-to-job, offer acceptance, one-active-assignment and scheduling must be verified through UI, persistence and authorization.
7. **Call Center is not proven as the daily workspace.** Queue, lead context, searchable/editable/copyable scripts, dispositions, follow-up, device calling, messages and history need acceptance tests.
8. **Universal phone behavior is unproven.** `tel:`, `sms:` and `mailto:` handoff must work on supported mobile devices independent of Google; Twilio/Google Voice remain optional connectors.
9. **Billing entitlement is unproven.** Approved plan/offer, Checkout, portal, signed idempotent webhooks, workspace entitlement, trial/cancel/past-due states and receipts need reconciliation.
10. **Legal/control parity is unproven.** Posted policy promises must match product controls for consent, STOP suppression, data access/correction/deletion, cookies and provider disclosure. Attorney review remains required.
11. **Observability and recovery are missing/unproven.** Error reporting, audit review, uptime, backups, restore test, incident response and rollback evidence are launch gates.
12. **Accessibility and browser acceptance are unproven.** Keyboard, screen reader semantics, contrast, reduced motion, text resize, iOS/Android, Safari/Chrome and desktop flows need evidence.

### P1 — next complete ecosystem layer

- Canonical provider directory and profile pages.
- Map/list experience with privacy-safe pins, filters and links to canonical records.
- Community home, discussions, updates, reviews, referrals, events and moderation.
- Customer self-service for request status, estimate review, appointments, messages and more-work requests.
- Provider mobile day view, job checklist, photos, notes, arrival/status updates and issue escalation.
- Role tutorials, searchable help center, contextual onboarding and product changelog.
- Review requests, referral tracking and reputation evidence without an invented score formula.
- Imports/exports, integrations directory, webhook/API governance and accounting handoff.

### Future — explicitly not launch assumptions

- Automatic ranking or autonomous provider matching.
- HLC-held contractor/customer funds, escrow or service-payment processing.
- Full renter/property-manager authorization workflows.
- Subcontractor crew payroll or workforce management.
- Automated license/insurance verification without an approved source and rules.
- Advanced AI forecasting, autonomous dispatch or reputation formulas.

## 8. Patterns worth adopting—without copying products

Current home-service platforms reinforce several useful capability patterns:

- A customer portal should allow request review, quote/estimate decisions, appointment visibility, messages and repeat requests.
- Dispatch should consider schedule, service area, trade/skill and current assignment state, but HLC must not invent ranking thresholds.
- Online booking needs service definitions, coverage areas, availability and clear confirmation—not merely a calendar link.
- Providers need preference/category/service-area controls so opportunities are relevant.
- Automated reminders, arrival updates and change notifications reduce uncertainty.
- Job instructions, media and checklists belong on the canonical job record.
- Reviews/referrals should originate from a verified completed relationship and pass moderation rules.

## 9. Navigation architecture inside the app

Keep one top navigation, grouped by role. Do not reintroduce the duplicate sidebar.

| Group | Business workspace | Homeowner/renter | Provider | Owner/admin |
|---|---|---|---|---|
| Overview | Dashboard | Portal Home | Portal Home | HQ + Ecosystem |
| Growth | Leads, Pipeline, Follow-ups | Request More Work | Opportunities | Reports |
| Work | LeadScope, Jobs, Calendar | Requests, Estimates, Appointments | Offers, Jobs, Schedule | Operations |
| Connect | Call Center, Messages | Messages, Community | Messages, Community | Communications health |
| Network | Contractors, Map | Find Providers, Map | Profile, Network | Moderation |
| Resources | Documents, Help | Documents, Help | Documents, Help | Policies, audit |
| Account | Settings, Billing | Profile, preferences | Business profile, team, billing | Workspace/security/integrations |

The current long flat authenticated navbar is therefore **BROKEN against the intended architecture**, even though its individual links render.

## 10. Launch sequence

1. **Public truth and routes:** freeze canonical page names, consolidate Carrd navigation, split CTAs by persona and connect every form to canonical intake.
2. **Identity and tenant proof:** verify login/recovery/invitations/portal links/RLS across roles and devices.
3. **Golden journey:** prove Request → Lead → LeadScope → Job → Offer → Assignment → Appointment → Work → Completion.
4. **Communication proof:** phone-native handoff, provider connectors, consent/suppression, history and Call Center.
5. **Portal proof:** homeowner/renter and provider experiences with only authorized records.
6. **Billing proof:** approved product/price, Stripe lifecycle and database entitlement.
7. **Protection proof:** policies, controls, accessibility, security, deletion/export and moderation.
8. **Operations proof:** monitoring, backups/restore, incident response, support ownership and rollback.
9. **Preview acceptance:** phone and desktop, all public links, every role, empty/error/loading/offline/denied states.
10. **Controlled launch:** merge to release first, then promote only after evidence review; production smoke test and rollback watch.

## 11. Definition of launch-ready

HLC is launch-ready only when every P0 row has an accountable owner, an executable acceptance test, evidence from the deployment candidate, and no unresolved **BROKEN**, **MISSING** or **UNDEFINED** state. **UNPROVEN** becomes **WORKING** only after browser, authorization, persistence, provider and mobile evidence agree.

This map governs implementation planning; it does not represent unbuilt features as complete.
