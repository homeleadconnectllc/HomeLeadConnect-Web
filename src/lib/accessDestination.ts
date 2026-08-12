import { supabase } from "./supabase";

export type HlcDestination = "/dashboard" | "/homeowner-portal" | "/contractor-portal" | "/portal/accept";

export type AccessSignals = {
  hasWorkspace: boolean;
  hasHomeownerPortal: boolean;
  hasContractorPortal: boolean;
};

export function chooseAccessDestination({ hasWorkspace, hasHomeownerPortal, hasContractorPortal }: AccessSignals): HlcDestination {
  if (hasWorkspace) return "/dashboard";
  if (hasHomeownerPortal) return "/homeowner-portal";
  if (hasContractorPortal) return "/contractor-portal";
  return "/portal/accept";
}

export async function resolveUserDestination(userId: string): Promise<HlcDestination> {
  const [membership, homeowner, contractor] = await Promise.all([
    supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1),
    supabase.from("homeowner_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
    supabase.from("contractor_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
  ]);

  if (membership.error) throw membership.error;
  if (homeowner.error) throw homeowner.error;
  if (contractor.error) throw contractor.error;

  return chooseAccessDestination({
    hasWorkspace: Boolean(membership.data?.length),
    hasHomeownerPortal: Boolean(homeowner.data?.length),
    hasContractorPortal: Boolean(contractor.data?.length),
  });
}
