import { getCurrentWorkspaceId, supabase } from "./client";

export type WorkspaceActivity = {
  id: string;
  workspace_id: string;
  entity_type: string | null;
  entity_id: string | null;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
};

export async function listWorkspaceActivity(limit = 100): Promise<WorkspaceActivity[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const safeLimit = Math.max(1, Math.min(limit, 250));
  const { data, error } = await supabase.from("activity_log")
    .select("id,workspace_id,entity_type,entity_id,event_type,payload,created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);
  if (error) throw error;
  return (data ?? []) as WorkspaceActivity[];
}
