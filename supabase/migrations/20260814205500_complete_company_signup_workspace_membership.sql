create or replace function public.handle_new_user_onboarding()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_company_name text;
begin
  if exists (select 1 from public.profiles where user_id = new.id) then
    return new;
  end if;

  v_company_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'company_name', '')), '');

  insert into public.workspaces (name, created_by)
  values (coalesce(v_company_name, 'My Workspace'), new.id)
  returning id into v_workspace_id;

  insert into public.profiles (user_id, workspace_id, full_name, avatar_url, role)
  values (
    new.id,
    v_workspace_id,
    nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(btrim(coalesce(new.raw_user_meta_data->>'avatar_url', '')), ''),
    'owner'
  );

  insert into public.workspace_members (workspace_id, user_id)
  values (v_workspace_id, new.id)
  on conflict do nothing;

  return new;
end;
$function$;
