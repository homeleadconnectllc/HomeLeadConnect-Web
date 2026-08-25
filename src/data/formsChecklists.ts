export type FormAudience = "internal" | "resident" | "professional";
export type FormContext = "lead" | "estimate" | "job" | "appointment" | "provider" | "community" | "finance" | "general";

export type FormFieldDefinition = {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "date" | "datetime" | "checkbox" | "number" | "file" | "signature";
  required?: boolean;
  options?: string[];
};

export type HlcFormDefinition = {
  id: string;
  title: string;
  purpose: string;
  audience: FormAudience[];
  context: FormContext;
  fields: FormFieldDefinition[];
  recordLinkRequired: boolean;
  approvalRequired?: boolean;
};

export type ChecklistItemDefinition = {
  id: string;
  label: string;
  required: boolean;
  evidence?: "note" | "photo" | "document" | "signature" | "timestamp";
};

export type HlcChecklistDefinition = {
  id: string;
  title: string;
  purpose: string;
  context: FormContext;
  audience: FormAudience[];
  items: ChecklistItemDefinition[];
};

export const formRegistry: HlcFormDefinition[] = [
  {
    id: "lead-intake-qualification",
    title: "Lead intake & qualification",
    purpose: "Capture the service need, urgency, timing, property context and preferred communication before advancing the request.",
    audience: ["internal"],
    context: "lead",
    recordLinkRequired: true,
    fields: [
      { id: "serviceNeed", label: "Service need", type: "textarea", required: true },
      { id: "urgency", label: "Urgency", type: "select", required: true, options: ["Routine", "Soon", "Urgent", "Safety concern"] },
      { id: "propertyType", label: "Property type", type: "select", options: ["House", "Apartment", "Rental", "Commercial", "Other"] },
      { id: "timing", label: "Preferred timing", type: "text" },
      { id: "decisionMakers", label: "Decision-makers / access contacts", type: "text" },
      { id: "notes", label: "Qualification notes", type: "textarea" },
    ],
  },
  {
    id: "estimate-scope-approval",
    title: "Estimate scope & approval",
    purpose: "Confirm the requested scope, documented assumptions, requested changes and approval state before conversion to a job.",
    audience: ["internal", "resident"],
    context: "estimate",
    recordLinkRequired: true,
    approvalRequired: true,
    fields: [
      { id: "scopeSummary", label: "Scope summary", type: "textarea", required: true },
      { id: "assumptions", label: "Assumptions / exclusions", type: "textarea" },
      { id: "requestedChanges", label: "Requested changes", type: "textarea" },
      { id: "approval", label: "Approve estimate", type: "checkbox", required: true },
      { id: "signature", label: "Signature", type: "signature" },
    ],
  },
  {
    id: "job-change-order",
    title: "Job change order",
    purpose: "Document requested changes to approved work without silently changing the original scope.",
    audience: ["internal", "resident", "professional"],
    context: "job",
    recordLinkRequired: true,
    approvalRequired: true,
    fields: [
      { id: "changeDescription", label: "Requested change", type: "textarea", required: true },
      { id: "reason", label: "Reason", type: "textarea" },
      { id: "priceImpact", label: "Price impact", type: "number" },
      { id: "scheduleImpact", label: "Schedule impact", type: "text" },
      { id: "approval", label: "Change approved", type: "checkbox", required: true },
      { id: "signature", label: "Approval signature", type: "signature" },
    ],
  },
  {
    id: "provider-onboarding",
    title: "Professional onboarding",
    purpose: "Capture services, service area, availability and verification information needed for a usable professional profile.",
    audience: ["professional", "internal"],
    context: "provider",
    recordLinkRequired: true,
    fields: [
      { id: "services", label: "Services / trades", type: "textarea", required: true },
      { id: "serviceArea", label: "Service area", type: "textarea", required: true },
      { id: "availability", label: "Availability", type: "textarea" },
      { id: "insurance", label: "Insurance / credential document", type: "file" },
      { id: "portfolio", label: "Portfolio / work samples", type: "file" },
    ],
  },
  {
    id: "service-completion-acknowledgment",
    title: "Service completion acknowledgment",
    purpose: "Confirm the recorded completion state and unresolved items before review/referral workflows begin.",
    audience: ["internal", "resident", "professional"],
    context: "job",
    recordLinkRequired: true,
    fields: [
      { id: "completionSummary", label: "Completion summary", type: "textarea", required: true },
      { id: "openIssues", label: "Open issues / follow-up", type: "textarea" },
      { id: "completedAt", label: "Completed at", type: "datetime", required: true },
      { id: "residentAcknowledgment", label: "Resident acknowledgment", type: "checkbox" },
      { id: "signature", label: "Signature", type: "signature" },
    ],
  },
];

