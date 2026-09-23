import { getCurrentWorkspaceId, supabase } from "./client";

export type AutomationJobStatus =
  | "queued"
  | "processing"
  | "success"
  | "failed"
  | "running"
  | "succeeded"
  | "retry_wait"
  | "blocked";

export type AutomationJobRecord = {
  id: string;
  job_type: string;
  status: AutomationJobStatus;
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
  status: AutomationJobStatus;
  result: Record<string, unknown> | null;
  duplicate: boolean;
  attempt_count: number;
  max_attempts: number;
  exhausted: boolean;
  error?: string;
};

export type AutomationAttemptRecord = {
  id: string;
  automation_job_id: string;
  attempt_number: number;
  status: "processing" | "success" | "failed";
  started_at: string;
  completed_at: string | null;
  result: Record<string, unknown> | null;
  error_message: string | null;
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

export async function retryAutomation(jobId: string) {
  const { data, error } = await supabase.rpc("retry_hlc_automation", { p_job_id: jobId });
  if (error) throw error;
  return data as AutomationRunResult;
}

export async function listAutomationAttempts(jobIds: string[]) {
  if (jobIds.length === 0) return [];
  const { data, error } = await supabase
    .from("automation_job_attempts")
    .select("id,automation_job_id,attempt_number,status,started_at,completed_at,result,error_message")
    .in("automation_job_id", jobIds)
    .order("attempt_number", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AutomationAttemptRecord[];
}
