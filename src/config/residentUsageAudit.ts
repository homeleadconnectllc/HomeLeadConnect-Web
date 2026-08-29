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
  {
    stage: "Request",
    status: "connected",
    currentSurface: "/request-service + /homeowner-portal/requests",
    evidence: "Public request intake exists and the resident portal now keeps New request available from overview and section navigation.",
    correction: "Keep request creation and linked-request status directly reachable from the resident portal.",
  },
  {
    stage: "Qualify",
    status: "connected",
    currentSurface: "/homeowner-portal/requests + /messages",
    evidence: "The resident request view now exposes a conservative Information review state. An estimate or job is treated only as downstream evidence that information review has completed; otherwise the portal explicitly remains In progress and keeps Add information available.",
    correction: "Keep qualification state conservative: never mark it complete from absence, timing, or guessed lead status; only use resident-visible downstream evidence until an explicit qualification field exists.",
  },
  {
    stage: "Estimate",
    status: "connected",
    currentSurface: "/homeowner-portal",
    evidence: "Sent estimates are visible with durable Accept estimate and Reject estimate actions, and the portal prioritizes a waiting estimate as the resident's next step.",
    correction: "Keep the decision state visible after mutation and refresh.",
  },
  {
    stage: "Match",
    status: "blocked",
    currentSurface: "/homeowner-portal/matches",
    evidence: "The route is currently nested under WorkspaceLayout, which explicitly redirects non-internal portal accounts away from workspace-only routes.",
    gap: "broken_handoff",
    correction: "Build a portal-authorized matching surface backed by resident-visible matching evidence instead of exposing the internal matching workspace.",
  },
  {
    stage: "Schedule",
    status: "connected",
    currentSurface: "/homeowner-portal/appointments",
    evidence: "Resident-visible linked appointments have their own protected portal route and are surfaced as the next action when a scheduled appointment exists.",
    correction: "Keep appointment status, date/time, and message handoff explicit.",
  },
  {
    stage: "Job",
    status: "connected",
    currentSurface: "/homeowner-portal/jobs",
    evidence: "Resident-visible jobs have a protected portal route with messages, documents, and appointments as contextual actions.",
    correction: "Keep job status and remaining action understandable without internal CRM terminology.",
  },
  {
    stage: "Complete",
    status: "partial",
    currentSurface: "/homeowner-portal/jobs",
    evidence: "Completed job status is visible, but the portal does not yet expose a resident confirmation/reopen decision.",
    gap: "missing_completion_state",
    correction: "Add an evidence-backed resident completion/issue-resolution action only when the backend contract supports that mutation.",
  },
  {
    stage: "Payment",
    status: "blocked",
    currentSurface: "No resident-scoped payment surface",
    evidence: "Workspace billing is owner/admin subscription billing and must not be reused as resident job payment.",
    gap: "missing_entry",
    correction: "Create a separate resident job-payment/receipt handoff when an actual payment recipient and transaction model exist.",
  },
  {
    stage: "Review",
    status: "blocked",
    currentSurface: "/community/reviews",
    evidence: "The existing review surface is nested under WorkspaceLayout and its API resolves workspace through an internal profile workspace_id.",
    gap: "broken_handoff",
    correction: "Create a portal-authorized completion-linked review flow using the resident's linked completed job rather than the internal workspace context helper.",
  },
  {
    stage: "Referral / Repeat",
    status: "partial",
    currentSurface: "/request-service for repeat; /community/referrals for referral",
    evidence: "Repeat service is directly reachable, but the existing referral surface is nested under WorkspaceLayout and is not a safe resident portal handoff.",
    gap: "broken_handoff",
    correction: "Preserve New request for repeat service and add a portal-authorized referral action with source attribution.",
  },
];
