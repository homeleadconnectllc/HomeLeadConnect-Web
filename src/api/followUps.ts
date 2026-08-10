import { supabase } from "./client";
import type { FollowUp } from "../lib/types/database";

const columns = "id,created_at,lead_id,assigned_user_id,status,scheduled_for,completed_at,notes,follow_up_type,lead:leads!follow_ups_lead_id_fkey(id,id_uuid,full_name,phone)";

export async function listFollowUps(): Promise<FollowUp[]> {
  const { data, error } = await supabase
    .from("follow_ups")
    .select(columns)
    .order("scheduled_for", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as FollowUp[];
}

export async function createFollowUp(input: { leadId: string; scheduledFor: string; notes: string }): Promise<FollowUp> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("You must be signed in.");

  const { data, error } = await supabase
    .from("follow_ups")
    .insert({
      lead_id: input.leadId,
      assigned_user_id: authData.user.id,
      status: "pending",
      scheduled_for: input.scheduledFor,
      notes: input.notes.trim() || null,
      follow_up_type: "call",
    })
    .select(columns)
    .single();
  if (error) throw error;
  return data as unknown as FollowUp;
}

export async function completeFollowUp(id: number): Promise<FollowUp> {
  const { data, error } = await supabase
    .from("follow_ups")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")
    .select(columns)
    .single();
  if (error) throw error;
  return data as unknown as FollowUp;
}
