export type ProfessionalUsageGapClass = "missing_entry" | "unclear_next_action" | "broken_handoff" | "missing_completion_state";
export type ProfessionalUsageAuditStatus = "connected" | "partial" | "blocked";

export type ProfessionalUsageAuditRow = {
  stage: string;
  status: ProfessionalUsageAuditStatus;
  currentSurface: string;
  evidence: string;
  gap?: ProfessionalUsageGapClass;
  correction: string;
};

export const professionalUsageAudit: ProfessionalUsageAuditRow[] = [
  { stage: "Onboard", status: "connected", currentSurface: "/professional-application + /contractor-portal/profile + /contractor-portal", evidence: "Candidate exposes management-owned verification status to the linked provider while preserving portal-safe profile setup. Professional accounts cannot self-approve.", correction: "Keep verification management-owned and provider-visible; never infer approval from profile completion." },
  { stage: "Availability", status: "connected", currentSurface: "/contractor-portal/services", evidence: "Provider-declared services, service areas, accepting-work state, note, and next-available date are portal-authorized and editable.", correction: "Keep provider-declared facts distinct from verification, ranking, dispatch, or guaranteed availability." },
  { stage: "Opportunity", status: "connected", currentSurface: "/contractor-portal", evidence: "Real portal assignments expose customer/job context and durable Accept offer / Reject offer decisions.", correction: "Keep offered work as the highest-priority professional next action when present." },
  { stage: "Service", status: "connected", currentSurface: "/contractor-portal + /messages + /contractor-portal/documents", evidence: "Accepted assignments can record provider-owned started/in-progress/blocked/completed evidence while canonical crm_jobs lifecycle authority remains with HLC operations. Scheduled appointments, messages, and documents remain portal-safe.", correction: "Keep provider progress as evidence and never silently rewrite canonical job status from the contractor portal." },
  { stage: "Performance", status: "connected", currentSurface: "/contractor-portal", evidence: "Candidate portal shows provider-authorized accepted assignment counts, completed HLC jobs, provider completion reports, published review count, and average rating without routing professionals into internal analytics or Community workspaces.", correction: "Keep performance derived from authorized recorded work and published reviews only." },
];
