-- Pending launch repair: resolve stale selected-workspace billing server-side without widening table RLS.
-- This file intentionally lives in supabase/pending until production promotion is explicitly authorized.

create or replace function public.resolve_billing_workspace_access()
returns table(
  workspace_id uuid,
  plan_key text,
  status text,
  is_active boolean,
  trial_end timestamptz,
  current_period_end timestamptz,
  grace_period_end timestamptz,
  cancel_at_period_end boolean,
  recovered boolean
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_selected_workspace uuid;
  v_selected_role text;
  v_candidate_workspace uuid;
  v_candidate_role text;
  v_candidate_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  select p.workspace_id
    into v_selected_workspace
  from public.profiles p
  where p.user_id = v_user_id
  limit 1;

  if v_selected_workspace is null then
    raise exception 'Your profile does not have a selected workspace.' using errcode='P0002';
  end if;

  select lower(coalesce(wm.role, ''))
    into v_selected_role
  from public.workspace_members wm
  where wm.user_id = v_user_id
    and wm.workspace_id = v_selected_workspace
  limit 1;

  if v_selected_role is null then
    raise exception 'Selected workspace membership is unavailable.' using errcode='42501';
  end if;

  -- Keep a currently verified selection exactly as-is.
  if exists (
    select 1
    from public.workspace_plan_status wps
    where wps.workspace_id = v_selected_workspace
      and wps.is_active = true
      and (
        lower(coalesce(wps.status, '')) in ('active', 'trialing')
        or (
          lower(coalesce(wps.status, '')) = 'past_due'
          and wps.grace_period_end is not null
          and wps.grace_period_end > now()
        )
      )
  ) then
    return query
    select wps.workspace_id, wps.plan_key, wps.status, wps.is_active,
           wps.trial_end, wps.current_period_end, wps.grace_period_end,
           wps.cancel_at_period_end, false
    from public.workspace_plan_status wps
    where wps.workspace_id = v_selected_workspace
    limit 1;
    return;
  end if;

  -- Count only other workspaces the signed-in user is actually a member of and that
  -- have webhook-confirmed trial, paid, or live grace access.
  select count(*), min(wm.workspace_id), min(lower(coalesce(wm.role, '')))
    into v_candidate_count, v_candidate_workspace, v_candidate_role
  from public.workspace_members wm
  join public.workspace_plan_status wps on wps.workspace_id = wm.workspace_id
  where wm.user_id = v_user_id
    and wm.workspace_id <> v_selected_workspace
    and wps.is_active = true
    and (
      lower(coalesce(wps.status, '')) in ('active', 'trialing')
      or (
        lower(coalesce(wps.status, '')) = 'past_due'
        and wps.grace_period_end is not null
        and wps.grace_period_end > now()
      )
    );

  if v_candidate_count = 1 and v_candidate_workspace is not null then
    update public.profiles
       set workspace_id = v_candidate_workspace,
           role = v_candidate_role
     where user_id = v_user_id;

    if not found then
      raise exception 'Your profile is unavailable.' using errcode='P0002';
    end if;

    return query
    select wps.workspace_id, wps.plan_key, wps.status, wps.is_active,
           wps.trial_end, wps.current_period_end, wps.grace_period_end,
           wps.cancel_at_period_end, true
    from public.workspace_plan_status wps
    where wps.workspace_id = v_candidate_workspace
    limit 1;
    return;
  end if;

  -- No deterministic recovery exists. Return only the selected workspace billing row,
  -- if present. Returning zero rows is the truthful no-billing-record state.
  return query
  select wps.workspace_id, wps.plan_key, wps.status, wps.is_active,
         wps.trial_end, wps.current_period_end, wps.grace_period_end,
         wps.cancel_at_period_end, false
  from public.workspace_plan_status wps
  where wps.workspace_id = v_selected_workspace
  limit 1;
end;
$function$;

revoke all on function public.resolve_billing_workspace_access() from public, anon;
grant execute on function public.resolve_billing_workspace_access() to authenticated;
