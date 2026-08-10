export type EstimateStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "converted";

export type CrmJobStatus = "pending" | "active" | "completed" | "cancelled";

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
