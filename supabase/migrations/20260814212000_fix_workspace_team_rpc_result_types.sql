create or replace function public.get_workspace_team()
returns table(user_id uuid,email text,full_name text,member_role text,joined_at timestamptz)
language plpgsql
security definer
set search_path to ''
as $function$
declare v_workspace_id uuid; v_actor_role text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  select wm.role into v_actor_role from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid();
  if v_actor_role not in ('owner','manager') then raise exception 'Team administration requires an owner or manager role.' using errcode='42501'; end if;
  return query
    select wm.user_id,u.email::text,p.full_name::text,wm.role::text,wm.created_at
    from public.workspace_members wm
    left join auth.users u on u.id=wm.user_id
    left join public.profiles p on p.user_id=wm.user_id
    where wm.workspace_id=v_workspace_id
    order by case wm.role when 'owner' then 1 when 'manager' then 2 else 3 end,wm.created_at;
end;
$function$;
