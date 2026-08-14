import { getCurrentWorkspaceId, supabase } from "./client";

export type PropertyAssetCategory = "hvac" | "water_heater" | "roof" | "plumbing" | "electrical" | "appliance" | "generator" | "solar" | "irrigation" | "lawn_equipment" | "pool_spa" | "security" | "other";
export type PropertyAssetCondition = "unknown" | "good" | "monitor" | "service_due" | "repair_needed" | "replace_soon" | "retired";
export type PropertyAssetServiceType = "inspection" | "maintenance" | "repair" | "replacement" | "installation" | "warranty" | "note";

export type PropertyAsset = {
  id: string;
  property_id: string;
  asset_category: PropertyAssetCategory;
  label: string;
  manufacturer: string | null;
  model_number: string | null;
  serial_number: string | null;
  installed_on: string | null;
  warranty_expires_on: string | null;
  last_serviced_on: string | null;
  next_service_on: string | null;
  condition: PropertyAssetCondition;
  notes: string | null;
  created_at: string;
};

export type PropertyAssetServiceEvent = {
  id: string;
  asset_id: string;
  event_type: PropertyAssetServiceType;
  occurred_on: string;
  provider_name: string | null;
  cost: number | null;
  notes: string | null;
  created_at: string;
};

async function context() {
  const workspaceId = await getCurrentWorkspaceId();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!user) throw new Error("Authentication is required.");
  return { workspaceId, userId: user.id };
}

export async function listPropertyAssets(propertyId?: string) {
  const { workspaceId, userId } = await context();
  let query = supabase.from("property_assets")
    .select("id,property_id,asset_category,label,manufacturer,model_number,serial_number,installed_on,warranty_expires_on,last_serviced_on,next_service_on,condition,notes,created_at")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (propertyId) query = query.eq("property_id", propertyId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PropertyAsset[];
}

export async function createPropertyAsset(input: {
  propertyId: string;
  category: PropertyAssetCategory;
  label: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  installedOn?: string;
  warrantyExpiresOn?: string;
  lastServicedOn?: string;
  nextServiceOn?: string;
  condition?: PropertyAssetCondition;
  notes?: string;
}) {
  const { workspaceId, userId } = await context();
  const { data, error } = await supabase.from("property_assets").insert({
    property_id: input.propertyId,
    workspace_id: workspaceId,
    user_id: userId,
    asset_category: input.category,
    label: input.label.trim(),
    manufacturer: input.manufacturer?.trim() || null,
    model_number: input.modelNumber?.trim() || null,
    serial_number: input.serialNumber?.trim() || null,
    installed_on: input.installedOn || null,
    warranty_expires_on: input.warrantyExpiresOn || null,
    last_serviced_on: input.lastServicedOn || null,
    next_service_on: input.nextServiceOn || null,
    condition: input.condition ?? "unknown",
    notes: input.notes?.trim() || null,
  }).select("id,property_id,asset_category,label,manufacturer,model_number,serial_number,installed_on,warranty_expires_on,last_serviced_on,next_service_on,condition,notes,created_at").single();
  if (error) throw error;
  return data as PropertyAsset;
}

export async function listPropertyAssetServiceEvents(assetId: string) {
  const { workspaceId, userId } = await context();
  const { data, error } = await supabase.from("property_asset_service_events")
    .select("id,asset_id,event_type,occurred_on,provider_name,cost,notes,created_at")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("asset_id", assetId)
    .order("occurred_on", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({ ...row, cost: row.cost == null ? null : Number(row.cost) })) as PropertyAssetServiceEvent[];
}

export async function createPropertyAssetServiceEvent(input: {
  assetId: string;
  eventType: PropertyAssetServiceType;
  occurredOn: string;
  providerName?: string;
  cost?: number | null;
  notes?: string;
}) {
  const { workspaceId, userId } = await context();
  const { data, error } = await supabase.from("property_asset_service_events").insert({
    asset_id: input.assetId,
    workspace_id: workspaceId,
    user_id: userId,
    event_type: input.eventType,
    occurred_on: input.occurredOn,
    provider_name: input.providerName?.trim() || null,
    cost: input.cost ?? null,
    notes: input.notes?.trim() || null,
  }).select("id,asset_id,event_type,occurred_on,provider_name,cost,notes,created_at").single();
  if (error) throw error;
  return { ...data, cost: data.cost == null ? null : Number(data.cost) } as PropertyAssetServiceEvent;
}
