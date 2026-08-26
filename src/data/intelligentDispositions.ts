export type DispositionSeverity = "routine" | "attention" | "critical";
export type HumanConfirmationPolicy = "recommended" | "required" | "deterministic";

export type IntelligentDisposition = {
  id: string;
  label: string;
  category: "connected" | "follow_up" | "workflow" | "objection" | "unreachable" | "suppression" | "escalation";
  severity: DispositionSeverity;
  humanConfirmation: HumanConfirmationPolicy;
  requiredFields: string[];
  nextActions: string[];
  automationKeys: string[];
  recommendedScriptKey?: string;
  goldenWorkflowStage?: "Request" | "Qualify" | "Estimate" | "Match" | "Schedule" | "Job" | "Complete" | "Payment" | "Review" | "Referral / Repeat";
};

export const intelligentDispositions: IntelligentDisposition[] = [
  {
    id: "connected-qualified",
    label: "Connected / Qualified",
    category: "connected",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["serviceNeed", "urgency", "location", "nextStep"],
    nextActions: ["advance qualification", "schedule next action"],
    automationKeys: ["lead-qualified"],
    recommendedScriptKey: "qualification-close",
    goldenWorkflowStage: "Qualify",
  },
  {
    id: "callback-requested",
    label: "Callback Requested",
    category: "follow_up",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["callbackAt", "callbackReason"],
    nextActions: ["create callback task", "schedule reminder"],
    automationKeys: ["callback-reminder"],
    recommendedScriptKey: "callback-confirmation",
  },
  {
    id: "needs-estimate",
    label: "Needs Estimate",
    category: "workflow",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["estimateScope", "estimateTiming"],
    nextActions: ["open estimate workflow"],
    automationKeys: ["estimate-needed"],
    goldenWorkflowStage: "Estimate",
  },
  {
    id: "ready-for-matching",
    label: "Ready for Matching",
    category: "workflow",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["trade", "serviceArea", "availability"],
    nextActions: ["run provider matching"],
    automationKeys: ["start-matching"],
    goldenWorkflowStage: "Match",
  },
  {
    id: "appointment-scheduled",
    label: "Appointment Scheduled",
    category: "workflow",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["appointmentAt", "appointmentType"],
    nextActions: ["send confirmation", "schedule reminder"],
    automationKeys: ["appointment-confirmation"],
    recommendedScriptKey: "appointment-confirmation",
    goldenWorkflowStage: "Schedule",
  },
  {
    id: "no-answer",
    label: "No Answer",
    category: "unreachable",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["attemptNumber"],
    nextActions: ["schedule next attempt"],
    automationKeys: ["no-answer-follow-up"],
  },
  {
    id: "left-voicemail",
    label: "Left Voicemail",
    category: "unreachable",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["attemptNumber"],
    nextActions: ["schedule follow-up"],
    automationKeys: ["voicemail-follow-up"],
    recommendedScriptKey: "voicemail-service-request",
  },
  {
    id: "price-concern",
    label: "Price Concern",
    category: "objection",
    severity: "attention",
    humanConfirmation: "recommended",
    requiredFields: ["concernNotes"],
    nextActions: ["use approved objection handling", "set next step"],
    automationKeys: ["price-concern-follow-up"],
    recommendedScriptKey: "objection-price",
  },
  {
    id: "needs-decision-maker",
    label: "Needs Another Decision-Maker",
    category: "objection",
    severity: "attention",
    humanConfirmation: "recommended",
    requiredFields: ["decisionMakerName", "availability"],
    nextActions: ["schedule group follow-up"],
    automationKeys: ["decision-maker-follow-up"],
    recommendedScriptKey: "objection-decision-maker",
  },
  {
    id: "already-has-provider",
    label: "Already Has Provider",
    category: "objection",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["providerStatus", "futureInterest"],
    nextActions: ["record outcome", "offer future assistance if appropriate"],
    automationKeys: ["provider-already-selected"],
    recommendedScriptKey: "objection-existing-provider",
  },
  {
    id: "not-interested",
    label: "Not Interested",
    category: "connected",
    severity: "routine",
    humanConfirmation: "recommended",
    requiredFields: ["reason"],
    nextActions: ["close current outreach appropriately"],
    automationKeys: ["not-interested"],
  },
  {
    id: "do-not-contact",
    label: "Do Not Contact",
    category: "suppression",
    severity: "critical",
    humanConfirmation: "required",
    requiredFields: ["channel", "requestSource", "confirmedAt"],
    nextActions: ["apply suppression", "stop affected automations"],
    automationKeys: ["apply-do-not-contact"],
  },
  {
    id: "complaint-escalation",
    label: "Complaint / Escalation",
    category: "escalation",
    severity: "critical",
    humanConfirmation: "required",
    requiredFields: ["complaintType", "summary", "requestedResolution"],
    nextActions: ["create escalation", "notify responsible owner"],
    automationKeys: ["complaint-escalation"],
  },
  {
    id: "safety-concern",
    label: "Safety Concern",
    category: "escalation",
    severity: "critical",
    humanConfirmation: "required",
    requiredFields: ["safetyType", "summary", "immediateRisk"],
    nextActions: ["escalate safety review", "follow emergency guidance when applicable"],
    automationKeys: ["safety-escalation"],
  },
];

export function getDispositionById(id: string) {
  return intelligentDispositions.find((item) => item.id === id);
}

export function getCriticalDispositions() {
  return intelligentDispositions.filter((item) => item.severity === "critical");
}
