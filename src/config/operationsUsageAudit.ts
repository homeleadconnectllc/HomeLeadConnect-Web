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
    status: "connected",
    currentSurface: "/operations + /notifications + /automations + /follow-ups",
    evidence: "The candidate now provides a management-authorized durable exception disposition record for resolved, escalated, or deferred outcomes while preserving the source record and affected-route link. Follow-ups still use their own completed state, automation jobs retain their persisted execution outcomes, and notification read state remains acknowledgement rather than resolution.",
    correction: "Keep disposition separate from source-system truth: record the management handling outcome, preserve the affected-record deep link, and never rewrite a source notification, failed automation, agent handoff, or owner-attention record merely to make an exception look closed.",
  },
];
