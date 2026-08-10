import { getCurrentWorkspaceId, supabase } from "./client";
import type { Contractor } from "../lib/types/database";

const contractorColumns =
  "id,workspace_id,company_name,contact_name,phone,email,website,address,city,state,zip,status,specialty,license_number,created_at,updated_at";

export type ContractorFilters = {
  specialty?: string;
  city?: string;
  state?: string;
  status?: string;
};

export async function listContractors(
  filters: ContractorFilters = {},
): Promise<Contractor[]> {
  const workspaceId = await getCurrentWorkspaceId();
  let query = supabase
    .from("contractors")
    .select(contractorColumns)
    .eq("workspace_id", workspaceId)
    .order("company_name");

  if (filters.specialty?.trim()) {
    query = query.ilike("specialty", filters.specialty.trim());
  }
  if (filters.city?.trim()) {
    query = query.ilike("city", filters.city.trim());
  }
  if (filters.state?.trim()) {
    query = query.ilike("state", filters.state.trim());
  }
  if (filters.status?.trim()) {
    query = query.ilike("status", filters.status.trim());
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Contractor[];
}

export async function getContractor(id: number): Promise<Contractor> {
  const workspaceId = await getCurrentWorkspaceId();
  const { data, error } = await supabase
    .from("contractors")
    .select(contractorColumns)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Contractor;
}
