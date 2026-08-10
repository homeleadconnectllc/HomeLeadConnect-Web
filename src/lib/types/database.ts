export type EstimateStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "converted";

export type CrmJobStatus = "pending" | "active" | "completed" | "cancelled";
export type JobAssignmentStatus = "offered" | "accepted" | "rejected" | "cancelled";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export type Lead = {
  id: number;
  workspace_id: string;
  full_name: string | null;
  email: string | null;
  phone: string;
  status: string | null;
  created_at: string;
};

export type EstimateLineRow = {
  id: string;
  estimate_id: string;
  description: string;
  quantity: number;
  unit_cost: number;
  sort_order: number;
};

export type Estimate = {
  id: string;
  workspace_id: string;
  lead_id: number | null;
  status: EstimateStatus;
  markup_percent: number;
  subtotal: number;
  markup_amount: number;
  total: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  converted_to_job_at: string | null;
  estimate_lines?: EstimateLineRow[];
};

export type CrmJob = {
  id: string;
  workspace_id: string;
  lead_id: number | null;
  source_estimate_id: string;
  status: CrmJobStatus;
  name: string;
  contract_value: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Contractor = {
  id: number;
  workspace_id: string;
  company_name: string | null;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string | null;
  specialty: string | null;
  license_number: string | null;
  created_at: string;
  updated_at: string | null;
};

export type JobAssignment = {
  id: string;
  workspace_id: string;
  job_id: string;
  contractor_id: number;
  status: JobAssignmentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  contractor?: Pick<Contractor, "id" | "company_name" | "contact_name" | "specialty">;
};

export type JobAppointment = {
  id: number;
  workspace_id: string;
  job_id: string;
  lead_id: number | null;
  contractor_id: number;
  organization_id: string | null;
  appointment_date: string;
  status: AppointmentStatus;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  contractor?: Pick<Contractor, "id" | "company_name" | "contact_name">;
  job?: Pick<CrmJob, "id" | "name">;
};
