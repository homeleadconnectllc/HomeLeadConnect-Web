import { supabase } from "../lib/supabase";

export type ProviderConnectionEvidence = {
  channel: string;
  provider_name: string;
  status: string;
};

export type IntegrationEvidence = {
  providerConnections: ProviderConnectionEvidence[];
  calendarMappings: Array<{ sync_state: string }>;
  emailTransmissions: Array<{ status: string; provider_name: string }>;
  providerEventCount: number;
};

export async function getIntegrationEvidence(workspaceId: string): Promise<IntegrationEvidence> {
  const [connections, calendar, email, providerEvents] = await Promise.all([
    supabase
      .from("communication_provider_connections")
      .select("channel,provider_name,status")
      .eq("workspace_id", workspaceId),
    supabase
      .from("calendar_event_mappings")
      .select("sync_state")
      .eq("workspace_id", workspaceId),
    supabase
      .from("communication_transmissions")
      .select("status,provider_name")
      .eq("workspace_id", workspaceId)
      .eq("channel", "email")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("communication_provider_events")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
  ]);

  if (connections.error) throw connections.error;
  if (calendar.error) throw calendar.error;
  if (email.error) throw email.error;
  if (providerEvents.error) throw providerEvents.error;

  return {
    providerConnections: connections.data || [],
    calendarMappings: calendar.data || [],
    emailTransmissions: email.data || [],
    providerEventCount: providerEvents.count || 0,
  };
}
