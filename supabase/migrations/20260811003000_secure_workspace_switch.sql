create or replace function public.switch_current_workspace(p_workspace_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.workspace_members wm
    where wm.user_id = auth.uid()
      and wm.workspace_id = p_workspace_id
  ) then
    raise exception 'You are not a member of that workspace.' using errcode = '42501';
  end if;

  update public.profiles
  set workspace_id = p_workspace_id
  where user_id = auth.uid();

  if not found then
    raise exception 'Your profile is unavailable.' using errcode = 'P0002';
  end if;

  return p_workspace_id;
end;
$$;

revoke all on function public.switch_current_workspace(uuid) from public, anon;
grant execute on function public.switch_current_workspace(uuid) to authenticated, service_role;
