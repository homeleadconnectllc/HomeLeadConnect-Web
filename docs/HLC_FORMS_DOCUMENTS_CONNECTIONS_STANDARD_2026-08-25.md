# HLC Forms, Documents, Checklists, E-Sign, Scan & Connections Standard

Status: LOCKED POST-LAUNCH ARCHITECTURE
Branch: postlaunch/ia-execution-20260825

## 1. Core rule
HLC must support operational paperwork without creating duplicate standalone systems.

Canonical ownership:
- Resources -> Forms & Documents owns reusable forms, document templates, scanning, editing, signing, OCR, document generation and archival.
- Work records expose contextual document/form/checklist actions for the current Lead, Estimate, Job, Follow-Up, Appointment, Resident Portal or Professional Portal record.
- Settings -> Integrations & Connections owns all external connection wiring, credentials, provider status, sync rules, APIs, webhooks and failures.

## 2. Forms & Documents information architecture
Resources -> Forms & Documents

Primary tabs:
1. My Documents
2. Shared
3. Forms
4. Checklists
5. Templates
6. Scans & Imports
7. Signatures
8. Generated
9. Archive

### Forms
Support reusable structured forms for:
- service request intake
- lead qualification
- property/project details
- estimate approval
- change request
- job intake
- job completion
- incident/safety report
- customer feedback
- review/referral consent
- professional onboarding
- provider verification
- company/team onboarding
- communication consent
- payment/billing enrollment where approved

Form capabilities:
- text, number, currency, date/time, address, phone, email
- dropdown, multi-select, radio, checkbox, yes/no
- photo/video/file upload
- signature/date initials
- required/optional fields
- conditional sections
- role/audience visibility
- draft/save/submit
- validation
- template cloning
- record attachment
- audit timestamps

### Checklists
Checklist types:
- lead qualification
- estimate readiness
- provider eligibility
- appointment readiness
- pre-job
- arrival/start-job
- safety
- work-in-progress
- quality control
- completion
- post-job follow-up
- professional onboarding
- integration setup
- launch/QA/admin

Checklist requirements:
- assignee
- due date
- required vs optional steps
- evidence attachment
- completion timestamp
- blocker state
- reopen/history
- automation trigger capability

### Documents
Document classes:
- estimates
- scopes
- contracts/service agreements
- invoices
- receipts
- change orders
- permits
- licenses
- insurance
- warranties
- inspection reports
- photos/before-after evidence
- onboarding paperwork
- policies/rules
- customer/provider correspondence

Document record metadata:
- document type
- title/file name
- associated person/business/property/project/lead/job
- owner/uploader
- status
- created/updated/signed dates
- version
- visibility/permissions
- retention/archive state
- signature state
- source (generated/uploaded/scanned/imported)

## 3. Editing and generation
HLC should support document workflows in stages:

### Native structured editing
Preferred for HLC-generated documents.
- edit fields before generation
- generate PDF/document from canonical record data
- regenerate new version rather than silently overwriting signed/final records

### Uploaded file editing
Support when technically appropriate:
- rename and classify
- metadata editing
- annotations/comments
- fill fields
- attach to records
- version replacement with history

Do not promise arbitrary full Word/PDF desktop-editor parity inside HLC. For unsupported rich editing, use connected external editors/storage providers while retaining the HLC record link and audit history.

## 4. E-signature
HLC requires a governed signature workflow.

Signature states:
Draft -> Sent for Signature -> Viewed -> Partially Signed -> Signed -> Declined -> Expired/Void

Support:
- signer identity/contact
- signer order when needed
- signature/initial/date fields
- consent acknowledgement
- timestamp
- immutable final signed artifact
- audit trail
- resend/reminder
- expiration/void
- record association

Signed/final documents must not be silently mutable. Changes produce a new version/amendment.

## 5. Scan, camera, invoice capture and OCR
Mobile-first scan flow:
Camera / Photo Library / File Import -> Crop/Deskew -> Enhance -> OCR/Extract -> Review -> Classify -> Attach -> Save

Target document capture:
- invoice
- receipt
- estimate
- contract
- business card/contact sheet
- permit/license
- insurance certificate
- handwritten field note where OCR quality permits

Invoice extraction target fields:
- vendor/provider
- invoice number
- invoice date
- due date
- subtotal
- tax
- total
- line items where confidence is adequate
- payment status when supplied
- job/customer/project reference

