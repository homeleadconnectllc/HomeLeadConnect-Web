export type OwnerUsageAuditStatus = "connected" | "partial" | "blocked";
export type OwnerUsageGapClass = "missing_entry" | "unclear_next_action" | "broken_handoff" | "missing_completion_state";

export type OwnerUsageAuditRow = {
  stage: "Command" | "Control";
  status: OwnerUsageAuditStatus;
  currentSurface: string;
  evidence: string;
  gap?: OwnerUsageGapClass;
  correction: string;
};

export const ownerUsageAudit: OwnerUsageAuditRow[] = [
  {
    stage: "Command",
    status: "connected",
    currentSurface: "/dashboard",
    evidence: "Command Center presents live lead/follow-up/job/appointment metrics, Priority today rows that deep-link to the owning workspace, notifications/search entry points, and an explicit caught-up completion state.",
    correction: "Preserve context-carrying priority links and the explicit caught-up state; do not turn the owner home into a static KPI wall.",
  },
  {
    stage: "Control",
    status: "connected",
    currentSurface: "/settings + /team + owner-authorized administration routes",
    evidence: "Settings exposes membership-backed workspace switching, server-controlled role state, business identity, integration evidence, telephony readiness, device alerts, and authoritative workspace billing controls with explicit setup/error states.",
    correction: "Keep authority server-controlled and preserve setup/unverified/error states instead of claiming connected systems without evidence.",
  },
];
