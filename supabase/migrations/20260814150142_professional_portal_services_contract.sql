create or replace function public.get_linked_provider_setup(p_contractor_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := (select auth.uid());
  v_workspace uuid;
  v_result jsonb;
begin
  if v_user is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  select cpl.workspace_id into v_workspace
  from public.contractor_portal_links cpl
  where cpl.user_id=v_user and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null
  limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;

  select jsonb_build_object(
    'services', coalesce((select jsonb_agg(to_jsonb(s) order by s.created_at) from public.provider_services s where s.workspace_id=v_workspace and s.contractor_id=p_contractor_id),'[]'::jsonb),
    'service_areas', coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at) from public.provider_service_areas a where a.workspace_id=v_workspace and a.contractor_id=p_contractor_id),'[]'::jsonb),
    'availability', (select to_jsonb(v) from public.provider_availability v where v.workspace_id=v_workspace and v.contractor_id=p_contractor_id limit 1)
  ) into v_result;
  return v_result;
end;
$$;

create or replace function public.add_linked_provider_service(p_contractor_id bigint, p_service_name text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := (select auth.uid()); v_workspace uuid; v_id uuid;
begin
  if length(btrim(coalesce(p_service_name,''))) < 2 then raise exception 'Service name is required.' using errcode='22023'; end if;
  select cpl.workspace_id into v_workspace from public.contractor_portal_links cpl where cpl.user_id=v_user and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;
  insert into public.provider_services(workspace_id,contractor_id,service_name,active)
  values(v_workspace,p_contractor_id,btrim(p_service_name),true)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.remove_linked_provider_service(p_contractor_id bigint, p_service_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := (select auth.uid()); v_workspace uuid;
begin
  select cpl.workspace_id into v_workspace from public.contractor_portal_links cpl where cpl.user_id=v_user and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;
  delete from public.provider_services where id=p_service_id and workspace_id=v_workspace and contractor_id=p_contractor_id;
end;
$$;

create or replace function public.add_linked_provider_service_area(p_contractor_id bigint, p_city text, p_state text, p_zip text, p_radius_miles integer)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := (select auth.uid()); v_workspace uuid; v_id uuid;
begin
  if coalesce(p_radius_miles,0) < 0 or p_radius_miles > 500 then raise exception 'Radius must be between 0 and 500 miles.' using errcode='22023'; end if;
  if nullif(btrim(coalesce(p_city,'')),'') is null and nullif(btrim(coalesce(p_zip,'')),'') is null then raise exception 'City or ZIP is required.' using errcode='22023'; end if;
  select cpl.workspace_id into v_workspace from public.contractor_portal_links cpl where cpl.user_id=v_user and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;
  insert into public.provider_service_areas(workspace_id,contractor_id,city,state,zip,radius_miles)
  values(v_workspace,p_contractor_id,nullif(btrim(p_city),''),coalesce(nullif(btrim(p_state),''),'PA'),nullif(btrim(p_zip),''),p_radius_miles)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.remove_linked_provider_service_area(p_contractor_id bigint, p_area_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := (select auth.uid()); v_workspace uuid;
begin
  select cpl.workspace_id into v_workspace from public.contractor_portal_links cpl where cpl.user_id=v_user and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;
  delete from public.provider_service_areas where id=p_area_id and workspace_id=v_workspace and contractor_id=p_contractor_id;
end;
$$;

create or replace function public.set_linked_provider_availability(p_contractor_id bigint, p_available boolean, p_note text, p_next_available_at timestamptz)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_user uuid := (select auth.uid()); v_workspace uuid;
begin
  select cpl.workspace_id into v_workspace from public.contractor_portal_links cpl where cpl.user_id=v_user and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;
  insert into public.provider_availability(workspace_id,contractor_id,available,note,next_available_at,updated_at)
  values(v_workspace,p_contractor_id,p_available,nullif(btrim(coalesce(p_note,'')),''),p_next_available_at,now())
  on conflict (workspace_id,contractor_id) do update set available=excluded.available,note=excluded.note,next_available_at=excluded.next_available_at,updated_at=now();
end;
$$;

revoke all on function public.get_linked_provider_setup(bigint) from public,anon;
revoke all on function public.add_linked_provider_service(bigint,text) from public,anon;
revoke all on function public.remove_linked_provider_service(bigint,uuid) from public,anon;
revoke all on function public.add_linked_provider_service_area(bigint,text,text,text,integer) from public,anon;
revoke all on function public.remove_linked_provider_service_area(bigint,uuid) from public,anon;
revoke all on function public.set_linked_provider_availability(bigint,boolean,text,timestamptz) from public,anon;
grant execute on function public.get_linked_provider_setup(bigint), public.add_linked_provider_service(bigint,text), public.remove_linked_provider_service(bigint,uuid), public.add_linked_provider_service_area(bigint,text,text,text,integer), public.remove_linked_provider_service_area(bigint,uuid), public.set_linked_provider_availability(bigint,boolean,text,timestamptz) to authenticated,service_role;
