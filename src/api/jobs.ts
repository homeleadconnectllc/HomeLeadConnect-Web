import { getCurrentWorkspaceId, supabase } from "./client";
import type { CrmJob, CrmJobStatus } from "../lib/types/database";

const jobColumns =
  "id,workspace_id,lead_id,source_estimate_id,status,name,contract_value,created_by,created_at,updated_at";

export type JobDetailRecord = CrmJob & {
  lead: { full_name: string | null; email: string | null; phone: string } | null;
  source_estimate: { status: string; total: number } | null;
};

const lifecycleTransitions: Record<CrmJobStatus, CrmJobStatus[]> = {
  pending: ["active", "cancelled"],
  active: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export function allowedJobStatusTransitions(status: CrmJobStatus): CrmJobStatus[] {
  return lifecycleTransitions[status];
}

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
  const { data, error } = await supabase.rpc("transition_crm_job", {
    p_job_id: id,
    p_status: status,
  });

  if (error) throw error;
  return data as CrmJob;
}

export async function getJob(id: string): Promise<JobDetailRecord> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("crm_jobs")
    .select(
      `${jobColumns},lead:leads(full_name,email,phone),source_estimate:estimates(status,total)`,
    )
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as JobDetailRecord;
}
