import { getCurrentWorkspaceId, supabase } from "./client";
import { getCurrentJobAssignment } from "./jobAssignments";
import { getJob } from "./jobs";
import type { AppointmentStatus, JobAppointment } from "../lib/types/database";
import { requireAppointmentTimeRange } from "../lib/appointments/timeRange";

const appointmentColumns =
  "id,workspace_id,job_id,lead_id,contractor_id,organization_id,appointment_date,appointment_end_at,status,notes,created_by,created_at,updated_at,contractor:contractors(id,company_name,contact_name),job:crm_jobs(id,name)";

export async function listJobAppointments(jobId: string): Promise<JobAppointment[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentColumns)
    .eq("workspace_id", workspaceId)
    .eq("job_id", jobId)
    .order("appointment_date", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as JobAppointment[];
}

export async function listWorkspaceAppointments(): Promise<JobAppointment[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentColumns)
    .eq("workspace_id", workspaceId)
    .order("appointment_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as JobAppointment[];
}

export async function scheduleAppointment(input: {
  jobId: string;
  appointmentDate: string;
  appointmentEndAt: string;
  notes?: string;
}): Promise<JobAppointment> {
  const range = requireAppointmentTimeRange(input.appointmentDate, input.appointmentEndAt);
  const [workspaceId, assignment, job] = await Promise.all([
    getCurrentWorkspaceId(),
    getCurrentJobAssignment(input.jobId),
    getJob(input.jobId),
  ]);

  if (!assignment || assignment.status !== "accepted") {
    throw new Error("Accept the contractor assignment before scheduling work.");
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      workspace_id: workspaceId,
      job_id: input.jobId,
      lead_id: job.lead_id,
      contractor_id: assignment.contractor_id,
      appointment_date: range.start,
      appointment_end_at: range.end,
      status: "scheduled" satisfies AppointmentStatus,
      notes: input.notes?.trim() || null,
    })
    .select(appointmentColumns)
    .single();

  if (error) throw error;
  return data as unknown as JobAppointment;
}

export async function rescheduleAppointment(
  appointmentId: number,
  appointmentDate: string,
  appointmentEndAt: string,
  notes?: string,
): Promise<JobAppointment> {
  const range = requireAppointmentTimeRange(appointmentDate, appointmentEndAt);
  const { data, error } = await supabase.rpc("reschedule_job_appointment", {
    p_appointment_id: appointmentId,
    p_appointment_date: range.start,
    p_appointment_end_at: range.end,
    p_notes: notes?.trim() || null,
  });

  if (error) throw error;
  return data as unknown as JobAppointment;
}

async function transitionAppointment(
  appointmentId: number,
  status: Exclude<AppointmentStatus, "scheduled">,
): Promise<JobAppointment> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("workspace_id", workspaceId)
    .eq("id", appointmentId)
    .eq("status", "scheduled")
    .select(appointmentColumns)
    .single();

  if (error) throw error;
  return data as unknown as JobAppointment;
}

export const completeAppointment = (id: number) =>
  transitionAppointment(id, "completed");

export const cancelAppointment = (id: number) =>
  transitionAppointment(id, "cancelled");

export const markNoShow = (id: number) =>
  transitionAppointment(id, "no_show");
