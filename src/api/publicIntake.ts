import { supabase } from "../lib/supabase";

export async function submitServiceRequest(input: {
  requestId: string;
  fullName: string;
  phone: string;
  email: string;
  projectDetails: string;
}) {
  const { data, error } = await supabase.rpc("submit_public_service_request", {
    p_form_slug: "request-service",
    p_request_id: input.requestId,
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_email: input.email || null,
    p_project_details: input.projectDetails,
  });
  if (error) throw error;
  return (data as Array<{ lead_id: number; accepted: boolean }> | null)?.[0] ?? null;
}
