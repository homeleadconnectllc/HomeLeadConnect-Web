import { getCurrentWorkspaceId, supabase } from "./client";
import type {
  CrmJob,
  Estimate,
  EstimateStatus,
} from "../lib/types/database";
import type { EstimateLine } from "../lib/estimator/calculations";

const estimateColumns =
  "id,workspace_id,lead_id,status,markup_percent,subtotal,markup_amount,total,created_by,created_at,updated_at,converted_to_job_at";

export type SaveEstimateInput = {
  id?: string;
  leadId: number | null;
  status: Exclude<EstimateStatus, "converted">;
  markupPercent: number;
  subtotal: number;
  markupAmount: number;
  total: number;
  lines: EstimateLine[];
};

export async function listEstimates(): Promise<Estimate[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("estimates")
    .select(estimateColumns)
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Estimate[];
}

export async function getEstimate(id: string): Promise<Estimate> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("estimates")
    .select(`${estimateColumns},estimate_lines(*)`)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .order("sort_order", { referencedTable: "estimate_lines" })
    .single();

  if (error) throw error;
  return data as Estimate;
}

export async function saveEstimate(input: SaveEstimateInput): Promise<Estimate> {
  const { data, error } = await supabase.rpc("save_estimate_with_lines", {
    p_estimate_id: input.id ?? null,
    p_lead_id: input.leadId,
    p_status: input.status,
    p_markup_percent: input.markupPercent,
    p_subtotal: input.subtotal,
    p_markup_amount: input.markupAmount,
    p_total: input.total,
    p_lines: input.lines.map((line) => ({
      description: line.description.trim() || "Untitled item",
      quantity: line.quantity,
      unitCost: line.unitCost,
    })),
  });

  if (error) throw error;
  const estimate = data as Estimate;
  return getEstimate(estimate.id);
}

export async function updateEstimateStatus(
  id: string,
  status: Exclude<EstimateStatus, "converted">,
): Promise<Estimate> {
  const { data, error } = await supabase.rpc("set_estimate_status", {
    p_estimate_id: id,
    p_status: status,
  });

  if (error) throw error;
  return data as Estimate;
}

export async function convertEstimateToJob(estimateId: string): Promise<CrmJob> {
  const { data, error } = await supabase.rpc("convert_estimate_to_job", {
    p_estimate_id: estimateId,
  });

  if (error) throw error;
  return data as CrmJob;
}
