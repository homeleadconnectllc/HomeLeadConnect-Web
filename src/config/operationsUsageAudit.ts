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
    currentSurface: "/operations + /notifications + /automations + /follow-ups",
    evidence: "The exception sources are now classified by their real durable authority. Follow-ups support a true completed state. Automation jobs persist succeeded, failed, or blocked execution outcomes. Notifications support read acknowledgement only, which is not resolution. AI handoffs and owner-attention items expose status/resolution columns but production currently grants read-only browser access and exposes no authorized resolution RPC, so they cannot truthfully offer resolved, escalated, or deferred completion actions yet.",
    gap: "missing_completion_state",
    correction: "Use the owning record's real terminal state when it exists: complete follow-ups in /follow-ups, inspect persisted automation outcomes in /automations, and treat notification read_at only as acknowledgement. Do not label a notification, failed automation, agent handoff, or owner-attention item resolved until its backend exposes an authorized durable resolution mutation. Preserve the affected-record deep link for every exception.",
  },
];
