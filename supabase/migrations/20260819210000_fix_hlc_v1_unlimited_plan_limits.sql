-- HLC V1 uses 0 as the unlimited sentinel for lead and pipeline limits.
-- Preserve authorization semantics while preventing unlimited workspaces from being
-- interpreted as having zero capacity.

create or replace function public.can_insert_lead(p_workspace_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_limit int;
  v_count int;
begin
  if (select auth.role()) <> 'service_role'
     and not exists (
       select 1
       from public.workspace_members wm
       where wm.workspace_id = p_workspace_id
         and wm.user_id = (select auth.uid())
     ) then
    return false;
  end if;

  select wps.lead_limit
    into v_limit
  from public.workspace_plan_status wps
  where wps.workspace_id = p_workspace_id
    and wps.is_active = true
  limit 1;

  if v_limit is null then
    return false;
  end if;

  if v_limit = 0 then
    return true;
  end if;

  select count(*)
    into v_count
  from public.leads l
  where l.workspace_id = p_workspace_id
    and l.archived = false;

  return v_count < v_limit;
end;
$function$;

create or replace function public.can_create_pipeline(p_workspace_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $function$
declare
  v_limit int;
  v_count int;
begin
  if (select auth.role()) <> 'service_role'
     and not exists (
       select 1
       from public.workspace_members wm
       where wm.workspace_id = p_workspace_id
         and wm.user_id = (select auth.uid())
     ) then
    return false;
  end if;

  select wps.pipeline_limit
    into v_limit
  from public.workspace_plan_status wps
  where wps.workspace_id = p_workspace_id
    and wps.is_active = true
  limit 1;

  if v_limit is null then
    return false;
  end if;

  if v_limit = 0 then
    return true;
  end if;

  select count(*)
    into v_count
  from public.pipelines p
  where p.workspace_id = p_workspace_id;

  return v_count < v_limit;
end;
$function$;

create or replace view public.workspace_billing_state
with (security_invoker = true)
as
select
  wps.workspace_id,
  wps.plan_key,
  wps.lead_limit,
  wps.is_active,
  coalesce(wu.active_leads, 0::bigint) as active_leads,
  case
    when wps.lead_limit = 0 then 0::bigint
    else greatest(wps.lead_limit::bigint - coalesce(wu.active_leads, 0::bigint), 0::bigint)
  end as leads_remaining,
  case
    when wps.lead_limit = 0 then false
    else coalesce(wu.active_leads, 0::bigint) >= wps.lead_limit
  end as limit_reached
from public.workspace_plan_status wps
left join public.workspace_usage wu on wu.workspace_id = wps.workspace_id;

create or replace view public.workspace_pipeline_billing_state
with (security_invoker = true)
as
select
  wps.workspace_id,
  wps.plan_key,
  wps.pipeline_limit,
  wps.is_active,
  coalesce(up.pipeline_count, 0::bigint) as pipeline_count,
  case
    when wps.pipeline_limit = 0 then 0::bigint
    else greatest(wps.pipeline_limit::bigint - coalesce(up.pipeline_count, 0::bigint), 0::bigint)
  end as pipelines_remaining,
  case
    when wps.pipeline_limit = 0 then false
    else coalesce(up.pipeline_count, 0::bigint) >= wps.pipeline_limit
  end as limit_reached
from public.workspace_plan_status wps
left join public.pipeline_usage up on up.workspace_id = wps.workspace_id;

comment on function public.can_insert_lead(uuid) is
  'Returns whether a workspace may create a lead. A configured lead_limit of 0 means unlimited.';
comment on function public.can_create_pipeline(uuid) is
  'Returns whether a workspace may create a pipeline. A configured pipeline_limit of 0 means unlimited.';