export const checklistRegistry: HlcChecklistDefinition[] = [
  {
    id: "lead-ready-for-estimate",
    title: "Lead ready for estimate",
    purpose: "Prevent incomplete requests from moving into estimate work.",
    context: "lead",
    audience: ["internal"],
    items: [
      { id: "service-need", label: "Service need documented", required: true, evidence: "note" },
      { id: "location", label: "Property/location confirmed", required: true },
      { id: "urgency", label: "Urgency assessed", required: true },
      { id: "contact", label: "Preferred contact method confirmed", required: true },
      { id: "evidence", label: "Useful photos/documents attached when available", required: false, evidence: "document" },
    ],
  },
  {
    id: "estimate-ready-to-send",
    title: "Estimate ready to send",
    purpose: "Require scope and pricing evidence before an estimate is released.",
    context: "estimate",
    audience: ["internal"],
    items: [
      { id: "scope", label: "Scope reviewed", required: true, evidence: "note" },
      { id: "pricing", label: "Pricing/line items reviewed", required: true },
      { id: "assumptions", label: "Assumptions and exclusions documented", required: true },
      { id: "recipient", label: "Recipient/contact verified", required: true },
      { id: "approval", label: "Internal approval completed when required", required: false, evidence: "timestamp" },
    ],
  },
  {
    id: "job-start",
    title: "Job start checklist",
    purpose: "Make sure the assigned professional has enough information to begin safely and accurately.",
    context: "job",
    audience: ["internal", "professional"],
    items: [
      { id: "assignment", label: "Assignment accepted", required: true, evidence: "timestamp" },
      { id: "scope", label: "Approved scope reviewed", required: true },
      { id: "schedule", label: "Schedule/access confirmed", required: true },
      { id: "safety", label: "Known safety/access notes reviewed", required: true },
      { id: "before-photos", label: "Before-work photos captured when appropriate", required: false, evidence: "photo" },
    ],
  },
  {
    id: "job-completion",
    title: "Job completion checklist",
    purpose: "Prevent a job from closing before evidence, issues and customer follow-up are accounted for.",
    context: "job",
    audience: ["internal", "professional"],
    items: [
      { id: "scope-complete", label: "Approved scope marked complete", required: true },
      { id: "after-photos", label: "After-work evidence attached when appropriate", required: false, evidence: "photo" },
      { id: "issues", label: "Open issues documented or confirmed none", required: true, evidence: "note" },
      { id: "materials", label: "Materials/charges documented where applicable", required: false },
      { id: "completion-time", label: "Completion time recorded", required: true, evidence: "timestamp" },
      { id: "acknowledgment", label: "Resident acknowledgment captured when required", required: false, evidence: "signature" },
    ],
  },
  {
    id: "provider-profile-ready",
    title: "Professional profile ready for matching",
    purpose: "Require usable profile information before a professional is treated as match-ready.",
    context: "provider",
    audience: ["internal", "professional"],
    items: [
      { id: "services", label: "Services/trades completed", required: true },
      { id: "service-area", label: "Service area completed", required: true },
      { id: "availability", label: "Availability completed", required: true },
      { id: "contact", label: "Contact/business identity verified", required: true },
      { id: "credentials", label: "Required credentials reviewed where applicable", required: false, evidence: "document" },
    ],
  },
];

export function formsForContext(context: FormContext) {
  return formRegistry.filter((form) => form.context === context);
}

export function checklistsForContext(context: FormContext) {
  return checklistRegistry.filter((checklist) => checklist.context === context);
}
