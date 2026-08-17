alter table public.contractors add column if not exists coordinate_accuracy text;
alter table public.contractors add column if not exists coordinate_source text;

alter table public.contractors drop constraint if exists contractors_coordinate_accuracy_check;
alter table public.contractors add constraint contractors_coordinate_accuracy_check
  check (coordinate_accuracy is null or coordinate_accuracy in ('approximate','verified'));

create or replace function public.set_provider_map_coordinates(
  p_contractor_id bigint,
  p_latitude double precision,
  p_longitude double precision
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
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
    where wm.workspace_id = v_workspace
      and wm.user_id = v_user
      and lower(coalesce(wm.role, '')) in ('owner','manager')
  ) then
    raise exception 'Provider map coordinates require owner or manager authorization.' using errcode = '42501';
  end if;

  update public.contractors
  set latitude = p_latitude,
      longitude = p_longitude,
      coordinate_accuracy = 'verified',
      coordinate_source = 'owner_manager_verified',
      updated_at = now()
  where id = p_contractor_id
    and workspace_id = v_workspace;
end;
$function$;

-- Existing Lancaster 17601 provider records without coordinates receive only an
-- approximate ZIP-centroid point. This is intentionally not marked verified.
update public.contractors
set latitude = 40.0730,
    longitude = -76.3150,
    coordinate_accuracy = 'approximate',
    coordinate_source = 'zip_centroid_17601',
    updated_at = now()
where latitude is null
  and longitude is null
  and upper(coalesce(city, '')) = 'LANCASTER'
  and upper(coalesce(state, '')) = 'PA'
  and zip = '17601';
