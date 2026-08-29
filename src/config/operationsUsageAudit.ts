export type OperationsUsageAuditStatus = "connected" | "partial" | "blocked";
export type OperationsUsageGapClass = "missing_entry" | "unclear_next_action" | "broken_handoff" | "missing_completion_state";

export type OperationsUsageAuditRow = {
  stage: "Operate" | "Exception";
  status: OperationsUsageAuditStatus;
  currentSurface: string;
  evidence: string;
  gap?: OperationsUsageGapClass;
  correction: string;
};

export const operationsUsageAudit: OperationsUsageAuditRow[] = [
  {
    stage: "Operate",
    status: "connected",
    currentSurface: "/leads + /estimator + /jobs + /calendar + /follow-ups + /call-center + /manual-communications",
    evidence: "The internal workspace exposes the canonical work surfaces and existing acceptance contracts preserve lead-to-job context, schedule-to-job handoff, follow-up context, communications, and evidence intake.",
    correction: "Keep every operational action attached to the source record and canonical lifecycle instead of creating parallel work queues.",
  },
  {
    stage: "Exception",
    status: "partial",
    currentSurface: "/operations + /notifications + /automations",
    evidence: "Dion's Operations workspace, notification triage, automation history/errors, and system health surfaces exist, but not every failure class has a single durable resolved/escalated/deferred mutation exposed from the exception surface itself.",
    gap: "missing_completion_state",
    correction: "For each exception type, preserve the affected-record link and add an evidence-backed resolved, escalated, or deliberately deferred completion state when the owning backend supports it.",
  },
];
