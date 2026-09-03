export type AutomationMode = "AUTOMATIC" | "RECOMMEND" | "CONFIRM" | "BLOCKED";

export type HlcAutomation = {
  stage: string;
  name: string;
  owner: "Kendrell" | "Dion" | "Diamond" | "Shared";
  mode: AutomationMode;
  trigger: string;
  outcome: string;
  guardrail: string;
};

export const automationRegistry: HlcAutomation[] = [
  { stage: "Request", name: "Intake normalization and duplicate check", owner: "Dion", mode: "AUTOMATIC", trigger: "A public or assisted service request is submitted.", outcome: "Normalize contact data, preserve attribution and reuse the canonical lead when the idempotency contract matches.", guardrail: "Never merge people or requests using a weak match alone." },
  { stage: "Lead", name: "Next-action recommendation", owner: "Dion", mode: "RECOMMEND", trigger: "A lead enters or changes pipeline state.", outcome: "Suggest owner, priority, follow-up and missing information.", guardrail: "A human owns assignment and material status decisions." },
  { stage: "Estimate", name: "Estimate evidence completeness reminder", owner: "Dion", mode: "AUTOMATIC", trigger: "An operational estimate lacks required known evidence.", outcome: "Identify missing scope, material, quantity, pricing or note fields already required by the estimating workflow.", guardrail: "Unknown information stays unknown; automation never invents quantities or pricing." },
  { stage: "Match", name: "Eligible-provider recommendation", owner: "Dion", mode: "RECOMMEND", trigger: "A job is ready for provider selection.", outcome: "Return providers passing approved trade, territory, status, evidence and availability rules.", guardrail: "Ranking remains blocked until business-approved rules and explanations exist." },
  { stage: "Provider Offer", name: "Offer delivery and expiry", owner: "Dion", mode: "CONFIRM", trigger: "An operator selects an eligible provider and reviews the offer.", outcome: "Send one traceable opportunity with accept, decline and expiry state.", guardrail: "Consent, suppression and provider delivery must pass; no silent assignment." },
  { stage: "Assignment", name: "Acceptance-to-assignment transition", owner: "Dion", mode: "AUTOMATIC", trigger: "The offered provider accepts through an authorized portal.", outcome: "Establish one active assignment and notify authorized participants.", guardrail: "Database constraints prevent multiple active assignments." },
  { stage: "Schedule", name: "Scheduling reminders and conflict checks", owner: "Dion", mode: "CONFIRM", trigger: "An accepted assignment is ready to schedule or reschedule.", outcome: "Recommend valid times, confirm participants and create calendar-linked records.", guardrail: "No appointment is confirmed without explicit time range and authorized acceptance." },
  { stage: "Job", name: "Operational checklist and alerts", owner: "Dion", mode: "AUTOMATIC", trigger: "A job becomes active or misses a required milestone.", outcome: "Surface due work, documents, communications and operational risk.", guardrail: "Automation does not certify work quality or provider compliance." },
  { stage: "Communication", name: "Consent-aware communication routing", owner: "Shared", mode: "CONFIRM", trigger: "A user or agent prepares a call, text or email.", outcome: "Choose device handoff or an authorized connector and retain record context and outcome.", guardrail: "Consent, suppression, quiet hours, destination and content preview must pass." },
  { stage: "Completion", name: "Completion readiness check", owner: "Dion", mode: "CONFIRM", trigger: "An operator proposes job completion.", outcome: "Check work outcome, required documentation, appointment state and unresolved issues.", guardrail: "A human confirms completion; missing evidence blocks downstream review eligibility." },
  { stage: "Review", name: "Verified review invitation", owner: "Diamond", mode: "AUTOMATIC", trigger: "An eligible completed job reaches its approved follow-up window.", outcome: "Invite the authorized customer once and link the response to that completion.", guardrail: "No fabricated, purchased, duplicate or unlinked reviews." },
  { stage: "Referral", name: "Consent-aware referral follow-up", owner: "Diamond", mode: "CONFIRM", trigger: "An eligible participant chooses to refer someone.", outcome: "Capture consent, attribution, invitation status and approved reward decision.", guardrail: "A referral never enrolls another person in marketing without their consent." },
  { stage: "Community", name: "Safety and moderation triage", owner: "Diamond", mode: "RECOMMEND", trigger: "Content is reported or automated safety rules identify risk.", outcome: "Prioritize the report, summarize evidence and recommend the applicable rule.", guardrail: "Authorized humans own removals, restrictions and appeals." },
  { stage: "Billing", name: "Entitlement reconciliation", owner: "Kendrell", mode: "AUTOMATIC", trigger: "A signed Stripe event or scheduled reconciliation changes plan state.", outcome: "Persist subscription truth, notify owners and reconcile workspace entitlement.", guardrail: "Return URLs and browser state never grant paid access." },
  { stage: "Agents", name: "Agent handoff orchestration", owner: "Kendrell", mode: "CONFIRM", trigger: "Dion or Diamond identifies work outside its authority.", outcome: "Preserve context and route operations, CX, policy, risk or approval work to the correct owner.", guardrail: "Tool allowlists, data boundaries, action preview and audit apply to every handoff." },
  { stage: "System", name: "Health, security and recovery alerts", owner: "Kendrell", mode: "AUTOMATIC", trigger: "Monitoring detects auth, tenant, intake, provider, billing, communication or backup failure.", outcome: "Create a severity-owned alert with evidence, runbook and escalation path.", guardrail: "Containment actions require explicit authority; logs must not expose secrets or private content." },
];
