-- Restore HomeLead Connect's single-writer lead-ingestion boundary.
-- Client applications may read/update leads according to RLS, but new lead rows
-- must be created through controlled server/RPC ingestion paths.

drop policy if exists leads_insert_workspace_members on public.leads;
drop policy if exists leads_insert_plan_limit_active_only on public.leads;

revoke insert on table public.leads from anon;
revoke insert on table public.leads from authenticated;

-- Keep controlled server-side ingestion available. The canonical causal writer
-- remains service-role only; public service intake continues through its hardened
-- public RPC and does not require direct table INSERT privileges.
revoke all on function causal.ingest_lead(
  uuid,
  text,
  text,
  text,
  text,
  text,
  uuid,
  text,
  timestamptz,
  timestamptz,
  timestamptz,
  text,
  timestamptz,
  text,
  numeric,
  uuid,
  uuid,
  uuid,
  text,
  text,
  integer,
  boolean,
  text,
  jsonb
) from public, anon, authenticated;

grant execute on function causal.ingest_lead(
  uuid,
  text,
  text,
  text,
  text,
  text,
  uuid,
  text,
  timestamptz,
  timestamptz,
  timestamptz,
  text,
  timestamptz,
  text,
  numeric,
  uuid,
  uuid,
  uuid,
  text,
  text,
  integer,
  boolean,
  text,
  jsonb
) to service_role;