OCR output must be reviewable before it becomes canonical business data. Low-confidence extraction requires human confirmation.

## 6. Contextual placement by work area

### Lead
Actions: Add Form, Qualification Checklist, Upload/Scan Document, Attach Photo, Send for Signature where applicable.

### Estimate
Actions: Generate Estimate, Edit Structured Fields, Add Scope/Photos, Send Approval, Sign/Approve, Change Request, Convert to Job.

### Job
Tabs/sections should surface: Scope, Checklist, Forms, Files/Documents, Signatures, Financials.

### Calendar/Appointment
Use appointment confirmation forms, readiness checklists and attachments without creating a separate document store.

### Follow-Up
Attach script/template/document context and record any required form completion.

### Resident Portal
View/sign approved estimates, agreements, change orders, completion acknowledgements and shared documents.

### Professional Portal
Upload verification paperwork, licenses/insurance, job forms, photos, invoices and signed/required documents.

## 7. Integrations & Connections architecture
Canonical home: Settings -> Integrations & Connections

Primary tabs:
1. Connected Apps
2. Available Apps
3. Communications
4. Calendar & Scheduling
5. Payments & Billing
6. Storage & Documents
7. Maps & Location
8. Automation
9. CRM / Business
10. API & Webhooks
11. Sync Rules
12. Activity
13. Issues

Every connection record must show:
- provider/app name
- category
- connection state
- account/workspace connected
- granted permissions/scopes
- last successful sync/action
- last error
- reconnect/manage action
- disconnect action
- audit/activity link

States:
Connected / Needs Attention / Expired / Limited / Disconnected / Error / Disabled

## 8. Connection categories

### Communications
- Gmail/email providers
- phone providers
- SMS providers
- voicemail/call providers
- device handoff where no direct integration is configured

### Calendar & Scheduling
- Google Calendar
- future supported calendar providers
- external scheduling/booking tools when needed

### Payments & Billing
- Stripe
- approved accounting/invoicing connectors later

### Storage & Documents
- Google Drive
- future OneDrive/Dropbox or document/e-sign providers when justified

### Maps & Location
- map/geocoding/routing provider
- address autocomplete
- service-area/geospatial services

### Automation
- native HLC automations
- Zapier
- Make
- n8n
- generic webhooks

### CRM / Business
- HubSpot and other justified external CRM/business systems where interoperability is needed

### API & Webhooks
- API keys/token management only where permitted
- webhook endpoints
- webhook signing secrets
- event subscriptions
- test delivery
- retry/error history

## 9. Settings ownership rules
Connection configuration belongs in Settings.
Operational use belongs where the work happens.

Examples:
- Connect Google Calendar: Settings -> Integrations & Connections -> Calendar & Scheduling.
- Use/schedule an appointment: Work -> Calendar.
- Connect Gmail/SMS/phone provider: Settings -> Integrations & Connections -> Communications.
- Send a message/call: Communications/record context.
- Connect Stripe: Settings -> Integrations & Connections -> Payments & Billing.
- Review subscription plan: Settings -> Subscription & Billing.
- Configure webhook: Settings -> Integrations & Connections -> API & Webhooks.
- View failed webhook affecting work: Settings -> Integrations & Connections -> Issues, with an alert surfaced in Command Center.

## 10. Security and governance
- No secrets displayed in normal UI after save.
- Least-privilege scopes.
- Role-based manage/disconnect permissions.
- Connection audit history.
- Test connection before marking healthy where possible.
- Reauthorization flow for expired tokens.
- Webhook signature validation.
- Separate connection status from feature entitlement.
- Integration failure must not silently corrupt canonical HLC records.
- User-facing errors should provide recovery action.

## 11. Automation wiring
Integration events may trigger HLC automations, but configuration remains centralized.

Examples:
- Calendar event created -> update appointment state.
- Stripe payment succeeded -> update billing/payment state.
- Document signed -> move workflow stage / create follow-up.
- Invoice scanned -> create review task before posting extracted values.
- Provider connection fails -> Command Center alert + Settings issue.

## 12. No-orphan rule
Before any existing form, document, checklist, upload, signature, billing hook, provider connector, API, webhook, calendar/email/phone/storage integration is moved or renamed, classify it as KEEP, MERGE, MOVE, RENAME, REDIRECT, RETIRE or BLOCKED and preserve data, permissions, links, audit history and tests.
