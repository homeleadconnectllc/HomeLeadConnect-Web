import { getCurrentWorkspaceId, supabase } from "./client";
import type { EvidenceState } from "../lib/leadscope/domain";
import type { LeadScopeMeasurementUnit } from "../lib/leadscope/estimate";

async function residentContext() {
  const workspaceId = await getCurrentWorkspaceId();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Authentication is required.");
  return { workspaceId, userId: user.id };
}

export type LeadScopeProject = {
  id: string;
  property_id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  project_type: string;
  measurement_unit: LeadScopeMeasurementUnit;
  measurements: { quantity: number } | null;
  measurements_state: EvidenceState;
  measurements_source: string | null;
  measurements_note: string | null;
  site_conditions: string | null;
  site_conditions_state: EvidenceState;
  site_conditions_source: string | null;
  site_conditions_note: string | null;
  scope_description: string | null;
  scope_description_state: EvidenceState;
  scope_description_source: string | null;
  scope_description_note: string | null;
  estimate_rate_low: number | null;
  estimate_rate_high: number | null;
  estimate_low: number | null;
  estimate_high: number | null;
  estimate_currency: string;
  estimate_method: string | null;
  status: "draft" | "reviewed" | "saved";
  created_at: string;
  updated_at: string;
};

export type SaveLeadScopeProjectInput = Omit<LeadScopeProject, "id" | "workspace_id" | "user_id" | "created_at" | "updated_at">;

export async function hasResidentLeadScopeEntitlement() {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase.rpc("has_portal_capability", {
    p_workspace_id: workspaceId,
    p_audience: "resident",
    p_capability: "leadscope",
  });
  if (error) throw error;
  return data === true;
}

export async function listLeadScopeProjects() {
  const { workspaceId, userId } = await residentContext();
  const { data, error } = await supabase.from("leadscope_projects").select("*")
    .eq("workspace_id", workspaceId).eq("user_id", userId).order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as LeadScopeProject[];
}

export async function createLeadScopeProject(input: SaveLeadScopeProjectInput) {
  const { workspaceId, userId } = await residentContext();
  const { data, error } = await supabase.from("leadscope_projects").insert({ ...input, workspace_id: workspaceId, user_id: userId })
    .select("*").single();
  if (error) throw error;
  return data as LeadScopeProject;
}

export async function updateLeadScopeProject(id: string, input: SaveLeadScopeProjectInput) {
  const { workspaceId, userId } = await residentContext();
  const { data, error } = await supabase.from("leadscope_projects").update(input)
    .eq("id", id).eq("workspace_id", workspaceId).eq("user_id", userId).select("*").single();
  if (error) throw error;
  return data as LeadScopeProject;
}
