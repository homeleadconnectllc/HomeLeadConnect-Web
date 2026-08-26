# HomeLead Connect — Master Launch Route Matrix

Use with `MASTER_FIVE_STAR_PRODUCT_STANDARD.md`.

Every listed route must receive status, exact-head evidence, wiring verification, mobile QA, desktop QA, and gap disposition before a launch claim.

## Public / access
- `/`
- `/app`
- `/portal`
- `/contact`
- `/request-service`
- `/about`
- `/homeowners`
- `/contractors`
- `/how-it-works`
- `/leadscope`
- `/community`
- `/services`
- `/pricing`
- `/trust`
- `/professionals`
- `/demo`
- `/professional-application`
- `/accessibility`
- `/privacy`
- `/terms`
- `/platform-disclosure`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/portal/accept`
- `/team/accept`

## Resident / professional portals
- `/homeowner-portal`
- `/homeowner-portal/requests`
- `/homeowner-portal/appointments`
- `/homeowner-portal/jobs`
- `/homeowner-portal/documents`
- `/homeowner-portal/profile`
- `/homeowner-portal/settings`
- `/homeowner-portal/properties`
- `/homeowner-portal/matches`
- `/contractor-portal`
- `/contractor-portal/profile`
- `/contractor-portal/services`
- `/contractor-portal/documents`
- `/contractor-portal/team`

## Shared communications
- `/messages`
- `/notifications`

## Command / operations
- `/dashboard`
- `/start-here`
- `/ecosystem`
- `/workflow`
- `/automations`
- `/activity`
- `/analytics`
- `/hq/approvals`
- `/hq/system-health`

## Work lifecycle
- `/leads`
- `/leads/:leadId`
- `/estimator`
- `/jobs`
- `/jobs/:jobId`
- `/calendar`
- `/follow-ups`
- `/documents`
- `/documents/scan`
- `/call-center`
- `/manual-communications`

## Network
- `/network`
- `/map`
- `/network/map`
- `/profiles`
- `/providers`
- `/providers/:providerId`
- `/matching`
- `/network/service-areas`
- `/network/availability`
- `/network/eligibility`
- `/network/saved`

## Community
- `/community-hub`
- `/community/discussions`
- `/community/reviews`
- `/community/referrals`
- `/community/events`
- `/community/moderation`
- `/community/groups`

## Resources / account
- `/help`
- `/tutorials`
- `/rules`
- `/resources/forms`
- `/profile`
- `/settings`
- `/settings/billing`
- `/team`

## AI team
- `/hq`
- `/operations`
- `/customer-experience`
- `/hq/dedication`

## Cross-route gates for every route

For each route record:
- Status: GREEN / YELLOW / ORANGE / RED / DEFERRED
- Primary user and task
- First-view clarity
- Navigation entry and exit
- Search/discovery
- Core actions
- Backend/API/RPC dependency
- Data table/state affected
- RLS/authorization evidence
- Alerts or notifications emitted/consumed
- Agent ownership/context
- Loading/empty/error/permission states
- Mobile 320–430px containment
- iPhone keyboard/safe-area behavior where relevant
- Desktop regression
- Accessibility
- Performance
- Exact commit SHA
- CI run(s)
- Immutable Cloudflare preview
- Human QA date/result
- Known gaps
- Approved disposition

## Program-wide feature families requiring end-to-end wiring certification

1. Request → Lead → LeadScope → Provider → Schedule → Job → Completion
2. LeadScope Measure → measurement evidence → quantities → preliminary estimate → professional verification
3. Estimate → accepted estimate → job conversion
4. Provider discovery → match → service area/availability evidence → assignment
5. Appointment → reminders/notifications → job handoff
6. Messages/calls → persisted history → disposition → follow-up
7. Document intake → processing/review → linked record → audit trail
8. Stripe checkout → signed webhook → entitlement → billing UI
9. Notification event → targeting → delivery → deep link → read state
10. Contextual agent → authorized page context → response/action guidance → audit/fallback
11. Team invite → role → workspace membership → access/revocation
12. Portal request → shared business record → status/document/message visibility

No family is GREEN until the full trigger-to-visible-result path is proven.
