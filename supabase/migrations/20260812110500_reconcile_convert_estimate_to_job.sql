-- Reconcile the canonical estimate -> CRM job conversion contract already present in production.
-- This function preserves tenant membership checks, accepted-only conversion, and one job per estimate.

create or replace function public.convert_estimate_to_job(p_estimate_id uuid)
returns public.crm_jobs
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_estimate public.estimates%rowtype;
  v_job public.crm_jobs%rowtype;
  v_lead_name text;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_estimate
  from public.estimates e
  where e.id = p_estimate_id
  for update;

  if not found then
    raise exception 'Estimate not found';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_estimate.workspace_id
      and wm.user_id = v_user_id
  ) then
    raise exception 'Estimate not found';
  end if;

  if v_estimate.status <> 'accepted' then
    raise exception 'Only accepted estimates can be converted';
  end if;

  if exists (
    select 1 from public.crm_jobs j
    where j.source_estimate_id = v_estimate.id
  ) then
    raise exception 'Estimate has already been converted';
  end if;

  if v_estimate.lead_id is not null then
    select coalesce(
      nullif(btrim(l.full_name), ''),
      nullif(btrim(concat_ws(' ', l.first_name, l.last_name)), '')
    )
    into v_lead_name
    from public.leads l
    where l.id = v_estimate.lead_id
      and l.workspace_id = v_estimate.workspace_id;
  end if;

  insert into public.crm_jobs (
    workspace_id,
    lead_id,
    source_estimate_id,
    status,
    name,
    contract_value,
    created_by
  ) values (
    v_estimate.workspace_id,
    v_estimate.lead_id,
    v_estimate.id,
    'pending',
    case when v_lead_name is not null then v_lead_name || ' Job' else 'HLC Job' end,
    v_estimate.total,
    v_user_id
  )
  returning * into v_job;

  update public.estimates
  set status = 'converted',
      converted_to_job_at = now()
  where id = v_estimate.id;

  return v_job;
end;
$$;

revoke all on function public.convert_estimate_to_job(uuid) from public, anon;
grant execute on function public.convert_estimate_to_job(uuid) to authenticated, service_role;
