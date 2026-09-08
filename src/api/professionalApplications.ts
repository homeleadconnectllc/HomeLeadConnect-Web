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

export type ProfessionalApplicationApproval = {
  application_id: string;
  contractor_id: number;
  contractor_reused: boolean;
  invitation_id: string | null;
  invitation_token: string | null;
  portal_link_exists: boolean;
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

/**
 * Owner/manager approval bridge for a submitted professional application.
 * The database RPC resolves or creates the canonical public.contractors row,
 * then issues contractor portal access for that exact contractor_id.
 */
export async function approveProfessionalApplication(applicationId: string) {
  requireSupabaseConfig();
  const { data, error } = await supabase.rpc("approve_professional_application", {
    p_application_id: applicationId,
  });
  if (error) throw error;
  return (data as ProfessionalApplicationApproval[] | null)?.[0] ?? null;
}
