export type WorkspacePlanCandidate = {
  workspace_id: string;
  status: string | null;
  is_active: boolean | null;
  grace_period_end?: string | null;
};

export function hasVerifiedWorkspaceAccess(candidate: WorkspacePlanCandidate, now = new Date()) {
  if (!candidate.is_active) return false;
  const status = String(candidate.status || "").toLowerCase();
  if (status === "active" || status === "trialing") return true;
  if (status !== "past_due" || !candidate.grace_period_end) return false;
  const graceEnd = new Date(candidate.grace_period_end);
  return Number.isFinite(graceEnd.getTime()) && graceEnd.getTime() > now.getTime();
}

export function chooseEntitledWorkspaceRecovery(
  currentWorkspaceId: string,
  candidates: WorkspacePlanCandidate[],
  now = new Date(),
): WorkspacePlanCandidate | null {
  const eligible = candidates.filter(
    (candidate) => candidate.workspace_id !== currentWorkspaceId && hasVerifiedWorkspaceAccess(candidate, now),
  );
  return eligible.length === 1 ? eligible[0] : null;
}
