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
  const workspaceId = await getCurrentWorkspaceId();
  const estimateValues = {
    workspace_id: workspaceId,
    lead_id: input.leadId,
    status: input.status,
    markup_percent: input.markupPercent,
    subtotal: input.subtotal,
    markup_amount: input.markupAmount,
    total: input.total,
  };

  const query = input.id
    ? supabase
        .from("estimates")
        .update(estimateValues)
        .eq("workspace_id", workspaceId)
        .eq("id", input.id)
    : supabase.from("estimates").insert(estimateValues);

  const { data, error } = await query.select(estimateColumns).single();
  if (error) throw error;

  const estimate = data as Estimate;

  if (input.id) {
    const { error: deleteError } = await supabase
      .from("estimate_lines")
      .delete()
      .eq("estimate_id", estimate.id);
    if (deleteError) throw deleteError;
  }

  const { error: lineError } = await supabase.from("estimate_lines").insert(
    input.lines.map((line, sortOrder) => ({
      estimate_id: estimate.id,
      description: line.description.trim() || "Untitled item",
      quantity: line.quantity,
      unit_cost: line.unitCost,
      sort_order: sortOrder,
    })),
  );

  if (lineError) throw lineError;
  return getEstimate(estimate.id);
}

export async function updateEstimateStatus(
  id: string,
  status: Exclude<EstimateStatus, "converted">,
): Promise<Estimate> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("estimates")
    .update({ status })
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .neq("status", "converted")
    .select(estimateColumns)
    .single();

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
