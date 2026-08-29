-- Partner/referral-source portal contract. Staged only; production promotion requires explicit approval.

create table if not exists public.partner_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  display_name text not null,
  organization_name text,
  contact_email text,
  linked_user_id uuid,
  status text not null default 'pending' check (status in ('pending','active','suspended','closed')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, linked_user_id)
);

create table if not exists public.partner_referrals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  partner_source_id uuid not null references public.partner_sources(id) on delete restrict,
  target_kind text not null check (target_kind in ('resident','professional')),
  referred_name text,
  referred_email text,
  referred_phone text,
  note text,
  status text not null default 'recorded' check (status in ('recorded','reviewing','qualified','converted','closed','declined')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists partner_referrals_source_created_idx on public.partner_referrals(partner_source_id, created_at desc);

alter table public.partner_sources enable row level security;
alter table public.partner_referrals enable row level security;
revoke all on table public.partner_sources from public, anon, authenticated;
revoke all on table public.partner_referrals from public, anon, authenticated;
grant all on table public.partner_sources, public.partner_referrals to service_role;

create or replace function public.create_partner_source(
  p_display_name text,
  p_organization_name text,
  p_contact_email text,
  p_linked_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_role text;
  v_id uuid;
begin
  select p.workspace_id, lower(coalesce(p.role,'')) into v_workspace,v_role
  from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then
    raise exception 'Management access is required.' using errcode='42501';
  end if;
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;
  if length(btrim(coalesce(p_display_name,''))) < 2 then raise exception 'Partner display name is required.' using errcode='22023'; end if;
  if p_linked_user_id is null then raise exception 'A linked account user is required.' using errcode='22023'; end if;

  insert into public.partner_sources(workspace_id,display_name,organization_name,contact_email,linked_user_id,status,created_by)
  values(v_workspace,btrim(p_display_name),nullif(btrim(coalesce(p_organization_name,'')),''),nullif(lower(btrim(coalesce(p_contact_email,''))),''),p_linked_user_id,'active',auth.uid())
  on conflict(workspace_id,linked_user_id) do update
    set display_name=excluded.display_name,organization_name=excluded.organization_name,contact_email=excluded.contact_email,status='active',updated_at=now()
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.create_partner_source(text,text,text,uuid) from public, anon;
grant execute on function public.create_partner_source(text,text,text,uuid) to authenticated, service_role;

create or replace function public.get_partner_portal_data()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_source public.partner_sources%rowtype;
  v_result jsonb;
begin
  select s.* into v_source from public.partner_sources s
  where s.linked_user_id=auth.uid() and s.status='active' limit 1;
  if not found then raise exception 'Active partner access is required.' using errcode='42501'; end if;
  select jsonb_build_object(
    'source', jsonb_build_object('id',v_source.id,'display_name',v_source.display_name,'organization_name',v_source.organization_name,'contact_email',v_source.contact_email,'status',v_source.status),
    'referrals', coalesce((select jsonb_agg(jsonb_build_object('id',r.id,'target_kind',r.target_kind,'referred_name',r.referred_name,'referred_email',r.referred_email,'referred_phone',r.referred_phone,'note',r.note,'status',r.status,'created_at',r.created_at,'updated_at',r.updated_at) order by r.created_at desc) from public.partner_referrals r where r.workspace_id=v_source.workspace_id and r.partner_source_id=v_source.id),'[]'::jsonb)
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.get_partner_portal_data() from public, anon;
grant execute on function public.get_partner_portal_data() to authenticated, service_role;

create or replace function public.partner_create_referral(
  p_target_kind text,
  p_referred_name text,
  p_referred_email text,
  p_referred_phone text,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source public.partner_sources%rowtype;
  v_id uuid;
begin
  if p_target_kind not in ('resident','professional') then raise exception 'Unsupported referral type.' using errcode='22023'; end if;
  if nullif(btrim(coalesce(p_referred_email,'')),'') is null and nullif(btrim(coalesce(p_referred_phone,'')),'') is null then
    raise exception 'Referral email or phone is required.' using errcode='22023';
  end if;
  select s.* into v_source from public.partner_sources s where s.linked_user_id=auth.uid() and s.status='active' limit 1;
  if not found then raise exception 'Active partner access is required.' using errcode='42501'; end if;
  if exists(select 1 from public.partner_referrals r where r.partner_source_id=v_source.id and coalesce(lower(r.referred_email),'')=coalesce(lower(nullif(btrim(p_referred_email),'')),'') and coalesce(r.referred_phone,'')=coalesce(nullif(btrim(p_referred_phone),''),'') and r.created_at > now()-interval '30 days') then
    raise exception 'This referral was already recorded recently.' using errcode='23505';
  end if;
  insert into public.partner_referrals(workspace_id,partner_source_id,target_kind,referred_name,referred_email,referred_phone,note,created_by)
  values(v_source.workspace_id,v_source.id,p_target_kind,nullif(btrim(coalesce(p_referred_name,'')),''),nullif(lower(btrim(coalesce(p_referred_email,''))),''),nullif(btrim(coalesce(p_referred_phone,'')),''),nullif(btrim(coalesce(p_note,'')),''),auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.partner_create_referral(text,text,text,text,text) from public, anon;
grant execute on function public.partner_create_referral(text,text,text,text,text) to authenticated, service_role;

create or replace function public.set_partner_referral_status(p_referral_id uuid,p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_role text;
begin
  if p_status not in ('recorded','reviewing','qualified','converted','closed','declined') then raise exception 'Unsupported referral status.' using errcode='22023'; end if;
  select p.workspace_id,lower(coalesce(p.role,'')) into v_workspace,v_role from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  update public.partner_referrals set status=p_status,updated_at=now() where id=p_referral_id and workspace_id=v_workspace;
  if not found then raise exception 'Referral is not in the current workspace.' using errcode='42501'; end if;
end;
$$;
revoke all on function public.set_partner_referral_status(uuid,text) from public, anon;
grant execute on function public.set_partner_referral_status(uuid,text) to authenticated, service_role;
