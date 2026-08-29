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
  {
    stage: "Onboard",
    status: "partial",
    currentSurface: "/professional-application + /contractor-portal/profile",
    evidence: "Professional application and portal-safe self-service profile exist, but verification/license/eligibility completion is intentionally outside the self-service profile contract.",
    gap: "missing_completion_state",
    correction: "Expose evidence-backed application/verification status when a portal-safe verification contract exists; never infer approval from profile completion.",
  },
  {
    stage: "Availability",
    status: "connected",
    currentSurface: "/contractor-portal/services",
    evidence: "Provider-declared services, service areas, accepting-work state, note, and next-available date are portal-authorized and editable.",
    correction: "Keep provider-declared facts distinct from verification, ranking, dispatch, or guaranteed availability.",
  },
  {
    stage: "Opportunity",
    status: "connected",
    currentSurface: "/contractor-portal",
    evidence: "Real portal assignments expose customer/job context and durable Accept offer / Reject offer decisions.",
    correction: "Keep offered work as the highest-priority professional next action when present.",
  },
  {
    stage: "Service",
    status: "partial",
    currentSurface: "/contractor-portal + /messages + /contractor-portal/documents",
    evidence: "Assignments, appointments, customer context, messages, and shared documents are portal-safe. Internal /jobs and /calendar are not portal-safe and cannot be used as the provider's completion workflow.",
    gap: "missing_completion_state",
    correction: "Add portal-authorized job progress/completion actions only when the backend exposes provider-owned status mutation authority.",
  },
  {
    stage: "Performance",
    status: "blocked",
    currentSurface: "No portal-scoped performance/reputation surface",
    evidence: "Existing analytics, Operations, and Community review surfaces are nested under internal WorkspaceLayout or depend on internal workspace context.",
    gap: "broken_handoff",
    correction: "Create a professional portal performance/reputation view from provider-authorized completed work and reviews; do not route providers into internal analytics/community workspaces.",
  },
];
