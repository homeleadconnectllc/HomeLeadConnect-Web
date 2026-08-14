create table if not exists public.property_assets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.resident_properties(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_category text not null check (asset_category = any(array[
    'hvac','water_heater','roof','plumbing','electrical','appliance','generator','solar','irrigation','lawn_equipment','pool_spa','security','other'
  ])),
  label text not null check (char_length(btrim(label)) between 1 and 160),
  manufacturer text,
  model_number text,
  serial_number text,
  installed_on date,
  warranty_expires_on date,
  last_serviced_on date,
  next_service_on date,
  condition text not null default 'unknown' check (condition = any(array['unknown','good','monitor','service_due','repair_needed','replace_soon','retired'])),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_assets_notes_len check (notes is null or char_length(notes) <= 4000),
  constraint property_assets_manufacturer_len check (manufacturer is null or char_length(manufacturer) <= 160),
  constraint property_assets_model_len check (model_number is null or char_length(model_number) <= 160),
  constraint property_assets_serial_len check (serial_number is null or char_length(serial_number) <= 200)
);

create table if not exists public.property_asset_service_events (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.property_assets(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type = any(array['inspection','maintenance','repair','replacement','installation','warranty','note'])),
  occurred_on date not null,
  provider_name text,
  cost numeric(12,2) check (cost is null or cost >= 0),
  notes text,
  created_at timestamptz not null default now(),
  constraint property_asset_service_notes_len check (notes is null or char_length(notes) <= 4000),
  constraint property_asset_service_provider_len check (provider_name is null or char_length(provider_name) <= 200)
);

create index if not exists property_assets_property_idx on public.property_assets(property_id);
create index if not exists property_assets_workspace_idx on public.property_assets(workspace_id);
create index if not exists property_assets_user_idx on public.property_assets(user_id);
create index if not exists property_assets_next_service_idx on public.property_assets(user_id,next_service_on) where next_service_on is not null;
create index if not exists property_asset_service_asset_idx on public.property_asset_service_events(asset_id,occurred_on desc);
create index if not exists property_asset_service_workspace_idx on public.property_asset_service_events(workspace_id);
create index if not exists property_asset_service_user_idx on public.property_asset_service_events(user_id);

alter table public.property_assets enable row level security;
alter table public.property_asset_service_events enable row level security;

revoke all on public.property_assets from anon;
revoke all on public.property_asset_service_events from anon;
grant select,insert,update,delete on public.property_assets to authenticated;
grant select,insert,update,delete on public.property_asset_service_events to authenticated;

create policy property_assets_owner_all on public.property_assets
for all to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.resident_properties rp
    where rp.id = property_assets.property_id
      and rp.user_id = (select auth.uid())
      and rp.workspace_id = property_assets.workspace_id
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.resident_properties rp
    where rp.id = property_assets.property_id
      and rp.user_id = (select auth.uid())
      and rp.workspace_id = property_assets.workspace_id
  )
);

create policy property_asset_service_owner_all on public.property_asset_service_events
for all to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.property_assets pa
    where pa.id = property_asset_service_events.asset_id
      and pa.user_id = (select auth.uid())
      and pa.workspace_id = property_asset_service_events.workspace_id
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.property_assets pa
    where pa.id = property_asset_service_events.asset_id
      and pa.user_id = (select auth.uid())
      and pa.workspace_id = property_asset_service_events.workspace_id
  )
);

create or replace function public.hlc_validate_property_asset_identity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_property public.resident_properties%rowtype;
begin
  select * into v_property from public.resident_properties where id=new.property_id;
  if v_property.id is null then raise exception 'property not found'; end if;
  if new.workspace_id is distinct from v_property.workspace_id or new.user_id is distinct from v_property.user_id then
    raise exception 'property asset identity mismatch' using errcode='42501';
  end if;
  new.label := btrim(new.label);
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.hlc_validate_property_asset_identity() from public,anon,authenticated;

drop trigger if exists property_assets_validate_identity on public.property_assets;
create trigger property_assets_validate_identity before insert or update on public.property_assets
for each row execute function public.hlc_validate_property_asset_identity();

create or replace function public.hlc_validate_property_asset_service_identity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare v_asset public.property_assets%rowtype;
begin
  select * into v_asset from public.property_assets where id=new.asset_id;
  if v_asset.id is null then raise exception 'property asset not found'; end if;
  if new.workspace_id is distinct from v_asset.workspace_id or new.user_id is distinct from v_asset.user_id then
    raise exception 'asset service identity mismatch' using errcode='42501';
  end if;
  return new;
end;
$$;
revoke all on function public.hlc_validate_property_asset_service_identity() from public,anon,authenticated;

drop trigger if exists property_asset_service_validate_identity on public.property_asset_service_events;
create trigger property_asset_service_validate_identity before insert or update on public.property_asset_service_events
for each row execute function public.hlc_validate_property_asset_service_identity();
