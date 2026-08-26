# HLC Manuals, Instructions, Directions, SOPs, Policies, and Rules Standard

Status: LOCKED post-launch architecture contract
Branch: postlaunch/ia-execution-20260825

## Purpose
HomeLead Connect must separate educational guidance from enforceable policy so people can find the right kind of help quickly and staff can operate consistently.

## Canonical placement

### Resources → Manuals & SOPs
Long-form operating references and repeatable procedures.

Subsections:
- Platform Manuals
- Operations Manuals
- Call Center Manual
- Lead Management Manual
- Estimating Manual
- Matching Manual
- Scheduling & Dispatch Manual
- Job Management Manual
- Communications Manual
- Community & Moderation Manual
- Professional Portal Manual
- Resident Portal Manual
- Billing & Subscription Manual
- Integrations Manual
- Security & Privacy Manual
- AI Agent Operations Manual

Each manual should contain:
- purpose
- audience / role
- prerequisites
- step-by-step procedure
- screenshots or visuals where useful
- decision points
- exceptions / escalation path
- related forms, scripts, and checklists
- version and last-reviewed date
- owner / approver

### Resources → Instructions & Directions
Short task-oriented guidance for a specific action.

Examples:
- Create a lead
- Schedule an appointment
- Reschedule a visit
- Build and send an estimate
- Start a provider match
- Use the map
- Upload a document
- Scan an invoice
- Request an e-signature
- Connect Google Calendar
- Connect Gmail
- Connect a phone/SMS provider
- Connect Stripe
- Configure a webhook
- Invite a team member
- Set a service area
- Change notification preferences
- Report a safety concern

Instruction format:
1. What this does
2. Before you begin
3. Steps
4. What success looks like
5. Common problems
6. Related actions

### Resources → Checklists
Actionable completion lists used within records and workflows.

Examples:
- New lead qualification checklist
- Estimate readiness checklist
- Match eligibility checklist
- Appointment confirmation checklist
- Pre-job checklist
- Job completion checklist
- Photo/document checklist
- Professional onboarding checklist
- Provider verification checklist
- Community moderation checklist
- Campaign launch checklist
- Integration setup checklist
- Incident response checklist

Checklists may be reusable templates but should be instantiated on the related record when operational tracking matters.

### Resources → Rules & Safety
Enforceable rules, safety requirements, compliance requirements, conduct standards, and escalation/reporting paths.

Subsections:
- Platform Rules
- Community Rules
- Communications & Consent Rules
- Provider Conduct
- Resident Conduct
- Review Rules
- Referral Rules
- Campaign Rules
- Service Safety
- Privacy & Data Handling
- Document & Signature Rules
- Payment & Billing Rules
- AI Usage & Approval Rules
- Reporting & Appeals

Rules content must identify:
- who the rule applies to
- required behavior
- prohibited behavior
- enforcement / consequence
- reporting mechanism
- escalation / appeal path when applicable
- effective date and version

### Help Center
Help Center is the searchable answer layer. It may summarize or link to Manuals, Instructions, Rules, Tutorials, Scripts, Forms, and Checklists, but it is not the canonical source for governed operating procedures.

### Tutorials
Tutorials are guided learning paths. They teach users how to complete journeys and should link to the underlying Instructions or Manuals for reference.

### Contextual guidance
The application should surface relevant guidance where work happens without duplicating canonical content.

Examples:
- Leads → qualification instructions + call scripts + qualification checklist
- Estimates → estimating manual + estimate readiness checklist
- Matching → matching instructions + eligibility rules
- Calendar → scheduling instructions + confirmation checklist
- Jobs → job SOP + completion checklist + required forms
- Call Center → call-center manual + approved scripts + dispositions
- Community → moderation manual + community rules
- Campaigns → campaign manual + launch checklist + messaging rules
- Documents → document handling/manual + signature rules
- Settings → integration instructions and connection-health guidance

## Governance model
Every governed knowledge item should carry:
- ID
- title
- type: manual | instruction | direction | SOP | checklist | rule | policy
- audience / roles
- owner
- approver where required
- status: draft | approved | deprecated
- version
- effective date
- last-reviewed date
- related routes
- related record types
- related scripts/forms/checklists

## Search and navigation
Resources Home should provide one search across:
- Manuals & SOPs
- Instructions & Directions
- Scripts Library
- Forms & Documents
- Checklists
- Help Center
- Tutorials
- Rules & Safety

Users should be able to filter by role, task, product area, and content type.

## No duplication rule
Canonical governed content exists once. Contextual pages link to or render the canonical item. Do not create separate copies of the same rule/manual on multiple screens.

## No-orphan rule
No existing or future manual, instruction, SOP, checklist, policy, or rule may be removed, merged, renamed, or relocated without a migration mapping and replacement destination.
