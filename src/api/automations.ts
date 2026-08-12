import { getCurrentWorkspaceId, supabase } from "./client";

export type AutomationJobRecord = {
  id: string;
  job_type: string;
  status: string;
  retry_count: number;
  max_attempts: number;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export async function listAutomationJobs(limit = 50) {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("automation_jobs")
    .select("id,job_type,status,retry_count,max_attempts,payload,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AutomationJobRecord[];
}
