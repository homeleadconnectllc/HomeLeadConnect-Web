create or replace function public.claim_next_lead_balanced(workspace_uuid uuid, agent_uuid uuid)
returns setof public.leads
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  target_lead_id uuid;
  is_agent_blocked boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_uuid
      and wm.user_id = auth.uid()
  ) then
    raise exception 'Not a workspace member' using errcode='42501';
  end if;

  if agent_uuid is null or not exists (
    select 1
    from public.workspace_members target
    where target.workspace_id = workspace_uuid
      and target.user_id = agent_uuid
  ) then
    raise exception 'Target agent is not a workspace member.' using errcode='42501';
  end if;

  select exists (
    select 1
    from public.leads
    where workspace_id = workspace_uuid
      and assigned_to = agent_uuid
      and status = 'claimed'
  ) into is_agent_blocked;

  if is_agent_blocked then
    raise exception 'Agent session blocked. Please complete existing wrap workflows before claiming.';
  end if;

  select id
    into target_lead_id
  from public.leads
  where workspace_id = workspace_uuid
    and status = 'new'
    and assigned_to is null
  order by priority_weight desc, created_at asc
  limit 1
  for update skip locked;

  if target_lead_id is not null then
    return query
    update public.leads
    set status = 'claimed',
        assigned_to = agent_uuid,
        claimed_at = now(),
        updated_at = now()
    where id = target_lead_id
      and workspace_id = workspace_uuid
    returning *;
  end if;
end;
$function$;

revoke all on function public.route_lead(uuid,bigint) from public, anon, authenticated;
grant execute on function public.route_lead(uuid,bigint) to service_role;

revoke all on function public.claim_next_lead_balanced(uuid,uuid) from public, anon;
grant execute on function public.claim_next_lead_balanced(uuid,uuid) to authenticated, service_role;
