export type PartnerUsageAuditStatus = "connected" | "partial" | "blocked";
export type PartnerUsageGapClass = "missing_entry" | "unclear_next_action" | "broken_handoff" | "missing_completion_state";

export type PartnerUsageAuditRow = {
  stage: "Refer" | "Relationship";
  status: PartnerUsageAuditStatus;
  currentSurface: string;
  evidence: string;
  gap?: PartnerUsageGapClass;
  correction: string;
};

export const partnerUsageAudit: PartnerUsageAuditRow[] = [
  {
    stage: "Refer",
    status: "partial",
    currentSurface: "/contact + /request-service + /professional-application",
    evidence: "Public resident and professional intake paths exist, but there is no dedicated partner/referral-source intake that records partner attribution while routing the referred person into the correct downstream journey.",
    gap: "missing_entry",
    correction: "Add one public partner referral entry that captures referral type and source attribution, then hands the referred resident or professional into the canonical intake without forcing the partner into an internal or contractor account.",
  },
  {
    stage: "Relationship",
    status: "blocked",
    currentSurface: "No partner-scoped referral-status surface",
    evidence: "Internal Community referrals exist under WorkspaceLayout, but no external partner-safe status or repeat-referral surface exists. A partner therefore cannot review attributed referral status without entering internal operational tooling.",
    gap: "broken_handoff",
    correction: "Create a partner-safe status/repeat-referral experience with privacy-limited milestone reporting and durable source attribution; do not expose internal Community or CRM records.",
  },
];
