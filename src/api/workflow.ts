import { getCurrentWorkspaceId, supabase } from "./client";

export type WorkflowSnapshot = {
  requests: number;
  leads: number;
  leadScopes: number;
  jobs: number;
  providerOffers: number;
  acceptedAssignments: number;
  appointments: number;
  conversations: number;
  completedJobs: number;
};

async function countRows(
  table: string,
  workspaceId: string,
  filters: Array<[column: string, value: string | boolean]> = [],
) {
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  for (const [column, value] of filters) query = query.eq(column, value);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function countPublicRequests(workspaceId: string) {
  const { count, error } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("archived", false)
    .not("request_id", "is", null);

  if (error) throw error;
  return count ?? 0;
}

export async function getWorkflowSnapshot(): Promise<WorkflowSnapshot> {
  const workspaceId = await getCurrentWorkspaceId();
  const [
    requests,
    leads,
    leadScopes,
    jobs,
    providerOffers,
    acceptedAssignments,
    appointments,
    conversations,
    completedJobs,
  ] = await Promise.all([
    countPublicRequests(workspaceId),
    countRows("leads", workspaceId, [["archived", false]]),
    countRows("estimates", workspaceId),
    countRows("crm_jobs", workspaceId),
    countRows("job_assignments", workspaceId, [["status", "offered"]]),
    countRows("job_assignments", workspaceId, [["status", "accepted"]]),
    countRows("appointments", workspaceId),
    countRows("conversations", workspaceId),
    countRows("crm_jobs", workspaceId, [["status", "completed"]]),
  ]);

  return {
    requests,
    leads,
    leadScopes,
    jobs,
    providerOffers,
    acceptedAssignments,
    appointments,
    conversations,
    completedJobs,
  };
}
