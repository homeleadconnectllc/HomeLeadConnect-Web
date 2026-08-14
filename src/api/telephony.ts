import { supabase } from "./client";

export type BusinessPhone = {
  id: string;
  phone_number: string;
  display_name: string;
  provider_type: string;
  is_primary: boolean;
  inbound_enabled: boolean;
  outbound_enabled: boolean;
  browser_calling_enabled: boolean;
  sms_enabled: boolean;
  readiness_state: string;
  verification_state: string;
};

export type CallSession = {
  id: string;
  normalized_state: string | null;
  provider_raw_state: string | null;
  direction: string | null;
  subject_type: string | null;
  subject_id: string | null;
  disposition: string | null;
  started_at: string;
  ended_at: string | null;
  business_phone_id: string | null;
};

export async function listBusinessPhones() {
  const { data, error } = await supabase
    .from("business_phone_numbers")
    .select("id,phone_number,display_name,provider_type,is_primary,inbound_enabled,outbound_enabled,browser_calling_enabled,sms_enabled,readiness_state,verification_state")
    .order("is_primary", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BusinessPhone[];
}

export async function listCallSessions() {
  const { data, error } = await supabase
    .from("call_sessions")
    .select("id,normalized_state,provider_raw_state,direction,subject_type,subject_id,disposition,started_at,ended_at,business_phone_id")
    .order("started_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as CallSession[];
}

export async function recordCallDisposition(id: string, disposition: string, notes?: string) {
  const { error } = await supabase.rpc("record_call_disposition", {
    p_call_session_id: id,
    p_disposition: disposition,
    p_notes: notes || null,
  });
  if (error) throw error;
}
