import { normalizeInternalRole, type InternalRole } from "./accessPolicy";
import { supabase } from "./supabase";

export type HlcDestination = "/dashboard" | "/homeowner-portal" | "/contractor-portal" | "/partner-portal" | "/portal/accept";

export type AccessSignals = {
  hasWorkspace: boolean;
  hasHomeownerPortal: boolean;
  hasContractorPortal: boolean;
  hasPartnerPortal: boolean;
};

export function chooseAccessDestination({ hasWorkspace, hasHomeownerPortal, hasContractorPortal, hasPartnerPortal }: AccessSignals): HlcDestination {
  if (hasWorkspace) return "/dashboard";
  if (hasHomeownerPortal) return "/homeowner-portal";
  if (hasContractorPortal) return "/contractor-portal";
  if (hasPartnerPortal) return "/partner-portal";
  return "/portal/accept";
}

export async function resolveUserDestination(userId: string): Promise<HlcDestination> {
  const [membership, homeowner, contractor, partner] = await Promise.all([
    supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1),
    supabase.from("homeowner_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
    supabase.from("contractor_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
    supabase.rpc("get_partner_portal_data"),
  ]);

  if (membership.error) throw membership.error;
  if (homeowner.error) throw homeowner.error;
  if (contractor.error) throw contractor.error;
  if (partner.error && partner.error.code !== "42501") throw partner.error;

  return chooseAccessDestination({
    hasWorkspace: Boolean(membership.data?.length),
    hasHomeownerPortal: Boolean(homeowner.data?.length),
    hasContractorPortal: Boolean(contractor.data?.length),
    hasPartnerPortal: !partner.error && Boolean(partner.data),
  });
}

export async function resolveActiveWorkspaceRole(userId: string): Promise<InternalRole | null> {
  const profile = await supabase
    .from("profiles")
    .select("workspace_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile.error) throw profile.error;
  const workspaceId = profile.data?.workspace_id;
  if (!workspaceId) return null;

  const membership = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (membership.error) throw membership.error;
  return normalizeInternalRole(membership.data?.role);
}
