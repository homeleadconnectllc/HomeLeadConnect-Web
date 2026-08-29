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
    nextAction: "Preserve the existing portal-authorized RPC boundary; do not recreate or bypass it during promotion.",
  },
  {
    id: "resident-qualification-completion",
    state: "ready",
    productionEvidence: "The resident portal exposes a conservative information-review completion state from resident-visible downstream evidence.",
    nextAction: "Keep the state conservative until an explicit server-owned qualification state is introduced.",
  },
  {
    id: "resident-provider-matching",
    state: "ready",
    productionEvidence: "Production does not yet contain the Phase 3 match table/RPCs. The isolated candidate and rehearsal environment now provide homeowner-portal-scoped provider-match records and accept/decline decisions without weakening internal Community RLS or auto-assigning a provider.",
    nextAction: "Promote the staged provider-match migration only after final human acceptance and explicit production authorization.",
  },
  {
    id: "resident-job-payment",
    state: "ready",
    productionEvidence: "Production subscription billing remains separate and unchanged. The isolated candidate/rehearsal environment now has a distinct resident job-payment ledger, JWT-protected Checkout creation, signed-webhook provider state, retry recovery, receipt state, and refund/expiry handling.",
    nextAction: "Promote the payment migration and tested Edge Functions together only after explicit production authorization and Stripe webhook event verification.",
  },
  {
    id: "resident-completion-review",
    state: "ready",
    productionEvidence: "Production community_reviews workspace linkage remains intact. The isolated candidate/rehearsal environment adds homeowner-portal eligibility/read/create RPCs tied to linked completed jobs without granting residents workspace membership.",
    nextAction: "Promote the portal review RPCs without replacing or weakening the existing production workspace-linkage policy.",
  },
  {
    id: "resident-referral",
    state: "ready",
    productionEvidence: "Production direct Community referral insert remains workspace-member scoped. The candidate/rehearsal environment adds a homeowner-portal referral RPC with resident source attribution and no automatic contact/enrollment side effect.",
    nextAction: "Promote the portal referral contract only with the staged Phase 3 migration after final authorization.",
  },
  {
    id: "professional-verification",
    state: "ready",
    productionEvidence: "Existing production profile/setup self-service remains portal-authorized. The candidate/rehearsal environment adds management-owned verification status/evidence with provider read-only visibility; professional accounts cannot self-approve.",
    nextAction: "Promote the management-owned verification fields/RPC while preserving existing provider self-service boundaries.",
  },
  {
    id: "provider-job-progress",
    state: "ready",
    productionEvidence: "Production assignment decisions remain canonical. The candidate/rehearsal environment adds assignment-scoped provider progress evidence while explicitly preventing direct contractor-portal mutation of canonical crm_jobs status.",
    nextAction: "Promote the provider progress ledger/RPC as evidence-only authority after final authorization.",
  },
  {
    id: "provider-performance",
    state: "ready",
    productionEvidence: "The candidate/rehearsal environment now exposes a contractor-portal-scoped read-only performance aggregate derived from authorized assignments, completed HLC jobs, provider progress, and published reviews without exposing internal analytics workspaces.",
    nextAction: "Promote the read-only provider performance RPC with the Phase 3 migration after final authorization.",
  },
  {
    id: "operations-exception-resolution",
    state: "ready",
    productionEvidence: "Production exception sources retain their existing truth. The candidate/rehearsal environment adds a management-authorized durable resolved/escalated/deferred disposition record that preserves source type, source id, and affected route without pretending the source record itself changed.",
    nextAction: "Promote the disposition ledger/RPC after final authorization and keep notification acknowledgement distinct from exception resolution.",
  },
  {
    id: "community-review-workspace-linkage",
    state: "hardening",
    productionEvidence: "Production community_reviews insert policy already checks j.workspace_id = community_reviews.workspace_id; the earlier self-comparison finding came from a non-production reconciliation project and must not be treated as a production defect.",
    nextAction: "Keep the production policy intact and retain regression coverage so the explicit workspace comparison cannot regress.",
  },
];
