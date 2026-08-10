import { getCurrentWorkspaceId, supabase } from "./client";
import type { BusinessProfile, UserProfile } from "../lib/types/database";

const profileColumns = "id,user_id,workspace_id,full_name,avatar_url,role,onboarding_completed,onboarding_step";
const businessColumns = "id,workspace_id,business_name,owner_name,phone,email,website,address,city,state,zip";

export async function getMyProfile(): Promise<UserProfile> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("You must be signed in.");

  const { data, error } = await supabase
    .from("profiles")
    .select(profileColumns)
    .eq("user_id", authData.user.id)
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export async function updateMyProfile(input: {
  fullName: string;
  avatarUrl: string;
}): Promise<UserProfile> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("You must be signed in.");

  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName.trim() || null,
      avatar_url: input.avatarUrl.trim() || null,
    })
    .eq("user_id", authData.user.id)
    .select(profileColumns)
    .single();
  if (error) throw error;
  return data as UserProfile;
}

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("business_profile")
    .select(businessColumns)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (error) throw error;
  return data as BusinessProfile | null;
}

export async function saveBusinessProfile(input: Omit<BusinessProfile, "id" | "workspace_id">): Promise<BusinessProfile> {
  const workspaceId = await getCurrentWorkspaceId();
  const existing = await getBusinessProfile();
  const values = {
    business_name: clean(input.business_name),
    owner_name: clean(input.owner_name),
    phone: clean(input.phone),
    email: clean(input.email),
    website: clean(input.website),
    address: clean(input.address),
    city: clean(input.city),
    state: clean(input.state),
    zip: clean(input.zip),
  };

  const query = existing
    ? supabase.from("business_profile").update(values).eq("workspace_id", workspaceId)
    : supabase.from("business_profile").insert({ workspace_id: workspaceId, ...values });
  const { data, error } = await query.select(businessColumns).single();
  if (error) throw error;
  return data as BusinessProfile;
}

function clean(value: string | null) {
  return value?.trim() || null;
}
