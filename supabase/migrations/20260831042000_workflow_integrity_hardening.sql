-- Harden canonical workflow mutations discovered during the production-readiness audit.
-- 1) LeadScope estimate + line saves become one transaction.
-- 2) Canonical job lifecycle transitions become manager/owner-authorized state-machine mutations.

create or replace function public.save_estimate_with_lines(
  p_estimate_id uuid,
  p_lead_id bigint,
  p_status text,
  p_markup_percent numeric,
  p_subtotal numeric,
  p_markup_amount numeric,
  p_total numeric,
  p_lines jsonb
)
returns public.estimates
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
  v_estimate public.estimates%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  select p.workspace_id
    into v_workspace_id
  from public.profiles p
  where p.user_id = v_user_id
    and p.role in ('owner', 'manager', 'technician')
    and exists (
      select 1
      from public.workspace_members wm
      where wm.user_id = v_user_id
        and wm.workspace_id = p.workspace_id
    );

  if v_workspace_id is null then
    raise exception 'Active workspace membership is required.' using errcode = '42501';
  end if;

  if p_status not in ('draft', 'sent', 'accepted', 'rejected') then
    raise exception 'Unsupported estimate status.' using errcode = '22023';
  end if;

  if coalesce(p_markup_percent, -1) < 0
     or coalesce(p_subtotal, -1) < 0
     or coalesce(p_markup_amount, -1) < 0
     or coalesce(p_total, -1) < 0 then
    raise exception 'Estimate totals cannot be negative.' using errcode = '22023';
  end if;

  if p_lines is null or jsonb_typeof(p_lines) <> 'array' then
    raise exception 'Estimate lines must be a JSON array.' using errcode = '22023';
  end if;

  if p_lead_id is not null and not exists (
    select 1
    from public.leads l
    where l.id = p_lead_id
      and l.workspace_id = v_workspace_id
  ) then
    raise exception 'Lead is not available in the active workspace.' using errcode = '42501';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_lines) line
    where coalesce((line ->> 'quantity')::numeric, -1) < 0
       or coalesce((line ->> 'unitCost')::numeric, -1) < 0
  ) then
    raise exception 'Estimate line values cannot be negative.' using errcode = '22023';
  end if;

  if p_estimate_id is null then
    insert into public.estimates (
      workspace_id,
      lead_id,
      status,
      markup_percent,
      subtotal,
      markup_amount,
      total,
      created_by
    ) values (
      v_workspace_id,
      p_lead_id,
      p_status,
      p_markup_percent,
      p_subtotal,
      p_markup_amount,
      p_total,
      v_user_id
    )
    returning * into v_estimate;
  else
    select *
      into v_estimate
    from public.estimates e
    where e.id = p_estimate_id
      and e.workspace_id = v_workspace_id
    for update;

    if not found then
      raise exception 'Estimate not found.' using errcode = 'P0002';
    end if;

    if v_estimate.status = 'converted' then
      raise exception 'Converted estimates are immutable.' using errcode = '22023';
    end if;

    if v_estimate.created_by <> v_user_id then
      raise exception 'Only the estimate creator can edit this LeadScope record.' using errcode = '42501';
    end if;

    update public.estimates
    set lead_id = p_lead_id,
        status = p_status,
        markup_percent = p_markup_percent,
        subtotal = p_subtotal,
        markup_amount = p_markup_amount,
        total = p_total,
        updated_at = now()
    where id = p_estimate_id
    returning * into v_estimate;

    delete from public.estimate_lines
    where estimate_id = p_estimate_id;
  end if;

  insert into public.estimate_lines (
    estimate_id,
    description,
    quantity,
    unit_cost,
    sort_order
  )
  select
    v_estimate.id,
    coalesce(nullif(btrim(line ->> 'description'), ''), 'Untitled item'),
    coalesce((line ->> 'quantity')::numeric, 0),
    coalesce((line ->> 'unitCost')::numeric, 0),
    (ordinality - 1)::integer
  from jsonb_array_elements(p_lines) with ordinality as lines(line, ordinality);

  select * into v_estimate
  from public.estimates
  where id = v_estimate.id;

  return v_estimate;
end;
$function$;

