import { getCurrentWorkspaceId, supabase } from "./client";

export type ConversationMessage = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  persistence_status: "persisted";
  created_at: string;
};

export type Conversation = {
  id: string;
  workspace_id: string;
  subject: string;
  lead_id: number | null;
  job_id: string | null;
  updated_at: string;
  messages: ConversationMessage[];
};

export type PortalRecipient = {
  role: "homeowner" | "contractor";
  linkId: string;
  label: string;
  email: string | null;
};

export async function listConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id,workspace_id,subject,lead_id,job_id,updated_at,messages(id,conversation_id,sender_user_id,body,persistence_status,created_at)")
    .order("updated_at", { ascending: false })
    .order("created_at", { referencedTable: "messages", ascending: true });
  if (error) throw error;
  return (data ?? []) as Conversation[];
}

export async function listPortalRecipients(): Promise<PortalRecipient[]> {
  let workspaceId: string;
  try { workspaceId = await getCurrentWorkspaceId(); }
  catch { return []; }

  const [homeowners, contractors] = await Promise.all([
    supabase.from("homeowner_portal_links").select("id,lead_id").eq("workspace_id", workspaceId).is("revoked_at", null),
    supabase.from("contractor_portal_links").select("id,contractor_id").eq("workspace_id", workspaceId).is("revoked_at", null),
  ]);
  if (homeowners.error) throw homeowners.error;
  if (contractors.error) throw contractors.error;

  const leadIds = (homeowners.data ?? []).map((item) => item.lead_id);
  const contractorIds = (contractors.data ?? []).map((item) => item.contractor_id);
  const [leads, contractorRows] = await Promise.all([
    leadIds.length ? supabase.from("leads").select("id,full_name,email").in("id", leadIds) : Promise.resolve({ data: [], error: null }),
    contractorIds.length ? supabase.from("contractors").select("id,company_name,contact_name,email").in("id", contractorIds) : Promise.resolve({ data: [], error: null }),
  ]);
  if (leads.error) throw leads.error;
  if (contractorRows.error) throw contractorRows.error;

  return [
    ...(homeowners.data ?? []).map((link) => {
      const lead = (leads.data ?? []).find((item) => item.id === link.lead_id);
      return { role: "homeowner" as const, linkId: link.id, label: lead?.full_name || `Homeowner #${link.lead_id}`, email: lead?.email ?? null };
    }),
    ...(contractors.data ?? []).map((link) => {
      const contractor = (contractorRows.data ?? []).find((item) => item.id === link.contractor_id);
      return { role: "contractor" as const, linkId: link.id, label: contractor?.company_name || contractor?.contact_name || `Contractor #${link.contractor_id}`, email: contractor?.email ?? null };
    }),
  ];
}

export async function startPortalConversation(input: {
  recipient: PortalRecipient;
  subject: string;
  body: string;
  jobId?: string;
}) {
  const { data, error } = await supabase.rpc("start_portal_conversation", {
    p_portal_role: input.recipient.role,
    p_portal_link_id: input.recipient.linkId,
    p_subject: input.subject,
    p_body: input.body,
    p_client_request_id: crypto.randomUUID(),
    p_job_id: input.jobId || null,
  });
  if (error) throw error;
  return data as string;
}

export async function postInternalMessage(conversationId: string, body: string, requestId = crypto.randomUUID()) {
  const { data, error } = await supabase.rpc("post_internal_message", {
    p_conversation_id: conversationId,
    p_body: body,
    p_client_request_id: requestId,
  });
  if (error) throw error;
  return data as string;
}
