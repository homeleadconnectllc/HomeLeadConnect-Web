export type UserUsagePersona =
  | "resident"
  | "professional"
  | "owner"
  | "operations"
  | "customerExperience"
  | "partner";

export type UsageStep = {
  stage: string;
  entryPoint: string;
  nextAction: string;
  informationNeeded: string[];
  handoff: string;
  completionState: string;
  mobileHome: "Home" | "Work" | "Network" | "Community" | "More";
};

export type UserUsageJourney = {
  persona: UserUsagePersona;
  label: string;
  outcome: string;
  steps: UsageStep[];
};

export const userUsageJourneys: UserUsageJourney[] = [
  {
    persona: "resident",
    label: "Resident / renter / homeowner",
    outcome: "Get the right home-service help from request through completion, review, and repeat use.",
    steps: [
      { stage: "Request", entryPoint: "Public request flow or Resident Portal", nextAction: "Describe the help needed and submit the request", informationNeeded: ["service need", "property/occupancy context", "location", "contact preference"], handoff: "Create a resident-visible request/lead and confirmation", completionState: "Request received with status and next-step expectation", mobileHome: "Home" },
      { stage: "Qualify", entryPoint: "Resident request status", nextAction: "Answer only the questions needed to clarify fit and urgency", informationNeeded: ["scope details", "timing", "decision-maker/access context"], handoff: "Qualified request becomes estimate-ready or match-ready", completionState: "Resident can see that enough information has been collected", mobileHome: "Work" },
      { stage: "Estimate", entryPoint: "Resident Portal request/estimate", nextAction: "Review scope, price/options, and approve or request clarification", informationNeeded: ["scope", "price/options", "validity", "what happens after approval"], handoff: "Approved estimate advances to matching/scheduling/job creation as applicable", completionState: "Estimate decision is explicit and durable", mobileHome: "Work" },
      { stage: "Match", entryPoint: "Resident Portal or Network match view", nextAction: "Review suitable professionals and choose/accept the preferred option", informationNeeded: ["trade fit", "service area", "availability", "verification/evidence", "reviews"], handoff: "Selected professional is attached to the service opportunity", completionState: "Chosen provider and next scheduling action are obvious", mobileHome: "Network" },
      { stage: "Schedule", entryPoint: "Resident Portal appointment view", nextAction: "Choose or confirm an appointment", informationNeeded: ["date/time", "arrival expectations", "who should be present", "contact method"], handoff: "Appointment becomes scheduled work visible to both sides", completionState: "Confirmed appointment with clear date/time and status", mobileHome: "Work" },
      { stage: "Job", entryPoint: "Resident Portal active service view", nextAction: "Track progress, communicate, and review shared evidence/documents", informationNeeded: ["provider", "job status", "messages", "documents/evidence", "next milestone"], handoff: "Completed work advances to completion/payment/review", completionState: "Resident can tell whether work is active, waiting, or complete", mobileHome: "Work" },
      { stage: "Complete", entryPoint: "Resident Portal completed service", nextAction: "Confirm completion and resolve any remaining issue", informationNeeded: ["completion status", "final evidence", "open issue path"], handoff: "Completion enables payment/review/referral steps", completionState: "Service is clearly closed or reopened for an issue", mobileHome: "Home" },
      { stage: "Payment", entryPoint: "Resident billing/payment handoff when applicable", nextAction: "Review and complete any required payment action", informationNeeded: ["amount", "recipient", "status", "receipt"], handoff: "Payment status is recorded without blocking unrelated portal access", completionState: "Paid, pending, failed, or not applicable is explicit", mobileHome: "More" },
      { stage: "Review", entryPoint: "Completed service view or Community review prompt", nextAction: "Leave a completion-linked review", informationNeeded: ["completed job", "provider", "rating/comment guidance"], handoff: "Review is tied to verified completion context", completionState: "Review submitted or deliberately skipped", mobileHome: "Community" },
      { stage: "Referral / Repeat", entryPoint: "Resident Home or Community", nextAction: "Refer someone or start another service request", informationNeeded: ["referral target or new service need"], handoff: "Create attributed referral or new request", completionState: "Referral/new request has its own status", mobileHome: "Community" },
    ],
  },
  {
    persona: "professional",
    label: "Service professional / contractor / handyman / cleaner / mover / trade",
    outcome: "Join the network, receive appropriate opportunities, complete work, and build durable performance history.",
    steps: [
      { stage: "Onboard", entryPoint: "Professional signup/application", nextAction: "Create a professional profile", informationNeeded: ["identity/company", "trade/services", "location/service area", "contact"], handoff: "Profile becomes reviewable and editable", completionState: "Profile completeness and missing evidence are explicit", mobileHome: "More" },
      { stage: "Availability", entryPoint: "Professional Portal", nextAction: "Set service area and availability", informationNeeded: ["service area", "availability", "trade eligibility"], handoff: "Matching can use recorded availability", completionState: "Current availability is visible", mobileHome: "Work" },
      { stage: "Opportunity", entryPoint: "Professional Portal or Work queue", nextAction: "Review and accept or decline a relevant opportunity", informationNeeded: ["scope", "location", "timing", "fit", "required response"], handoff: "Accepted opportunity advances to estimate/schedule/job", completionState: "Accept/decline decision and next action are explicit", mobileHome: "Work" },
      { stage: "Service", entryPoint: "Job workspace", nextAction: "Communicate, perform work, and upload required evidence", informationNeeded: ["job details", "appointment", "messages", "documents/evidence"], handoff: "Completion evidence advances job to complete", completionState: "Job status and remaining action are obvious", mobileHome: "Work" },
      { stage: "Performance", entryPoint: "Professional Portal", nextAction: "Review completion, reviews, and future opportunities", informationNeeded: ["completed work", "reviews", "availability", "profile status"], handoff: "Updated profile/performance feeds future matching", completionState: "Professional knows what to improve or do next", mobileHome: "Home" },
    ],
  },
  {
    persona: "owner",
    label: "HLC owner / administrator",
    outcome: "Run the company from a command center focused on exceptions, approvals, risk, and system health.",
    steps: [
      { stage: "Command", entryPoint: "Home / Command Center", nextAction: "Resolve the highest-priority attention item", informationNeeded: ["KPIs", "alerts", "exceptions", "upcoming work", "agent briefing"], handoff: "Action opens the owning workspace with context", completionState: "Attention queue shrinks or item has an owner/status", mobileHome: "Home" },
      { stage: "Control", entryPoint: "Settings / Team / Billing / Integrations", nextAction: "Manage permissions, connected systems, billing, and policies", informationNeeded: ["workspace state", "roles", "billing", "integration evidence"], handoff: "Changes remain auditable and scoped", completionState: "Control state is explicit", mobileHome: "More" },
    ],
  },
  {
    persona: "operations",
    label: "HLC operations user",
    outcome: "Move real work through the service lifecycle without losing context between stages.",
    steps: [
      { stage: "Operate", entryPoint: "Work", nextAction: "Process the next actionable request, lead, follow-up, appointment, or job", informationNeeded: ["record identity", "stage", "owner", "due time", "next action"], handoff: "Each action carries record context into the next workspace", completionState: "Every active record has a next action or completed state", mobileHome: "Work" },
      { stage: "Exception", entryPoint: "Operations / Notifications", nextAction: "Resolve SLA, workflow, matching, scheduling, or communication exceptions", informationNeeded: ["failure reason", "affected record", "recommended action"], handoff: "Resolution returns record to canonical lifecycle", completionState: "Exception is resolved, escalated, or deliberately deferred", mobileHome: "Home" },
    ],
  },
  {
    persona: "customerExperience",
    label: "Customer experience / community user",
    outcome: "Help participants understand the platform, communicate, recover from issues, and build trust.",
    steps: [
      { stage: "Assist", entryPoint: "Messages / Network / Community", nextAction: "Answer, guide, connect, or recover the participant", informationNeeded: ["participant context", "conversation", "service relationship", "community context"], handoff: "Issue moves to the correct work, network, community, or help destination", completionState: "Participant has a clear answer or owned next step", mobileHome: "Community" },
      { stage: "Trust", entryPoint: "Reviews / Referrals / Moderation", nextAction: "Handle trust signals and community actions", informationNeeded: ["verified context", "report/review/referral state"], handoff: "Decision is linked to evidence and audit history", completionState: "Trust action is resolved or escalated", mobileHome: "Community" },
    ],
  },
  {
    persona: "partner",
    label: "Partner / business / referral source",
    outcome: "Refer people or professionals and maintain a recurring relationship without being forced into the contractor workflow.",
    steps: [
      { stage: "Refer", entryPoint: "Public site, contact, or referral entry", nextAction: "Submit the resident/professional referral", informationNeeded: ["referral type", "contact", "need or professional context", "attribution"], handoff: "Referral creates the appropriate resident/professional intake path", completionState: "Referral receipt and status expectation are clear", mobileHome: "Community" },
      { stage: "Relationship", entryPoint: "Partner follow-up", nextAction: "Review status or make another referral", informationNeeded: ["attributed referral status", "relationship contact"], handoff: "Repeat referrals retain source attribution", completionState: "Partner can continue without entering internal operational tools", mobileHome: "Home" },
    ],
  },
];

export const usageCertificationDimensions = [
  "entryPoint",
  "nextAction",
  "informationNeeded",
  "handoff",
  "completionState",
] as const;
