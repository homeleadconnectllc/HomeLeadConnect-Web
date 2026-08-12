import { getCurrentWorkspaceId, supabase } from "./client";

export type AutomationJobRecord = {
  id: string;
  job_type: string;
  status: "queued" | "running" | "succeeded" | "failed" | "blocked";
  retry_count: number;
  max_attempts: number;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
};

export type AutomationRunResult = {
  id: string;
  job_type: string;
  status: AutomationJobRecord["status"];
  result: Record<string, unknown> | null;
  duplicate: boolean;
};

export async function listAutomationJobs(limit = 50) {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("automation_jobs")
    .select("id,job_type,status,retry_count,max_attempts,payload,result,last_error,created_at,updated_at,completed_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AutomationJobRecord[];
}

export async function runAutomation(jobType: "workflow_health_check" | "followup_scan" | "owner_attention_scan") {
  const { data, error } = await supabase.rpc("run_hlc_automation", {
    p_job_type: jobType,
    p_payload: {},
    p_idempotency_key: crypto.randomUUID(),
  });
  if (error) throw error;
  return data as AutomationRunResult;
}
