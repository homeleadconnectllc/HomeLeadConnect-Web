import { supabase } from "./client";

export type PortalRole = "homeowner" | "contractor";
export type ProviderType = "contractor" | "subcontractor" | "remodeling_company" | "real_estate" | "mover" | "cleaner" | "painter" | "roofer" | "hvac" | "service_business" | "other";

export type HomeownerPortalEstimate = {
  id: string;
  status: string;
  subtotal: number;
  markup_amount: number;
  total: number;
  created_at: string;
  lines: Array<{ id: string; description: string; quantity: number; unit_cost: number; sort_order: number }>;
};

export type HomeownerPortalJob = {
  id: string;
  name: string;
  status: string;
  contract_value: number;
  created_at: string;
  appointments: Array<{ id: number; appointment_date: string; appointment_end_at: string | null; status: string }>;
};

export type HomeownerPortalRelationship = {
  workspace_id: string;
  lead_id: number;
  homeowner_name: string | null;
  estimates: HomeownerPortalEstimate[];
  jobs: HomeownerPortalJob[];
};

export type ContractorPortalAssignment = {
  id: string;
  workspace_id: string;
  contractor_id: number;
  status: string;
  created_at: string;
  job: {
    id: string;
    name: string;
    status: string;
    customer: { name: string | null; phone: string | null; email: string | null } | null;
  };
  appointments: Array<{ id: number; appointment_date: string; appointment_end_at: string | null; status: string }>;
};

export type ContractorPortalData = {
  links: Array<{ workspace_id: string; contractor_id: number; company_name: string | null; contact_name: string | null }>;
  assignments: ContractorPortalAssignment[];
};

export type LinkedProviderProfile = {
  id: number;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  specialty: string | null;
  provider_type: ProviderType;
};

export async function acceptPortalInvitation(token: string) {
  const { data, error } = await supabase.rpc("accept_portal_invitation", {
    p_invitation_token: token,
  });
  if (error) throw error;
  return (data as Array<{ portal_role: PortalRole; workspace_id: string; target_id: string }>)[0];
}

export async function getHomeownerPortalData(): Promise<HomeownerPortalRelationship[]> {
  const { data, error } = await supabase.rpc("get_homeowner_portal_data");
  if (error) throw error;
  return (data ?? []) as HomeownerPortalRelationship[];
}

export async function decideHomeownerEstimate(estimateId: string, decision: "accepted" | "rejected") {
  const { data, error } = await supabase.rpc("homeowner_decide_estimate", {
    p_estimate_id: estimateId,
    p_decision: decision,
  });
  if (error) throw error;
  return data as string;
}

export async function getContractorPortalData(): Promise<ContractorPortalData> {
  const { data, error } = await supabase.rpc("get_contractor_portal_data");
  if (error) throw error;
  return (data ?? { links: [], assignments: [] }) as ContractorPortalData;
}

export async function getLinkedProviderProfile(contractorId: number): Promise<LinkedProviderProfile> {
  const { data, error } = await supabase.rpc("get_linked_provider_profile", { p_contractor_id: contractorId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Linked provider profile was not found.");
  return row as LinkedProviderProfile;
}

export async function updateLinkedProviderProfile(profile: LinkedProviderProfile) {
  const { error } = await supabase.rpc("update_linked_provider_profile", {
    p_contractor_id: profile.id,
    p_company_name: profile.company_name || "",
    p_contact_name: profile.contact_name || "",
    p_phone: profile.phone || "",
    p_email: profile.email || "",
    p_website: profile.website || "",
    p_address: profile.address || "",
    p_city: profile.city || "",
    p_state: profile.state || "",
    p_zip: profile.zip || "",
    p_specialty: profile.specialty || "",
    p_provider_type: profile.provider_type,
  });
  if (error) throw error;
}

export async function decideContractorAssignment(assignmentId: string, decision: "accepted" | "rejected") {
  const { data, error } = await supabase.rpc("contractor_decide_assignment", {
    p_assignment_id: assignmentId,
    p_decision: decision,
  });
  if (error) throw error;
  return data as string;
}

export async function sendPortalInvitation(role: PortalRole, targetId: string | number, intendedEmail: string) {
  const { data, error } = await supabase.functions.invoke("send-portal-invitation", {
    body: { role, targetId: String(targetId), intendedEmail },
  });
  if (error) throw error;
  return data as { invitationId: string };
}
