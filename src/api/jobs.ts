import { getCurrentWorkspaceId, supabase } from "./client";
import type { CrmJob, CrmJobStatus } from "../lib/types/database";

const jobColumns =
  "id,workspace_id,lead_id,source_estimate_id,status,name,contract_value,created_by,created_at,updated_at";

export async function listJobs(): Promise<CrmJob[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("crm_jobs")
    .select(jobColumns)
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CrmJob[];
}

export async function updateJobStatus(
  id: string,
  status: CrmJobStatus,
): Promise<CrmJob> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("crm_jobs")
    .update({ status })
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select(jobColumns)
    .single();

  if (error) throw error;
  return data as CrmJob;
}
