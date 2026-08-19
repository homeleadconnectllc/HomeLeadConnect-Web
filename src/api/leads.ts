import { getCurrentWorkspaceId, supabase } from "./client";
import type { Lead } from "../lib/types/database";

export type LeadRecord = Lead & {
  lead_code: string | null;
  source: string | null;
  priority: string | null;
  stage: string | null;
  appointment_at: string | null;
  appointment_status: string | null;
  next_follow_up_at: string | null;
  sla_status: string | null;
  conversion_score: number | null;
  notes: string | null;
  updated_at: string | null;
};

export type CreateLeadInput = {
  fullName: string;
  phone: string;
  email?: string;
  notes?: string;
};

const leadColumns = [
  "id",
  "id_uuid",
  "workspace_id",
  "full_name",
  "email",
  "phone",
  "status",
  "created_at",
  "updated_at",
  "notes",
  "lead_code",
  "source",
  "priority",
  "stage",
  "appointment_at",
  "appointment_status",
  "next_follow_up_at",
  "sla_status",
  "conversion_score",
].join(",");

export async function listLeads(): Promise<LeadRecord[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("leads")
    .select(leadColumns)
    .eq("workspace_id", workspaceId)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as LeadRecord[];
}

export async function getLead(id: number): Promise<LeadRecord> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("leads")
    .select(leadColumns)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as LeadRecord;
}

export async function createLead(input: CreateLeadInput): Promise<number> {
  const { data, error } = await supabase.rpc("create_workspace_lead", {
    p_full_name: input.fullName.trim(),
    p_phone: input.phone.trim(),
    p_email: input.email?.trim() || null,
    p_notes: input.notes?.trim() || null,
  });

  if (error) throw error;
  if (typeof data !== "number") throw new Error("Lead creation did not return a lead id.");
  return data;
}
