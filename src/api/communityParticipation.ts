import { getCurrentWorkspaceId, supabase } from "./client";

async function context() {
  const workspaceId = await getCurrentWorkspaceId();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Authentication is required.");
  return { workspaceId, userId: user.id };
}

export type CommunityReply = {
  id: string;
  post_id: string;
  author_user_id: string;
  body: string;
  status: "active" | "removed";
  created_at: string;
  updated_at: string;
};

export async function listCommunityReplies(postIds: string[]) {
  if (postIds.length === 0) return [] as CommunityReply[];
  const { workspaceId } = await context();
  const { data, error } = await supabase
    .from("community_post_replies")
    .select("id,post_id,author_user_id,body,status,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "active")
    .in("post_id", postIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CommunityReply[];
}

export async function createCommunityReply(postId: string, body: string) {
  const { workspaceId, userId } = await context();
  const { data, error } = await supabase
    .from("community_post_replies")
    .insert({ workspace_id: workspaceId, post_id: postId, author_user_id: userId, body: body.trim() })
    .select("id,post_id,author_user_id,body,status,created_at,updated_at")
    .single();
  if (error) throw error;
  return data as CommunityReply;
}

export type CommunityGroupMembership = {
  group_id: string;
  user_id: string;
  joined_at: string;
};

export async function listCommunityGroupMemberships(groupIds: string[]) {
  if (groupIds.length === 0) return { memberships: [] as CommunityGroupMembership[], currentUserId: "" };
  const { workspaceId, userId } = await context();
  const { data, error } = await supabase
    .from("community_group_members")
    .select("group_id,user_id,joined_at")
    .eq("workspace_id", workspaceId)
    .in("group_id", groupIds);
  if (error) throw error;
  return { memberships: (data ?? []) as CommunityGroupMembership[], currentUserId: userId };
}

export async function joinCommunityGroup(groupId: string) {
  const { workspaceId, userId } = await context();
  const { error } = await supabase.from("community_group_members").insert({ workspace_id: workspaceId, group_id: groupId, user_id: userId });
  if (error) throw error;
}

export async function leaveCommunityGroup(groupId: string) {
  const { workspaceId, userId } = await context();
  const { error } = await supabase.from("community_group_members").delete().eq("workspace_id", workspaceId).eq("group_id", groupId).eq("user_id", userId);
  if (error) throw error;
}

export type EventAttendanceResponse = "going" | "interested" | "not_going";
export type CommunityEventAttendance = {
  event_post_id: string;
  user_id: string;
  response: EventAttendanceResponse;
  created_at: string;
  updated_at: string;
};

export async function listCommunityEventAttendance(eventIds: string[]) {
  if (eventIds.length === 0) return { attendance: [] as CommunityEventAttendance[], currentUserId: "" };
  const { workspaceId, userId } = await context();
  const { data, error } = await supabase
    .from("community_event_attendance")
    .select("event_post_id,user_id,response,created_at,updated_at")
    .eq("workspace_id", workspaceId)
    .in("event_post_id", eventIds);
  if (error) throw error;
  return { attendance: (data ?? []) as CommunityEventAttendance[], currentUserId: userId };
}

export async function setCommunityEventAttendance(eventPostId: string, response: EventAttendanceResponse) {
  const { workspaceId, userId } = await context();
  const { error } = await supabase.from("community_event_attendance").upsert({
    workspace_id: workspaceId,
    event_post_id: eventPostId,
    user_id: userId,
    response,
    updated_at: new Date().toISOString(),
  }, { onConflict: "event_post_id,user_id" });
  if (error) throw error;
}

export async function clearCommunityEventAttendance(eventPostId: string) {
  const { workspaceId, userId } = await context();
  const { error } = await supabase.from("community_event_attendance").delete().eq("workspace_id", workspaceId).eq("event_post_id", eventPostId).eq("user_id", userId);
  if (error) throw error;
}
