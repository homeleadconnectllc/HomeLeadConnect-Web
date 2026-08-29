export type CustomerExperienceUsageAuditStatus = "connected" | "partial" | "blocked";
export type CustomerExperienceUsageGapClass = "missing_entry" | "unclear_next_action" | "broken_handoff" | "missing_completion_state";

export type CustomerExperienceUsageAuditRow = {
  stage: "Assist" | "Trust";
  status: CustomerExperienceUsageAuditStatus;
  currentSurface: string;
  evidence: string;
  gap?: CustomerExperienceUsageGapClass;
  correction: string;
};

export const customerExperienceUsageAudit: CustomerExperienceUsageAuditRow[] = [
  {
    stage: "Assist",
    status: "connected",
    currentSurface: "/messages + /network + /community-hub + /help + /customer-experience",
    evidence: "Internal customer-experience users have persisted Messages, provider/network discovery, Community, Help, and Diamond's dedicated contextual workspace with record-aware routing boundaries.",
    correction: "Keep participant help connected to the owning service, network, community, or help record instead of resolving support in an untracked side channel.",
  },
  {
    stage: "Trust",
    status: "connected",
    currentSurface: "/community/reviews + /community/referrals + /community/moderation",
    evidence: "The internal workspace contains review, referral, and moderation surfaces; existing acceptance coverage keeps moderation tied to real content, workspace scope, report submission, and recorded resolution authority.",
    correction: "Preserve verified context, workspace scoping, and audit history for trust decisions; do not reuse these internal routes for resident/provider portal access.",
  },
];
