import { getCurrentWorkspaceId, supabase } from "./client";
import type { Lead } from "../lib/types/database";

const leadColumns = "id,id_uuid,workspace_id,full_name,email,phone,status,created_at";

export async function listLeads(): Promise<Lead[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("leads")
    .select(leadColumns)
    .eq("workspace_id", workspaceId)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function getLead(id: number): Promise<Lead> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("leads")
    .select(leadColumns)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Lead;
}
