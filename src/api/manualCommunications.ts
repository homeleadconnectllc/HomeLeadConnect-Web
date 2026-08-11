import { supabase } from "./client";

export type ManualCommunicationSubject = "lead" | "contractor";
export type ManualCommunicationChannel = "call" | "sms";
export type CommunicationPurpose = "service" | "appointment" | "lead_follow_up" | "marketing";

export type ComplianceResult = {
  id: string;
  decision: "ALLOW" | "BLOCK" | "REVIEW";
  reasons: string[];
  provider_ready: boolean;
};

export type GoogleVoiceActivity = {
  id: string;
  subject_type: ManualCommunicationSubject;
  subject_id: string;
  channel: ManualCommunicationChannel;
  direction: "inbound" | "outbound";
  purpose: CommunicationPurpose;
  destination: string;
  manual_outcome: string;
  operator_notes: string | null;
  created_at: string;
};

export async function configureGoogleVoice(number: string) {
  const { error } = await supabase.rpc("configure_google_voice_manual_channel", { p_sender_identity: number.trim() });
  if (error) throw error;
}

export async function getGoogleVoiceConfiguration() {
  const { data, error } = await supabase
    .from("communication_provider_connections")
    .select("sender_identity,status")
    .eq("provider_name", "google_voice")
    .eq("channel", "call")
    .maybeSingle();
  if (error) throw error;
  return data as { sender_identity: string; status: "manual_available" } | null;
}

export async function checkGoogleVoiceAction(input: {
  subjectType: ManualCommunicationSubject;
  subjectId: string;
  channel: ManualCommunicationChannel;
  purpose: CommunicationPurpose;
}): Promise<ComplianceResult> {
  const { data, error } = await supabase.rpc("evaluate_communication_compliance", {
    p_subject_type: input.subjectType,
    p_subject_id: input.subjectId,
    p_channel: input.channel,
    p_purpose: input.purpose,
    p_direction: "outbound",
    p_requested_automated: false,
    p_requested_prerecorded_or_ai_voice: false,
    p_requested_recording: false,
    p_provider_name: "google_voice",
  });
  if (error) throw error;
  return data as ComplianceResult;
}

export async function logGoogleVoiceActivity(input: {
  subjectType: ManualCommunicationSubject;
  subjectId: string;
  channel: ManualCommunicationChannel;
  direction: "inbound" | "outbound";
  purpose: CommunicationPurpose;
  outcome: string;
  notes: string;
  complianceCheckId?: string;
  conversationId?: string;
  requestId: string;
}) {
  const { data, error } = await supabase.rpc("log_google_voice_activity", {
    p_subject_type: input.subjectType,
    p_subject_id: input.subjectId,
    p_channel: input.channel,
    p_direction: input.direction,
    p_purpose: input.purpose,
    p_outcome: input.outcome.trim(),
    p_notes: input.notes.trim() || null,
    p_client_request_id: input.requestId,
    p_compliance_check_id: input.complianceCheckId || null,
    p_conversation_id: input.conversationId || null,
  });
  if (error) throw error;
  return data as string;
}

export async function listGoogleVoiceActivity(): Promise<GoogleVoiceActivity[]> {
  const { data, error } = await supabase
    .from("communication_transmissions")
    .select("id,subject_type,subject_id,channel,direction,purpose,destination,manual_outcome,operator_notes,created_at")
    .eq("provider_name", "google_voice")
    .eq("evidence_source", "operator_reported")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as GoogleVoiceActivity[];
}
