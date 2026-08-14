import { supabase } from "./client";

export type PortalParticipantType = "homeowner" | "renter" | "mover" | "community_member";
export type PortalIdentityProfile = {
  user_id: string;
  participant_type: PortalParticipantType;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  preferred_contact: "email" | "phone" | "sms" | null;
  language: string;
  accessibility_notes: string | null;
  created_at: string;
  updated_at: string;
};

const columns = "user_id,participant_type,full_name,avatar_url,phone,preferred_contact,language,accessibility_notes,created_at,updated_at";

export async function getPortalIdentityProfile(): Promise<PortalIdentityProfile> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("You must be signed in.");

  const { data, error } = await supabase.from("portal_identity_profiles")
    .select(columns)
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as PortalIdentityProfile;

  const fallbackName = typeof authData.user.user_metadata?.full_name === "string" ? authData.user.user_metadata.full_name : null;
  const { data: created, error: createError } = await supabase.from("portal_identity_profiles")
    .insert({ user_id: authData.user.id, full_name: fallbackName })
    .select(columns)
    .single();
  if (createError) throw createError;
  return created as PortalIdentityProfile;
}

export async function savePortalIdentityProfile(input: {
  participantType: PortalParticipantType;
  fullName: string;
  avatarUrl: string;
  phone: string;
  preferredContact: "email" | "phone" | "sms" | "";
  language: string;
  accessibilityNotes: string;
}): Promise<PortalIdentityProfile> {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("You must be signed in.");

  const values = {
    participant_type: input.participantType,
    full_name: clean(input.fullName),
    avatar_url: clean(input.avatarUrl),
    phone: clean(input.phone),
    preferred_contact: input.preferredContact || null,
    language: input.language.trim() || "en",
    accessibility_notes: clean(input.accessibilityNotes),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("portal_identity_profiles")
    .upsert({ user_id: authData.user.id, ...values }, { onConflict: "user_id" })
    .select(columns)
    .single();
  if (error) throw error;
  return data as PortalIdentityProfile;
}

function clean(value: string) {
  return value.trim() || null;
}
