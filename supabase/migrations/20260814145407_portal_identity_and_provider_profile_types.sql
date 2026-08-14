create table if not exists public.portal_identity_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  participant_type text not null default 'homeowner' check (participant_type in ('homeowner','renter','mover','community_member')),
  full_name text,
  avatar_url text,
  phone text,
  preferred_contact text check (preferred_contact is null or preferred_contact in ('email','phone','sms')),
  language text not null default 'en',
  accessibility_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_identity_profiles enable row level security;

drop policy if exists portal_identity_profiles_self_select on public.portal_identity_profiles;
create policy portal_identity_profiles_self_select on public.portal_identity_profiles
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists portal_identity_profiles_self_insert on public.portal_identity_profiles;
create policy portal_identity_profiles_self_insert on public.portal_identity_profiles
for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists portal_identity_profiles_self_update on public.portal_identity_profiles;
create policy portal_identity_profiles_self_update on public.portal_identity_profiles
for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke all on public.portal_identity_profiles from anon;
grant select, insert, update on public.portal_identity_profiles to authenticated;

alter table public.contractors
  add column if not exists provider_type text not null default 'contractor'
  check (provider_type in ('contractor','subcontractor','remodeling_company','real_estate','mover','cleaner','painter','roofer','hvac','service_business','other'));

comment on column public.contractors.provider_type is 'Presentation/business category only. It never grants workspace or portal authorization.';

create or replace function public.update_linked_provider_profile(
  p_contractor_id bigint,
  p_company_name text,
  p_contact_name text,
  p_phone text,
  p_email text,
  p_website text,
  p_address text,
  p_city text,
  p_state text,
  p_zip text,
  p_specialty text,
  p_provider_type text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;
  if p_provider_type not in ('contractor','subcontractor','remodeling_company','real_estate','mover','cleaner','painter','roofer','hvac','service_business','other') then
    raise exception 'Unsupported provider type.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.contractor_portal_links cpl
    where cpl.user_id = v_user
      and cpl.contractor_id = p_contractor_id
      and cpl.revoked_at is null
  ) then
    raise exception 'Linked provider access required.' using errcode = '42501';
  end if;

  update public.contractors
  set company_name = nullif(btrim(p_company_name), ''),
      contact_name = nullif(btrim(p_contact_name), ''),
      phone = nullif(btrim(p_phone), ''),
      email = nullif(btrim(p_email), ''),
      website = nullif(btrim(p_website), ''),
      address = nullif(btrim(p_address), ''),
      city = nullif(btrim(p_city), ''),
      state = nullif(btrim(p_state), ''),
      zip = nullif(btrim(p_zip), ''),
      specialty = nullif(btrim(p_specialty), ''),
      provider_type = p_provider_type,
      updated_at = now()
  where id = p_contractor_id;
end;
$$;

revoke all on function public.update_linked_provider_profile(bigint,text,text,text,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.update_linked_provider_profile(bigint,text,text,text,text,text,text,text,text,text,text,text) to authenticated, service_role;
