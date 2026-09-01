import { supabase } from "./client";

export type CommunityMember = {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  headline: string | null;
  bio: string | null;
  city: string | null;
  state: string | null;
};

export type CommunityRelationship = {
  connection_id: string;
  peer_user_id: string;
  peer_full_name: string | null;
  peer_avatar_url: string | null;
  peer_role: string | null;
  peer_headline: string | null;
  peer_city: string | null;
  peer_state: string | null;
  relationship_status: "pending" | "accepted" | "declined" | "blocked";
  direction: "incoming" | "outgoing";
  requested_at: string;
  responded_at: string | null;
};

export type CommunityPrivateMessage = {
  id: string;
  sender_user_id: string;
  recipient_user_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export async function listCommunityMembers() {
  const { data, error } = await supabase.rpc("community_discover_members");
  if (error) throw error;
  return (data ?? []) as CommunityMember[];
}

export async function listCommunityRelationships() {
  const { data, error } = await supabase.rpc("community_list_relationships");
  if (error) throw error;
  return (data ?? []) as CommunityRelationship[];
}

export async function requestCommunityConnection(peerUserId: string) {
  const { data, error } = await supabase.rpc("community_request_connection", { peer_user_id: peerUserId });
  if (error) throw error;
  return data;
}

export async function respondCommunityConnection(connectionId: string, accept: boolean) {
  const { data, error } = await supabase.rpc("community_respond_connection", { connection_id: connectionId, accept_connection: accept });
  if (error) throw error;
  return data;
}

export async function blockCommunityConnection(peerUserId: string) {
  const { data, error } = await supabase.rpc("community_block_connection", { peer_user_id: peerUserId });
  if (error) throw error;
  return data;
}

export async function canCommunityMessage(peerUserId: string) {
  const { data, error } = await supabase.rpc("community_can_message", { peer_user_id: peerUserId });
  if (error) throw error;
  return Boolean(data);
}

export async function listCommunityMessages(peerUserId: string) {
  const { data, error } = await supabase.rpc("community_list_messages", { peer_user_id: peerUserId });
  if (error) throw error;
  return (data ?? []) as CommunityPrivateMessage[];
}

export async function sendCommunityMessage(peerUserId: string, body: string) {
  const { data, error } = await supabase.rpc("community_send_message", { peer_user_id: peerUserId, message_body: body });
  if (error) throw error;
  return data as CommunityPrivateMessage;
}
