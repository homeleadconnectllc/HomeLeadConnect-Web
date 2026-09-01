import { supabase } from "./supabase";
import type { MaterialState } from "../data/resourceCatalog";

export type ResourceSave = { resource_id: string; created_at: string };
export type MaterialPlanItem = { id: string; name: string; category: string; quantity: number | null; state: MaterialState; supplier_id: string | null; job_id: string | null; notes: string | null; updated_at: string };

export async function loadResourceWorkspace() {
  const [saves, materials] = await Promise.all([
    supabase.from("resource_saves").select("resource_id,created_at").order("created_at", { ascending: false }),
    supabase.from("material_plan_items").select("id,name,category,quantity,state,supplier_id,job_id,notes,updated_at").order("updated_at", { ascending: false }),
  ]);
  const error = saves.error ?? materials.error;
  if (error) throw error;
  return { saves: (saves.data ?? []) as ResourceSave[], materials: (materials.data ?? []) as MaterialPlanItem[] };
}

export async function setResourceSaved(resourceId: string, saved: boolean) {
  const { error } = await supabase.rpc("resource_set_saved", { p_resource_id: resourceId, p_saved: saved });
  if (error) throw error;
}

export async function saveMaterialPlanItem(input: { id?: string | null; name: string; category: string; quantity?: number | null; state: MaterialState; supplierId?: string | null; jobId?: string | null; notes?: string | null }) {
  const { data, error } = await supabase.rpc("resource_save_material_item", { p_id: input.id ?? null, p_name: input.name, p_category: input.category, p_quantity: input.quantity ?? null, p_state: input.state, p_supplier_id: input.supplierId ?? null, p_job_id: input.jobId ?? null, p_notes: input.notes ?? null });
  if (error) throw error;
  return data as string;
}
