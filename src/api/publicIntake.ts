import { requireSupabaseConfig, supabase } from "../lib/supabase";
import { dispatchInternalNotification } from "./internalNotifications";

export async function submitServiceRequest(input: {
  requestId: string;
  fullName: string;
  phone: string;
  email: string;
  projectDetails: string;
  honeypot: string;
}) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc("submit_public_service_request", {
    p_form_slug: "request-service",
    p_request_id: input.requestId,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_email: input.email || null,
    p_project_details: input.projectDetails,
    p_honeypot: input.honeypot,
  });
  if (error) throw error;
  const result = (data as Array<{ lead_id: number; accepted: boolean }> | null)?.[0] ?? null;
  if (result?.accepted && result.lead_id) {
    void dispatchInternalNotification({
      eventType: "resident_request.created",
      eventKey: String(result.lead_id),
      verificationToken: input.requestId,
    });
  }
  return result;
}
