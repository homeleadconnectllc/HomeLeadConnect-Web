import { supabase } from "../lib/supabase";

export type HlcAnalyticsSummary = {
  days: number;
  page_views: number;
  sessions: number;
  authenticated_sessions: number;
  visitor_sessions: number;
  leadscope_views: number;
  material_store_clicks: number;
  sign_in_starts: number;
  service_request_starts: number;
  top_paths: Array<{ path: string; views: number }>;
  events: Array<{ event: string; count: number }>;
};

export type HlcBusinessKpis = {
  days: number;
  leads: number;
  estimates: number;
  accepted_estimates: number;
  converted_estimates: number;
  lead_to_estimate_rate: number;
  estimate_acceptance_rate: number;
  estimate_to_job_rate: number;
  jobs: number;
  job_value: number;
  open_estimate_value: number;
  assignments: number;
  accepted_assignments: number;
  assignment_acceptance_rate: number;
  appointments: number;
  completed_appointments: number;
  pending_followups: number;
  overdue_followups: number;
  calls: number;
  missed_calls: number;
  voicemails: number;
};

type AnalyticsMetadata = Record<string, string | number | boolean | null>;

const SESSION_KEY = "hlc-analytics-session-id";

export function getAnalyticsSessionId() {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const next = crypto.randomUUID();
  sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

function referrerHost() {
  if (!document.referrer) return null;
  try { return new URL(document.referrer).hostname.toLowerCase(); }
  catch { return null; }
}

export async function recordAnalyticsEvent(eventName: string, path = window.location.pathname, metadata: AnalyticsMetadata = {}) {
  const { error } = await supabase.rpc("record_hlc_analytics_event", {
    p_session_id: getAnalyticsSessionId(),
    p_event_name: eventName,
    p_path: path,
    p_hostname: window.location.hostname.toLowerCase(),
    p_referrer_host: referrerHost(),
    p_metadata: metadata,
  });
  if (error) throw error;
}

export function trackAnalyticsEvent(eventName: string, metadata: AnalyticsMetadata = {}) {
  void recordAnalyticsEvent(eventName, window.location.pathname, metadata).catch(() => {
    // Analytics never blocks core HLC workflows.
  });
}

export async function getAnalyticsSummary(days = 30) {
  const { data, error } = await supabase.rpc("get_hlc_analytics_summary", { p_days: days });
  if (error) throw error;
  return (data ?? {}) as HlcAnalyticsSummary;
}

export async function getBusinessKpis(days = 30) {
  const { data, error } = await supabase.rpc("get_hlc_business_kpis", { p_days: days });
  if (error) throw error;
  return (data ?? {}) as HlcBusinessKpis;
}
