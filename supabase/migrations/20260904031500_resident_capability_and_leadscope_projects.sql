-- Resident premium capability grants and resident-owned LeadScope projects.
-- Staged on an isolated branch. Do not apply to production before exact-head certification and promotion approval.

create table if not exists public.portal_capability_entitlements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  audience text not null check (audience in ('resident','professional')),
  capability text not null check (char_length(btrim(capability)) between 1 and 120),
  status text not null default 'active' check (status in ('active','inactive')),
  source text not null default 'service_grant' check (source in ('service_grant','subscription','trial','migration','support')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id,user_id,audience,capability)
);

alter table public.portal_capability_entitlements enable row level security;
revoke all on table public.portal_capability_entitlements from public, anon, authenticated;
grant select on table public.portal_capability_entitlements to authenticated;
grant all on table public.portal_capability_entitlements to service_role;

create policy portal_capability_entitlements_select_own
on public.portal_capability_entitlements
for select to authenticated
using (user_id = (select auth.uid()));

create index if not exists portal_capability_entitlements_user_capability_idx
  on public.portal_capability_entitlements(user_id,workspace_id,audience,capability,status);

create or replace function public.has_portal_capability(p_workspace_id uuid, p_audience text, p_capability text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.portal_capability_entitlements e
    where e.user_id = (select auth.uid())
      and e.workspace_id = p_workspace_id
      and e.audience = lower(btrim(p_audience))
      and e.capability = lower(btrim(p_capability))
      and e.status = 'active'
      and (e.starts_at is null or e.starts_at <= now())
      and (e.ends_at is null or e.ends_at > now())
      and exists (
        select 1 from public.workspace_members wm
        where wm.workspace_id = p_workspace_id
          and wm.user_id = (select auth.uid())
      )
  );
$$;

revoke all on function public.has_portal_capability(uuid,text,text) from public, anon;
grant execute on function public.has_portal_capability(uuid,text,text) to authenticated, service_role;

create table if not exists public.leadscope_projects (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.resident_properties(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 160),
  project_type text not null check (char_length(btrim(project_type)) between 1 and 120),
  measurement_unit text not null default 'sq_ft' check (measurement_unit in ('sq_ft','linear_ft','each','custom')),
  measurements jsonb,
  measurements_state text not null default 'unknown' check (measurements_state in ('known','unknown','assumption','unverifiable')),
  measurements_source text,
  measurements_note text,
  site_conditions text,
  site_conditions_state text not null default 'unknown' check (site_conditions_state in ('known','unknown','assumption','unverifiable')),
  site_conditions_source text,
  site_conditions_note text,
  scope_description text,
  scope_description_state text not null default 'unknown' check (scope_description_state in ('known','unknown','assumption','unverifiable')),
  scope_description_source text,
  scope_description_note text,
  estimate_rate_low numeric(12,2),
  estimate_rate_high numeric(12,2),
  estimate_low numeric(14,2),
  estimate_high numeric(14,2),
  estimate_currency text not null default 'usd' check (estimate_currency ~ '^[a-z]{3}$'),
  estimate_method text,
  status text not null default 'draft' check (status in ('draft','reviewed','saved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leadscope_measurements_object check (measurements is null or jsonb_typeof(measurements) = 'object'),
  constraint leadscope_measurement_state_value check (
    (measurements_state in ('unknown','unverifiable') and measurements is null)
    or (measurements_state in ('known','assumption') and measurements is not null)
  ),
  constraint leadscope_site_state_value check (
    (site_conditions_state in ('unknown','unverifiable') and site_conditions is null)
    or (site_conditions_state in ('known','assumption') and site_conditions is not null)
  ),
  constraint leadscope_scope_state_value check (
    (scope_description_state in ('unknown','unverifiable') and scope_description is null)
    or (scope_description_state in ('known','assumption') and scope_description is not null)
  ),
  constraint leadscope_rate_pair check (
    (estimate_rate_low is null and estimate_rate_high is null)
    or (estimate_rate_low is not null and estimate_rate_high is not null and estimate_rate_low >= 0 and estimate_rate_high >= estimate_rate_low)
  ),
  constraint leadscope_estimate_pair check (
    (estimate_low is null and estimate_high is null)
    or (estimate_low is not null and estimate_high is not null and estimate_low >= 0 and estimate_high >= estimate_low)
  )
);

create index if not exists leadscope_projects_property_idx on public.leadscope_projects(property_id,updated_at desc);
create index if not exists leadscope_projects_user_idx on public.leadscope_projects(user_id,updated_at desc);
create index if not exists leadscope_projects_workspace_idx on public.leadscope_projects(workspace_id);

alter table public.leadscope_projects enable row level security;
revoke all on table public.leadscope_projects from public, anon;
grant select,insert,update,delete on table public.leadscope_projects to authenticated;
grant all on table public.leadscope_projects to service_role;

create policy leadscope_projects_select_own
on public.leadscope_projects
for select to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.resident_properties rp
    where rp.id = leadscope_projects.property_id
      and rp.user_id = (select auth.uid())
      and rp.workspace_id = leadscope_projects.workspace_id
  )
);

create policy leadscope_projects_insert_entitled
on public.leadscope_projects
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and public.has_portal_capability(workspace_id,'resident','leadscope')
  and exists (
    select 1
    from public.resident_properties rp
    where rp.id = leadscope_projects.property_id
      and rp.user_id = (select auth.uid())
      and rp.workspace_id = leadscope_projects.workspace_id
  )
);

create policy leadscope_projects_update_entitled
on public.leadscope_projects
for update to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.resident_properties rp
    where rp.id = leadscope_projects.property_id
      and rp.user_id = (select auth.uid())
      and rp.workspace_id = leadscope_projects.workspace_id
  )
)
with check (
  user_id = (select auth.uid())
  and public.has_portal_capability(workspace_id,'resident','leadscope')
  and exists (
    select 1
    from public.resident_properties rp
    where rp.id = leadscope_projects.property_id
      and rp.user_id = (select auth.uid())
      and rp.workspace_id = leadscope_projects.workspace_id
  )
);

create policy leadscope_projects_delete_own
on public.leadscope_projects
for delete to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.resident_properties rp
    where rp.id = leadscope_projects.property_id
      and rp.user_id = (select auth.uid())
      and rp.workspace_id = leadscope_projects.workspace_id
  )
);

create or replace function public.hlc_validate_leadscope_project_identity()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_property public.resident_properties%rowtype;
begin
  select * into v_property from public.resident_properties where id = new.property_id;
  if v_property.id is null then raise exception 'property not found'; end if;
  if new.workspace_id is distinct from v_property.workspace_id or new.user_id is distinct from v_property.user_id then
    raise exception 'LeadScope project identity mismatch' using errcode='42501';
  end if;
  new.title := btrim(new.title);
  new.project_type := btrim(new.project_type);
  new.estimate_currency := lower(btrim(new.estimate_currency));
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.hlc_validate_leadscope_project_identity() from public, anon, authenticated;

drop trigger if exists leadscope_projects_validate_identity on public.leadscope_projects;
create trigger leadscope_projects_validate_identity
before insert or update on public.leadscope_projects
for each row execute function public.hlc_validate_leadscope_project_identity();