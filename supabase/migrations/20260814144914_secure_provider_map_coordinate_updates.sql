create or replace function public.hlc_guard_provider_coordinate_update()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    return new;
  end if;

  if new.latitude is not distinct from old.latitude
     and new.longitude is not distinct from old.longitude then
    return new;
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    join public.profiles p on p.user_id = wm.user_id
    where wm.workspace_id = new.workspace_id
      and wm.user_id = v_user
      and lower(coalesce(p.role, '')) in ('owner','manager')
  ) then
    raise exception 'Provider map coordinates require owner or manager authorization.' using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.hlc_guard_provider_coordinate_update() from public, anon, authenticated;

drop trigger if exists contractors_guard_map_coordinates on public.contractors;
create trigger contractors_guard_map_coordinates
before update of latitude, longitude on public.contractors
for each row execute function public.hlc_guard_provider_coordinate_update();

create or replace function public.set_provider_map_coordinates(
  p_contractor_id bigint,
  p_latitude double precision,
  p_longitude double precision
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := (select auth.uid());
  v_workspace uuid;
begin
  if v_user is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;
  if p_latitude is null or p_latitude < -90 or p_latitude > 90
     or p_longitude is null or p_longitude < -180 or p_longitude > 180 then
    raise exception 'Latitude/longitude are outside valid bounds.' using errcode = '22023';
  end if;

  select c.workspace_id into v_workspace
  from public.contractors c
  where c.id = p_contractor_id;
  if v_workspace is null then
    raise exception 'Provider not found.' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    join public.profiles p on p.user_id = wm.user_id
    where wm.workspace_id = v_workspace
      and wm.user_id = v_user
      and lower(coalesce(p.role, '')) in ('owner','manager')
  ) then
    raise exception 'Provider map coordinates require owner or manager authorization.' using errcode = '42501';
  end if;

  update public.contractors
  set latitude = p_latitude,
      longitude = p_longitude,
      updated_at = now()
  where id = p_contractor_id and workspace_id = v_workspace;
end;
$$;

revoke all on function public.set_provider_map_coordinates(bigint,double precision,double precision) from public, anon;
grant execute on function public.set_provider_map_coordinates(bigint,double precision,double precision) to authenticated, service_role;
