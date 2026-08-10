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

export type CreateContractorInput = {
  companyName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  specialty?: string;
  city?: string;
  state?: string;
  zip?: string;
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

export async function createContractor(
  input: CreateContractorInput,
): Promise<Contractor> {
  const workspaceId = await getCurrentWorkspaceId();
  const companyName = input.companyName?.trim() || null;
  const contactName = input.contactName?.trim() || null;

  if (!companyName && !contactName) {
    throw new Error("Enter a company name or contact name.");
  }

  const { data, error } = await supabase
    .from("contractors")
    .insert({
      workspace_id: workspaceId,
      company_name: companyName,
      contact_name: contactName,
      phone: input.phone?.trim() || null,
      email: input.email?.trim() || null,
      specialty: input.specialty?.trim() || null,
      city: input.city?.trim() || null,
      state: input.state?.trim() || null,
      zip: input.zip?.trim() || null,
    })
    .select(contractorColumns)
    .single();

  if (error) throw error;
  return data as Contractor;
}
