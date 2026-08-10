import { getCurrentWorkspaceId, supabase } from "./client";
import type { JobAssignment, JobAssignmentStatus } from "../lib/types/database";

const assignmentColumns =
  "id,workspace_id,job_id,contractor_id,status,created_by,created_at,updated_at,contractor:contractors(id,company_name,contact_name,specialty)";

export async function listJobAssignments(jobId: string): Promise<JobAssignment[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("job_assignments")
    .select(assignmentColumns)
    .eq("workspace_id", workspaceId)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as JobAssignment[];
}

export async function getCurrentJobAssignment(
  jobId: string,
): Promise<JobAssignment | null> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("job_assignments")
    .select(assignmentColumns)
    .eq("workspace_id", workspaceId)
    .eq("job_id", jobId)
    .in("status", ["offered", "accepted"])
    .maybeSingle();

  if (error) throw error;
  return data as unknown as JobAssignment | null;
}

export async function offerJobToContractor(
  jobId: string,
  contractorId: number,
): Promise<JobAssignment> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("job_assignments")
    .insert({
      workspace_id: workspaceId,
      job_id: jobId,
      contractor_id: contractorId,
      status: "offered" satisfies JobAssignmentStatus,
    })
    .select(assignmentColumns)
    .single();

  if (error) throw error;
  return data as unknown as JobAssignment;
}

async function transitionAssignment(
  assignmentId: string,
  from: JobAssignmentStatus[],
  status: JobAssignmentStatus,
): Promise<JobAssignment> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("job_assignments")
    .update({ status })
    .eq("workspace_id", workspaceId)
    .eq("id", assignmentId)
    .in("status", from)
    .select(assignmentColumns)
    .single();

  if (error) throw error;
  return data as unknown as JobAssignment;
}

export const acceptAssignment = (id: string) =>
  transitionAssignment(id, ["offered"], "accepted");

export const rejectAssignment = (id: string) =>
  transitionAssignment(id, ["offered"], "rejected");

export const cancelAssignment = (id: string) =>
  transitionAssignment(id, ["offered", "accepted"], "cancelled");
