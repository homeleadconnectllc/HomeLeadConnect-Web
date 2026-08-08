import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";
import type {
  Lead,
  LeadFilters,
  LeadSort,
  WorkspaceMembership,
} from "../types/lead";

export const PAGE_SIZE = 25;

const LEAD_FIELDS = [
  "id",
  "lead_code",
  "full_name",
  "phone",
  "email",
  "status",
  "created_at",
  "notes",
  "workspace_id",
  "assigned_to",
  "source",
  "last_contacted_at",
  "next_follow_up_at",
  "priority",
  "stage_updated_at",
  "archived",
  "updated_at",
  "appointment_at",
  "appointment_status",
  "assigned_until",
  "priority_score",
  "pipeline_stage_id",
  "id_uuid",
  "organization_id",
  "first_name",
  "last_name",
  "score",
  "lead_number",
  "request_id",
  "pipeline_id",
  "advance_request_id",
  "stage",
  "sla_status",
  "claimed_at",
  "sla_expires_at",
  "conversion_score",
  "intent_tags",
  "attempt_count",
  "next_eligible_dial_at",
  "priority_weight",
].join(",");

const sanitizeSearch = (value: string) =>
  value
    .trim()
    .replace(/[,\.\(\)]/g, " ")
    .replace(/[*"'\\]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);

const emptyFilters: LeadFilters = {
  archived: false,
  stage: "",
  priority: "",
  source: "",
  status: "",
};

export function humanize(value: string | null | undefined) {
  if (!value) return "—";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeStage(value: string | null | undefined) {
  if (!value) return "—";
  if (value.toLowerCase() === "new") return "New";
  return humanize(value);
}

export function getLeadName(lead: Lead) {
  if (lead.full_name?.trim()) return lead.full_name.trim();

  const name = [lead.first_name, lead.last_name]
    .filter((part) => part?.trim())
    .join(" ")
    .trim();

  return name || "Unnamed lead";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<LeadFilters>(emptyFilters);
  const [sort, setSort] = useState<LeadSort>("created_at");

  const [stageOptions, setStageOptions] = useState<string[]>([]);
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [workspaceMemberships, setWorkspaceMemberships] = useState<
    WorkspaceMembership[]
  >([]);

  const [activeCount, setActiveCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [highPriorityCount, setHighPriorityCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);

  const sanitizedSearch = useMemo(
    () => sanitizeSearch(search),
    [search],
  );

  const loadSummary = useCallback(async () => {
    const activeQuery = supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("archived", false);

    const newQuery = supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("archived", false)
      .in("stage", ["NEW", "new"]);

    const highQuery = supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("archived", false)
      .eq("priority", "high");

    const appointmentQuery = supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("archived", false)
      .not("appointment_at", "is", null);

    const [active, fresh, high, appointments] = await Promise.all([
      activeQuery,
      newQuery,
      highQuery,
      appointmentQuery,
    ]);

    const firstError =
      active.error ||
      fresh.error ||
      high.error ||
      appointments.error;

    if (firstError) {
      setError(firstError.message);
      return;
    }

    setActiveCount(active.count ?? 0);
    setNewCount(fresh.count ?? 0);
    setHighPriorityCount(high.count ?? 0);
    setAppointmentCount(appointments.count ?? 0);
  }, []);

  const loadOptions = useCallback(async () => {
    const [{ data: stages, error: stageError }, { data: sources, error: sourceError }] =
      await Promise.all([
        supabase
          .from("leads")
          .select("stage")
          .eq("archived", false)
          .not("stage", "is", null)
          .range(0, 199),
        supabase
          .from("leads")
          .select("source")
          .eq("archived", false)
          .not("source", "is", null)
          .range(0, 199),
      ]);

    if (stageError || sourceError) {
      setError((stageError || sourceError)?.message ?? "Unable to load filters.");
      return;
    }

    setStageOptions(
      Array.from(
        new Set(
          (stages ?? [])
            .map((row) => row.stage as string)
            .filter(Boolean),
        ),
      ),
    );

    setSourceOptions(
      Array.from(
        new Set(
          (sources ?? [])
            .map((row) => row.source as string)
            .filter(Boolean),
        ),
      ),
    );
  }, []);

  const loadWorkspaceMemberships = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc(
      "get_user_workspace_ids",
    );

    if (rpcError) {
      setWorkspaceMemberships([]);
      return;
    }

    setWorkspaceMemberships(
      ((data ?? []) as string[]).map((workspace_id) => ({
        workspace_id,
      })),
    );
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("leads")
      .select(LEAD_FIELDS)
      .eq("archived", filters.archived);

    if (sanitizedSearch) {
      const pattern = `%${sanitizedSearch}%`;
      query = query.or(
        [
          `full_name.ilike.${pattern}`,
          `first_name.ilike.${pattern}`,
          `last_name.ilike.${pattern}`,
          `lead_code.ilike.${pattern}`,
        ].join(","),
      );
    }

    if (filters.stage) {
      query = query.eq("stage", filters.stage);
    }

    if (filters.priority) {
      query = query.eq("priority", filters.priority);
    }

    if (filters.source) {
      query = query.eq("source", filters.source);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (sort === "priority") {
      query = query
        .order("priority_weight", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
    } else {
      query = query.order(sort, {
        ascending: false,
        nullsFirst: false,
      });
    }

    query = query.range(from, to);

    const { data, error: queryError } = await query;

    if (queryError) {
      setError(queryError.message);
      setLeads([]);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as unknown as Lead[];
  setLeads(rows);
    setLoading(false);
  }, [
    filters,
    page,
    sanitizedSearch,
    sort,
  ]);

  useEffect(() => {
    void loadSummary();
    void loadOptions();
    void loadWorkspaceMemberships();
  }, [loadSummary, loadOptions, loadWorkspaceMemberships]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLeads();
    }, 275);

    return () => window.clearTimeout(timer);
  }, [loadLeads]);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadLeads(),
      loadSummary(),
      loadOptions(),
    ]);
  }, [loadLeads, loadSummary, loadOptions]);

  const updateLead = useCallback(
    async (
      leadId: number,
      updates: Partial<
        Pick<Lead, "status" | "stage" | "priority" | "appointment_at">
      >,
    ) => {
      setSaving(true);
      setError("");

      const { error: updateError } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return false;
      }

      await refresh();
      setSaving(false);
      return true;
    },
    [refresh],
  );

  const archiveLead = useCallback(
    async (leadId: number) => {
      setSaving(true);
      setError("");

      const { error: archiveError } = await supabase
        .from("leads")
        .update({ archived: true })
        .eq("id", leadId);

      if (archiveError) {
        setError(archiveError.message);
        setSaving(false);
        return false;
      }

      await refresh();
      setSaving(false);
      return true;
    },
    [refresh],
  );

  const addLead = useCallback(
    async (
      payload: Omit<
        Lead,
        | "id"
        | "created_at"
        | "updated_at"
        | "stage_updated_at"
        | "id_uuid"
        | "lead_number"
        | "priority_score"
        | "score"
        | "attempt_count"
        | "next_eligible_dial_at"
        | "priority_weight"
        | "conversion_score"
        | "sla_status"
        | "assigned_to"
        | "last_contacted_at"
        | "next_follow_up_at"
        | "assigned_until"
        | "pipeline_stage_id"
        | "organization_id"
        | "request_id"
        | "pipeline_id"
        | "advance_request_id"
        | "claimed_at"
        | "sla_expires_at"
        | "intent_tags"
        | "appointment_status"
      > & {
        workspace_id: string;
      },
    ) => {
      setSaving(true);
      setError("");

      const { error: insertError } = await supabase
        .from("leads")
        .insert(payload);

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return false;
      }

      setPage(0);
      await Promise.all([loadLeads(), loadSummary()]);
      setSaving(false);
      return true;
    },
    [loadLeads, loadSummary],
  );

  return {
    leads,
    loading,
    saving,
    error,
    search,
    setSearch: (value: string) => {
      setSearch(value);
      setPage(0);
    },
    page,
    setPage,
    filters,
    setFilters: (next: LeadFilters) => {
      setFilters(next);
      setPage(0);
    },
    sort,
    setSort: (next: LeadSort) => {
      setSort(next);
      setPage(0);
    },
    stageOptions,
    sourceOptions,
    workspaceMemberships,
    activeCount,
    newCount,
    highPriorityCount,
    appointmentCount,
    refresh,
    updateLead,
    archiveLead,
    addLead,
  };
}
