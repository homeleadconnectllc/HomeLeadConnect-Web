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
    status: "connected",
    currentSurface: "/partners + /partner-portal",
    evidence: "The candidate exposes a dedicated public partner entry and an authenticated partner portal. Active linked partner sources can record resident or professional referrals with durable source attribution without receiving internal workspace membership.",
    correction: "Keep referral creation partner-scoped, require an active linked account, preserve duplicate protection, and never claim that recording a referral contacted or enrolled the referred person.",
  },
  {
    stage: "Relationship",
    status: "connected",
    currentSurface: "/partner-portal",
    evidence: "The candidate partner portal returns only the linked partner source and that source's referral history/status. Internal management owns referral-stage changes through a workspace-scoped queue while the external partner remains outside internal CRM and Community authority.",
    correction: "Keep partner-visible status privacy-limited and source-attributed, and keep management status authority separate from partner referral creation.",
  },
];
