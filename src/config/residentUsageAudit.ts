export type UsageGapClass = "missing_entry" | "unclear_next_action" | "broken_handoff" | "missing_completion_state";
export type UsageAuditStatus = "connected" | "partial" | "blocked";

export type ResidentUsageAuditRow = {
  stage: string;
  status: UsageAuditStatus;
  currentSurface: string;
  evidence: string;
  gap?: UsageGapClass;
  correction: string;
};

export const residentUsageAudit: ResidentUsageAuditRow[] = [
  { stage: "Request", status: "connected", currentSurface: "/request-service + /homeowner-portal/requests", evidence: "Public request intake exists and the resident portal keeps New request available from overview and section navigation.", correction: "Keep request creation and linked-request status directly reachable from the resident portal." },
  { stage: "Qualify", status: "connected", currentSurface: "/homeowner-portal/requests + /messages", evidence: "The request view exposes conservative Information review state derived only from resident-visible downstream evidence.", correction: "Never infer qualification completion from absence, timing, or guessed lead status." },
  { stage: "Estimate", status: "connected", currentSurface: "/homeowner-portal", evidence: "Sent estimates are visible with durable Accept estimate and Reject estimate actions.", correction: "Keep the decision state visible after mutation and refresh." },
  { stage: "Match", status: "connected", currentSurface: "/homeowner-portal#resident-matches", evidence: "Candidate backend exposes portal-linked provider match records and accept/decline decisions without routing residents into internal WorkspaceLayout or auto-assigning a contractor.", correction: "Keep provider facts evidence-backed and keep match decision separate from canonical assignment authority." },
  { stage: "Schedule", status: "connected", currentSurface: "/homeowner-portal/appointments", evidence: "Resident-visible linked appointments have their own protected portal route and are surfaced when scheduled.", correction: "Keep appointment status, date/time, and message handoff explicit." },
  { stage: "Job", status: "connected", currentSurface: "/homeowner-portal/jobs", evidence: "Resident-visible jobs have a protected portal route with messages, documents, and appointments as contextual actions.", correction: "Keep job status and remaining action understandable without internal CRM terminology." },
  { stage: "Complete", status: "connected", currentSurface: "/homeowner-portal/jobs + /messages", evidence: "Completed jobs render Service complete and a resident-safe issue handoff without silently changing canonical job state.", correction: "Keep completion derived from canonical job status and issue escalation explicit." },
  { stage: "Payment", status: "connected", currentSurface: "/homeowner-portal#resident-payments", evidence: "Candidate backend has a resident job-payment ledger separate from workspace subscription billing; secure Checkout is created through a JWT-protected Edge Function and provider state is service-role/webhook controlled.", correction: "Keep job payment isolated from HLC subscription billing and fail closed when checkout or webhook evidence is unavailable." },
  { stage: "Review", status: "connected", currentSurface: "/homeowner-portal#resident-reviews", evidence: "Candidate portal lists only linked completed jobs eligible for one resident review and creates reviews through explicit portal linkage authorization.", correction: "Preserve completion linkage, one-review-per-job behavior, and internal workspace isolation." },
  { stage: "Referral / Repeat", status: "connected", currentSurface: "/homeowner-portal + /request-service", evidence: "Resident referrals are source-attributed through portal linkage and repeat service remains directly reachable as a new request. Recording a referral does not claim contact or enrollment.", correction: "Keep referral attribution and repeat service as separate explicit outcomes." },
];
