import { requireSupabaseConfig, supabase } from "../lib/supabase";

export type ProfessionalApplicationInput = {
  requestId: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  tradeCategories: string;
  serviceTerritory: string;
  experienceSummary: string;
  communicationConsent: boolean;
  honeypot: string;
};

export async function submitProfessionalApplication(input: ProfessionalApplicationInput) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc("submit_professional_application", {
    p_form_slug: "professional-application",
    p_request_id: input.requestId,
    p_organization_name: input.organizationName,
    p_contact_name: input.contactName,
    p_email: input.email,
    p_phone: input.phone,
    p_trade_categories: input.tradeCategories,
    p_service_territory: input.serviceTerritory,
    p_experience_summary: input.experienceSummary,
    p_communication_consent: input.communicationConsent,
    p_honeypot: input.honeypot,
  });
  if (error) throw error;
  return (data as Array<{ application_id: string; accepted: boolean }> | null)?.[0] ?? null;
}
