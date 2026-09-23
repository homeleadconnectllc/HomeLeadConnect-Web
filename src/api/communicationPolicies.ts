import { supabase } from "../lib/supabase";

export type CommunicationActionPolicy = {
  workspace_id: string;
  timezone: string;
  business_days: number[];
  business_start: string;
  business_end: string;
  quiet_start: string;
  quiet_end: string;
  updated_at: string;
};

export const defaultCommunicationActionPolicy = {
  timezone: "America/New_York",
  business_days: [1, 2, 3, 4, 5],
  business_start: "08:00",
  business_end: "18:00",
  quiet_start: "21:00",
  quiet_end: "08:00",
};

export async function getCommunicationActionPolicy(workspaceId: string) {
  const { data, error } = await supabase
    .from("communication_action_policies")
    .select("workspace_id,timezone,business_days,business_start,business_end,quiet_start,quiet_end,updated_at")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  return data as CommunicationActionPolicy | null;
}

export async function saveCommunicationActionPolicy(input: Omit<CommunicationActionPolicy, "workspace_id" | "updated_at">) {
  const { data, error } = await supabase.rpc("set_communication_action_policy", {
    p_timezone: input.timezone,
    p_business_days: input.business_days,
    p_business_start: input.business_start,
    p_business_end: input.business_end,
    p_quiet_start: input.quiet_start,
    p_quiet_end: input.quiet_end,
  });
  if (error) throw error;
  return data;
}
