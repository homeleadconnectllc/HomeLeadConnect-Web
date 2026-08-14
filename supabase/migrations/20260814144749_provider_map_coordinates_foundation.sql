alter table public.contractors
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.provider_service_areas
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.contractors
  drop constraint if exists contractors_latitude_valid,
  drop constraint if exists contractors_longitude_valid,
  add constraint contractors_latitude_valid check (latitude is null or latitude between -90 and 90),
  add constraint contractors_longitude_valid check (longitude is null or longitude between -180 and 180);

alter table public.provider_service_areas
  drop constraint if exists provider_service_areas_latitude_valid,
  drop constraint if exists provider_service_areas_longitude_valid,
  add constraint provider_service_areas_latitude_valid check (latitude is null or latitude between -90 and 90),
  add constraint provider_service_areas_longitude_valid check (longitude is null or longitude between -180 and 180);

comment on column public.contractors.latitude is 'Canonical provider latitude for explicit HLC map placement. Null means not mapped; do not infer or fabricate.';
comment on column public.contractors.longitude is 'Canonical provider longitude for explicit HLC map placement. Null means not mapped; do not infer or fabricate.';
comment on column public.provider_service_areas.latitude is 'Optional explicit service-area map anchor latitude. Null means not mapped.';
comment on column public.provider_service_areas.longitude is 'Optional explicit service-area map anchor longitude. Null means not mapped.';