create or replace function public.set_estimate_status(
  p_estimate_id uuid,
  p_status text
)
returns public.estimates
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_estimate public.estimates%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if p_status not in ('draft', 'sent', 'accepted', 'rejected') then
    raise exception 'Unsupported estimate status.' using errcode = '22023';
  end if;

  select * into v_estimate
  from public.estimates e
  where e.id = p_estimate_id
    and e.created_by = v_user_id
    and exists (
      select 1
      from public.profiles p
      join public.workspace_members wm
        on wm.workspace_id = p.workspace_id
       and wm.user_id = p.user_id
      where p.user_id = v_user_id
        and p.workspace_id = e.workspace_id
        and p.role in ('owner', 'manager', 'technician')
    )
  for update;

  if not found then
    raise exception 'Estimate not found.' using errcode = 'P0002';
  end if;

  if v_estimate.status = 'converted' then
    raise exception 'Converted estimates are immutable.' using errcode = '22023';
  end if;

  update public.estimates
  set status = p_status,
      updated_at = now()
  where id = p_estimate_id
  returning * into v_estimate;

  return v_estimate;
end;
$function$;

create or replace function public.transition_crm_job(
  p_job_id uuid,
  p_status text
)
returns public.crm_jobs
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.crm_jobs%rowtype;
  v_role text;
begin
  if v_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if p_status not in ('active', 'completed', 'cancelled') then
    raise exception 'Unsupported job transition.' using errcode = '22023';
  end if;

  select * into v_job
  from public.crm_jobs j
  where j.id = p_job_id
  for update;

  if not found then
    raise exception 'Job not found.' using errcode = 'P0002';
  end if;

  select p.role
    into v_role
  from public.profiles p
  where p.user_id = v_user_id
    and p.workspace_id = v_job.workspace_id
    and exists (
      select 1
      from public.workspace_members wm
      where wm.user_id = v_user_id
        and wm.workspace_id = v_job.workspace_id
    );

  if v_role not in ('owner', 'manager') then
    raise exception 'Manager or owner authorization is required to change the canonical job lifecycle.' using errcode = '42501';
  end if;

  if v_job.status = 'pending' and p_status = 'active' then
    if not exists (
      select 1
      from public.job_assignments ja
      join public.appointments a
        on a.workspace_id = ja.workspace_id
       and a.job_id = ja.job_id
       and a.contractor_id = ja.contractor_id
      where ja.workspace_id = v_job.workspace_id
        and ja.job_id = v_job.id
        and ja.status = 'accepted'
        and a.status in ('scheduled', 'completed')
    ) then
      raise exception 'An accepted provider assignment with scheduled work is required before activating a job.' using errcode = '22023';
    end if;
  elsif v_job.status = 'active' and p_status = 'completed' then
    if not exists (
      select 1
      from public.job_assignments ja
      join public.appointments a
        on a.workspace_id = ja.workspace_id
       and a.job_id = ja.job_id
       and a.contractor_id = ja.contractor_id
      where ja.workspace_id = v_job.workspace_id
        and ja.job_id = v_job.id
        and ja.status = 'accepted'
        and a.status = 'completed'
    ) then
      raise exception 'A completed appointment for the accepted provider is required before completing a job.' using errcode = '22023';
    end if;
  elsif v_job.status in ('pending', 'active') and p_status = 'cancelled' then
    null;
  else
    raise exception 'Invalid job lifecycle transition from % to %.', v_job.status, p_status using errcode = '22023';
  end if;

  update public.crm_jobs
  set status = p_status,
      updated_at = now()
  where id = v_job.id
  returning * into v_job;

  insert into public.activity_log (
    workspace_id,
    entity_type,
    entity_id,
    event_type,
    payload
  ) values (
    v_job.workspace_id,
    'job',
    v_job.id,
    'job.lifecycle.' || p_status,
    jsonb_build_object(
      'actor_user_id', v_user_id,
      'actor_role', v_role,
      'new_status', p_status
    )
  );

  return v_job;
end;
$function$;

-- Force browser clients through the transactional/authorized mutation functions.
drop policy if exists crm_jobs_update_workspace_members on public.crm_jobs;
drop policy if exists estimates_insert_workspace_members on public.estimates;
drop policy if exists estimates_update_workspace_members on public.estimates;
drop policy if exists estimates_delete_workspace_members on public.estimates;
drop policy if exists estimate_lines_insert_workspace_members on public.estimate_lines;
drop policy if exists estimate_lines_update_workspace_members on public.estimate_lines;
drop policy if exists estimate_lines_delete_workspace_members on public.estimate_lines;

revoke all on function public.save_estimate_with_lines(uuid,bigint,text,numeric,numeric,numeric,numeric,jsonb) from public, anon;
revoke all on function public.set_estimate_status(uuid,text) from public, anon;
revoke all on function public.transition_crm_job(uuid,text) from public, anon;
grant execute on function public.save_estimate_with_lines(uuid,bigint,text,numeric,numeric,numeric,numeric,jsonb) to authenticated;
grant execute on function public.set_estimate_status(uuid,text) to authenticated;
grant execute on function public.transition_crm_job(uuid,text) to authenticated;
