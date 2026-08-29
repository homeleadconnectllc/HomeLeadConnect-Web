import { supabase } from "./client";

export type OperationsExceptionDisposition = {
  id: string;
  source_type: string;
  source_id: string;
  disposition: "resolved" | "escalated" | "deferred";
  note: string | null;
  affected_route: string | null;
  created_by: string;
  created_at: string;
};

export async function listOperationsExceptionDispositions(limit = 100): Promise<OperationsExceptionDisposition[]> {
  const { data, error } = await supabase.rpc("list_operations_exception_dispositions", { p_limit: limit });
  if (error) throw error;
  return (data ?? []) as OperationsExceptionDisposition[];
}

export async function recordOperationsExceptionDisposition(input: {
  sourceType: string;
  sourceId: string;
  disposition: OperationsExceptionDisposition["disposition"];
  note?: string;
  affectedRoute?: string;
}) {
  const { data, error } = await supabase.rpc("record_operations_exception_disposition", {
    p_source_type: input.sourceType,
    p_source_id: input.sourceId,
    p_disposition: input.disposition,
    p_note: input.note ?? "",
    p_affected_route: input.affectedRoute ?? "",
  });
  if (error) throw error;
  return data as string;
}
