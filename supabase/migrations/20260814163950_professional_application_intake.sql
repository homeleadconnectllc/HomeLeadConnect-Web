insert into public.public_forms (form_slug, workspace_id, enabled, source)
select 'professional-application', w.id, true, 'public_website'
from public.workspaces w
where w.name = 'HomeLead Connect'
  and not exists (
    select 1 from public.public_forms pf where pf.form_slug = 'professional-application'
  );

create table public.professional_applications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  request_id uuid not null,
  organization_name text not null check (char_length(btrim(organization_name)) between 2 and 160),
  contact_name text not null check (char_length(btrim(contact_name)) between 2 and 160),
  email text not null check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text not null check (char_length(regexp_replace(phone, '[^0-9]', '', 'g')) >= 10),
  trade_categories text not null check (char_length(btrim(trade_categories)) between 2 and 500),
  service_territory text not null check (char_length(btrim(service_territory)) between 2 and 500),
  experience_summary text not null check (char_length(btrim(experience_summary)) between 10 and 4000),
  communication_consent boolean not null check (communication_consent),
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','declined')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, request_id)
);

alter table public.professional_applications enable row level security;
revoke all on table public.professional_applications from public, anon, authenticated;
grant select, update on table public.professional_applications to authenticated;

create policy professional_applications_management_select
on public.professional_applications for select to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.workspace_id = professional_applications.workspace_id
      and p.user_id = (select auth.uid())
      and lower(p.role) in ('owner','manager')
  )
);

create policy professional_applications_management_update
on public.professional_applications for update to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.workspace_id = professional_applications.workspace_id
      and p.user_id = (select auth.uid())
      and lower(p.role) in ('owner','manager')
  )
)
with check (
  exists (
    select 1
    from public.profiles p
    where p.workspace_id = professional_applications.workspace_id
      and p.user_id = (select auth.uid())
      and lower(p.role) in ('owner','manager')
  )
);

create or replace function public.submit_professional_application(
  p_form_slug text,
  p_request_id uuid,
  p_organization_name text,
  p_contact_name text,
  p_email text,
  p_phone text,
  p_trade_categories text,
  p_service_territory text,
  p_experience_summary text,
  p_communication_consent boolean
)
returns table (application_id uuid, accepted boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_form public.public_forms%rowtype;
  v_application_id uuid;
begin
  if p_request_id is null then raise exception 'A request identifier is required.' using errcode='22023'; end if;
  select * into v_form from public.public_forms where form_slug=btrim(p_form_slug) and enabled=true;
  if not found then raise exception 'Professional applications are unavailable.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_organization_name,''))) < 2 then raise exception 'Enter the organization name.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_contact_name,''))) < 2 then raise exception 'Enter the primary contact name.' using errcode='22023'; end if;
  if coalesce(p_email,'') !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Enter a valid email address.' using errcode='22023'; end if;
  if char_length(regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')) < 10 then raise exception 'Enter a valid phone number.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_trade_categories,''))) < 2 then raise exception 'Enter at least one trade or service.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_service_territory,''))) < 2 then raise exception 'Enter the service territory.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_experience_summary,''))) < 10 then raise exception 'Tell us about your experience.' using errcode='22023'; end if;
  if p_communication_consent is not true then raise exception 'Consent to application-related communication is required.' using errcode='22023'; end if;

  insert into public.professional_applications (
    workspace_id, request_id, organization_name, contact_name, email, phone,
    trade_categories, service_territory, experience_summary, communication_consent
  ) values (
    v_form.workspace_id, p_request_id, btrim(p_organization_name), btrim(p_contact_name),
    lower(btrim(p_email)), btrim(p_phone), btrim(p_trade_categories),
    btrim(p_service_territory), btrim(p_experience_summary), true
  )
  on conflict (workspace_id, request_id) do update set request_id=excluded.request_id
  returning id into v_application_id;

  return query select v_application_id, true;
end;
$$;

revoke all on function public.submit_professional_application(text,uuid,text,text,text,text,text,text,text,boolean) from public;
grant execute on function public.submit_professional_application(text,uuid,text,text,text,text,text,text,text,boolean) to anon, authenticated;
