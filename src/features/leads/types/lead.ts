export type Lead = {
  id: number;
  lead_code: string | null;
  full_name: string | null;
  phone: string;
  email: string | null;
  status: string | null;
  created_at: string;
  notes: string | null;
  workspace_id: string;
  assigned_to: string | null;
  source: string | null;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  priority: string;
  stage_updated_at: string;
  archived: boolean;
  updated_at: string;
  appointment_at: string | null;
  appointment_status: string | null;
  assigned_until: string | null;
  priority_score: number | null;
  pipeline_stage_id: string | null;
  id_uuid: string;
  organization_id: string | null;
  first_name: string | null;
  last_name: string | null;
  score: number | null;
  lead_number: number | null;
  request_id: string | null;
  pipeline_id: string | null;
  advance_request_id: string | null;
  stage: string | null;
  sla_status: string | null;
  claimed_at: string | null;
  sla_expires_at: string | null;
  conversion_score: number | null;
  intent_tags: string[] | null;
  attempt_count: number | null;
  next_eligible_dial_at: string | null;
  priority_weight: number | null;
};

export type LeadSort = "created_at" | "appointment_at" | "priority";

export type LeadFilters = {
  archived: boolean;
  stage: string;
  priority: string;
  source: string;
  status: string;
};

export type WorkspaceMembership = {
  workspace_id: string;
};
