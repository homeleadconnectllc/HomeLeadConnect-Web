export type BackendContractState = "ready" | "missing" | "hardening";

export type Phase3BackendContract = {
  id: string;
  state: BackendContractState;
  productionEvidence: string;
  nextAction: string;
};

export const phase3BackendReadiness: Phase3BackendContract[] = [
  {
    id: "contractor-portal-profile-setup",
    state: "ready",
    productionEvidence: "Production homeconnect exposes get_linked_provider_profile, update_linked_provider_profile, get_linked_provider_setup, linked service/service-area mutations, linked availability mutation, contractor assignment decisions, and contractor portal data RPCs.",
    nextAction: "Preserve the existing portal-authorized RPC boundary and test it on the isolated backend branch; do not recreate or bypass it.",
  },
  {
    id: "resident-qualification-completion",
    state: "ready",
    productionEvidence: "The resident portal now exposes a conservative information-review completion state from resident-visible downstream evidence.",
    nextAction: "Keep the state conservative until an explicit server-owned qualification state is introduced.",
  },
  {
    id: "resident-provider-matching",
    state: "missing",
    productionEvidence: "Existing community match decisions require workspace membership and are not a homeowner-portal authorization contract.",
    nextAction: "Create a homeowner-portal-scoped provider-match model/RPC that is linked to the resident's authorized lead/job and never exposes the internal matching workspace.",
  },
  {
    id: "resident-job-payment",
    state: "missing",
    productionEvidence: "Production subscription billing is workspace/account billing; no resident job-payment/receipt contract exists.",
    nextAction: "Create a separate job-payment record and provider checkout handoff with resident portal authorization, idempotency, receipt state, and no reuse of workspace subscription billing.",
  },
  {
    id: "resident-completion-review",
    state: "missing",
    productionEvidence: "community_reviews is correctly workspace-linked in production, but its direct RLS path requires workspace membership rather than homeowner portal linkage.",
    nextAction: "Add homeowner-portal RPCs for eligible completed jobs, creating a review, and reading the resident's own review state while retaining the existing workspace-linkage hardening.",
  },
  {
    id: "resident-referral",
    state: "missing",
    productionEvidence: "community_referrals direct insert requires workspace membership and therefore is not a resident portal referral contract.",
    nextAction: "Add a homeowner-portal referral RPC with source attribution, duplicate protection, status visibility, and no automatic messaging/enrollment side effect.",
  },
  {
    id: "professional-verification",
    state: "missing",
    productionEvidence: "Provider self-service profile/setup RPCs exist, while verification/approval is intentionally not self-grantable and has no portal completion contract.",
    nextAction: "Introduce management-owned verification status/evidence fields with portal read-only visibility; provider self-service must never approve itself.",
  },
  {
    id: "provider-job-progress",
    state: "missing",
    productionEvidence: "contractor_decide_assignment exists, but production exposes no provider-owned job progress/completion mutation.",
    nextAction: "Add assignment-scoped provider progress reporting with durable timestamps/evidence while preserving HLC authority over canonical crm_jobs status transitions.",
  },
  {
    id: "provider-performance",
    state: "missing",
    productionEvidence: "No contractor-portal-scoped reputation/performance RPC currently aggregates authorized completed assignments and verified review outcomes.",
    nextAction: "Add a read-only portal RPC derived from linked contractor assignments/completed work/reviews; do not expose internal analytics workspace data.",
  },
  {
    id: "operations-exception-resolution",
    state: "missing",
    productionEvidence: "Follow-ups and automation jobs have durable terminal states, notifications only have read_at, and agent handoffs/owner-attention records are browser read-only without a unified operations resolution contract.",
    nextAction: "Add a durable operations exception disposition contract for resolved/escalated/deferred outcomes that preserves source entity links and source-system truth.",
  },
  {
    id: "community-review-workspace-linkage",
    state: "hardening",
    productionEvidence: "Production community_reviews insert policy already checks j.workspace_id = community_reviews.workspace_id; the earlier self-comparison finding came from a non-production reconciliation project and must not be treated as a production defect.",
    nextAction: "Keep the production policy intact and add regression coverage so the explicit workspace comparison cannot regress.",
  },
];
