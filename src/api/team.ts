import { getCurrentWorkspaceId, supabase } from "./client";

export type TeamRole = "owner" | "manager" | "technician";

export type TeamMember = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  member_role: TeamRole;
  joined_at: string;
};

export type WorkspaceInvitation = {
  id: string;
  intended_email: string;
  role: Exclude<TeamRole, "owner">;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
};

export type CreatedWorkspaceInvitation = {
  invitation_id: string;
  invitation_token: string;
  intended_email: string;
  invited_role: Exclude<TeamRole, "owner">;
  expires_at: string;
};

export type AcceptedWorkspaceInvitation = {
  workspace_id: string;
  workspace_name: string;
  member_role: TeamRole;
};

function firstRow<T>(data: unknown): T {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("HLC returned no team record.");
  return row as T;
}

export async function getWorkspaceTeam() {
  const { data, error } = await supabase.rpc("get_workspace_team");
  if (error) throw error;
  return (data ?? []) as TeamMember[];
}

export async function listWorkspaceInvitations() {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("workspace_invitations")
    .select("id,intended_email,role,created_at,expires_at,accepted_at,revoked_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as WorkspaceInvitation[];
}

export async function createWorkspaceInvitation(email: string, role: "manager" | "technician") {
  const { data, error } = await supabase.rpc("create_workspace_invitation", {
    p_intended_email: email.trim().toLowerCase(),
    p_role: role,
    p_expires_in_minutes: 1440,
  });
  if (error) throw error;
  return firstRow<CreatedWorkspaceInvitation>(data);
}

export async function revokeWorkspaceInvitation(id: string) {
  const { error } = await supabase.rpc("revoke_workspace_invitation", { p_invitation_id: id });
  if (error) throw error;
}

export async function removeWorkspaceMember(userId: string) {
  const { error } = await supabase.rpc("remove_workspace_member", { p_user_id: userId });
  if (error) throw error;
}

export async function acceptWorkspaceInvitation(token: string) {
  const { data, error } = await supabase.rpc("accept_workspace_invitation", { p_invitation_token: token });
  if (error) throw error;
  return firstRow<AcceptedWorkspaceInvitation>(data);
}
