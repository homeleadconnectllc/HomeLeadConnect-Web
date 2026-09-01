# HLC Implementation & Acceptance Contract

Status: LOCKED
Date: 2026-09-01

## Completion states
ARCHITECTED -> FOUNDATION -> WIRED -> VERIFIED

A route existing is only FOUNDATION.

A feature is not VERIFIED until all applicable conditions are evidenced:
- correct role can reach it
- wrong role cannot reach restricted functionality
- entitlement/trial policy behaves correctly
- real data is wired where required
- loading, empty, and error states work
- mobile and desktop work
- visual storytelling is present
- contextual agent behavior is correct
- cross-route handoffs work
- consequential actions require deliberate confirmation
- existing production routes remain compatible
- exact-head CI passes

## Home `/dashboard`
Required: Daily Brief, Action Required, Today, Continue, Recommended Next Actions, Visual Work, Community Pulse, Academy Progress, role-specific Quick Actions.
Primary agent: Resident Diamond / Professional Dion / Manager Kendrell.
Must not: show competing agents, let Community overtake urgent Work, fabricate AI recommendations, or unpredictably rearrange the whole layout.

## Work `/work`
Required: Needs Attention, Today’s Work, Pipeline, Recent Projects, Provider Capacity, Dion Brief.
Lifecycle: Request -> Lead -> Match -> Appointment -> Job -> Completion -> Follow-Up.
Every record exposes stage, responsible party, next action, blocker.
Standard blockers: Waiting on resident; Waiting on provider; Needs match; Needs appointment; Missing document; Materials not ready; Compliance review; Manager approval.

## Operational Matching `/work/matching`
Inputs: trade/service fit, service area, availability, compliance, capacity/workload, relevant history.
Required sequence: Recommendation -> Why this match? -> Review -> Confirm Assignment.
No silent assignment.

## Community Swipe `/community/swipe`
Discovery only. Role modes:
- Resident: Project Help / Trusted Local Pros / Recommendations
- Professional: Referral Partners / Subcontractors / Opportunities / Mentors
- Manager: Talent Discovery / Backup Providers / Specialty Trades / Network Expansion
Flow: Discover -> Save/Pass/Interested -> Connection Request -> Acceptance -> Community Messenger.
No percentage without enough real data; otherwise use Strong Fit / Good Fit / Potential Match. Match Score and Match Confidence remain separate.

## Community Messenger `/community/messages`
Unlock only after a legitimate Community relationship or other explicit permission. Supports profiles, referrals, Community posts, events, project examples, Academy achievements, networking/collaboration. Real work transitions through Start Service Request into core HLC; operational messages remain `/messages`.

## Network + Map
`/network` = directory/discovery. `/network/map` = spatial intelligence.
Modes: Providers, Work, Coverage, Community, Suppliers, Logistics.
Map must not leak resident exact locations, provider private/home addresses, or any precision beyond authorization.

## Member Profiles
One underlying profile model with role-specific presentation. Trust signals remain distinct: identity, business, insurance/compliance, Academy credentials, Community reputation. No vague merged “Verified” signal.

## Reviews + Referrals
Review = experience. Referral = trust/introduction.
Verified Service Review requires legitimate service relationship evidence. Community Recommendation may represent trust without pretending service occurred. Matching can use both only with distinct meanings/weights.

## Academy `/academy`
Learn -> Practice -> Simulate -> Certify -> Apply -> Progress.
Teacher authority: Kendrell (leadership/compliance/risk/governance), Dion (operations/CRM/matching/scheduling/scripts/Call Center/analytics), Diamond (resident/customer/community/reviews/referrals/onboarding).
Academy credentials must never masquerade as external licenses, insurance, or government credentials.

## Arcade
May reward useful learning/workflow behavior. May not manufacture trust or reward positive review sentiment, job volume, spending, rushing safety steps, or spammy referrals.
Prefer meaningful named achievements over arbitrary public levels.

## Roleplay Studio `/academy/roleplay`
Simulation data must remain distinct from live CRM data.
Loop: Scenario -> Conversation -> Score -> Dion Coaching -> Replay -> Mastery.
Score dimensions: Discovery, Listening, Clarity, Qualification, Compliance, Empathy, Next-Step Control, Documentation, Outcome.

## Scripts + Knowledge `/academy/library`
One versioned source for Scripts, Playbooks, Knowledge Articles, Policies & Rules, Training Content.
Modes: Guide, Assisted, Practice.
Approved items require owner, version, status, effective date, role visibility, access level, linked workflows, linked Academy content, agent ownership. Retired content remains traceable.

## Resources `/resources`
Top-level question: What are you working on?
Supplier cards must use HLC visual context and useful actions rather than naked URLs. Do not claim current price/inventory without legitimate data; otherwise link to Check current price / Check availability.

## Materials
States: Needed -> Considering -> Purchased -> On Site -> Used -> Returned.
May connect to photos, receipts, Documents, jobs, suppliers, routing.

## Analytics `/analytics`
Contract: Metric -> Explanation -> Why? -> underlying records. Causes must be evidence-supported.

## Forecasting + Sandbox
Distinct labels: REAL DATA, FORECAST, SIMULATION.
`/analytics/sandbox` must visibly state Simulation Only. No simulation control may modify production SLA, provider assignment, appointment, route, billing, or customer data. Real implementation changes require deliberate review.

## Notifications
Attention hierarchy: Action Required -> Worth Knowing -> Community -> Progress.
Internal priority: Critical -> High -> Normal -> Low -> Celebration.
Meaningful action outranks streaks; low priority can bundle; quiet hours and channel controls apply; Community marketing controls remain separate from service notices; agent alerts explain why.

## Trial + Entitlements
Placement and entitlement remain separate. Same route can move FULL PREVIEW -> LIMITED MODE -> membership gate without moving/deleting user data.
Never erase saved matches, completed training, earned achievements, legitimate history, or profile identity solely because trial access ends.

## Visual acceptance
A technically functional page can still fail acceptance if visually sterile. Major surfaces must intentionally use contextual imagery, project/trade visuals, profile imagery, maps/location context, progress graphics, agent presence, meaningful empty states, and motion where useful. Visuals must explain person, project, place, trade, status, progress, or achievement.

## Mobile A+ and Experience Expansion
Mobile A+ stays S1-S7. Experience Expansion follows:
- E1 Community Premium
- E2 Academy + Arcade
- E3 Roleplay + Knowledge
- E4 Resources + Sourcing
- E5 Intelligence
- E6 Trial + Entitlements
- E7 Visual Certification

No feature reaches VERIFIED without attached evidence: exact SHA/CI where applicable, route proof, role/access tests, mobile/desktop evidence, data/API evidence where required, entitlement tests, negative tests for restricted behavior, and compatibility checks.
