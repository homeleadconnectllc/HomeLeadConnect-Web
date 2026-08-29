-- Phase 3 external-user backend contracts.
-- Staged on an isolated Git branch. Do not apply to production without branch verification and explicit promotion approval.

-- ---------------------------------------------------------------------------
-- Provider verification is management-owned. Portal users may read but never self-approve.
-- ---------------------------------------------------------------------------
alter table public.contractors add column if not exists verification_status text not null default 'unverified';
alter table public.contractors add column if not exists verification_note text;
alter table public.contractors add column if not exists verified_at timestamptz;
alter table public.contractors add column if not exists verified_by uuid;

do $$ begin
  alter table public.contractors add constraint contractors_verification_status_check
    check (verification_status in ('unverified','pending','verified','rejected','suspended'));
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Resident-safe provider matches. These records are suggestions/decisions only;
-- they do not auto-assign providers or mutate canonical job state.
-- ---------------------------------------------------------------------------
create table if not exists public.resident_provider_matches (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  lead_id bigint not null references public.leads(id) on delete cascade,
  contractor_id bigint not null references public.contractors(id) on delete restrict,
  status text not null default 'proposed' check (status in ('proposed','accepted','declined','withdrawn')),
  rationale text,
  created_by uuid not null,
  resident_decided_by uuid,
  resident_decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, lead_id, contractor_id)
);

alter table public.resident_provider_matches enable row level security;
revoke all on table public.resident_provider_matches from public, anon, authenticated;
grant all on table public.resident_provider_matches to service_role;

-- ---------------------------------------------------------------------------
-- Separate resident job-payment ledger. This is intentionally independent from
-- HLC workspace subscription billing. Stripe checkout is attached by a server
-- function/Edge Function, never by direct browser writes.
-- ---------------------------------------------------------------------------
create table if not exists public.resident_job_payments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  job_id uuid not null references public.crm_jobs(id) on delete restrict,
  resident_user_id uuid,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending','checkout_created','processing','paid','failed','cancelled','refunded')),
  provider text not null default 'stripe',
  external_checkout_session_id text,
  external_payment_intent_id text,
  checkout_url text,
  receipt_url text,
  failure_code text,
  failure_message text,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  unique (workspace_id, job_id)
);

create unique index if not exists resident_job_payments_checkout_session_unique
  on public.resident_job_payments(external_checkout_session_id)
  where external_checkout_session_id is not null;
create unique index if not exists resident_job_payments_payment_intent_unique
  on public.resident_job_payments(external_payment_intent_id)
  where external_payment_intent_id is not null;

alter table public.resident_job_payments enable row level security;
revoke all on table public.resident_job_payments from public, anon, authenticated;
grant all on table public.resident_job_payments to service_role;

-- ---------------------------------------------------------------------------
-- Provider-owned progress evidence. This does not directly rewrite crm_jobs.
-- ---------------------------------------------------------------------------
create table if not exists public.provider_job_progress (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  assignment_id uuid not null references public.job_assignments(id) on delete cascade,
  job_id uuid not null references public.crm_jobs(id) on delete cascade,
  contractor_id bigint not null references public.contractors(id) on delete restrict,
  progress_status text not null check (progress_status in ('started','in_progress','blocked','completed')),
  note text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists provider_job_progress_assignment_created_idx
  on public.provider_job_progress(assignment_id, created_at desc);

alter table public.provider_job_progress enable row level security;
revoke all on table public.provider_job_progress from public, anon, authenticated;
grant all on table public.provider_job_progress to service_role;

-- ---------------------------------------------------------------------------
-- Durable Operations exception dispositions. This records how an exception was
-- handled without pretending the source record itself changed when it did not.
-- ---------------------------------------------------------------------------
create table if not exists public.operations_exception_dispositions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  source_type text not null,
  source_id text not null,
  disposition text not null check (disposition in ('resolved','escalated','deferred')),
  note text,
  affected_route text,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists operations_exception_dispositions_source_idx
  on public.operations_exception_dispositions(workspace_id, source_type, source_id, created_at desc);

alter table public.operations_exception_dispositions enable row level security;
revoke all on table public.operations_exception_dispositions from public, anon, authenticated;
grant all on table public.operations_exception_dispositions to service_role;

-- Resident referral source attribution. Existing internal Community behavior is preserved.
alter table public.community_referrals add column if not exists source_kind text not null default 'internal';
alter table public.community_referrals add column if not exists source_lead_id bigint;
alter table public.community_referrals add column if not exists source_partner text;

do $$ begin
  alter table public.community_referrals add constraint community_referrals_source_kind_check
    check (source_kind in ('internal','resident','partner'));
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Shared authorization helpers scoped to portal linkage.
-- ---------------------------------------------------------------------------
create or replace function public.hlc_homeowner_portal_workspace_for_lead(p_lead_id bigint)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select h.workspace_id
  from public.homeowner_portal_links h
  where h.user_id = (select auth.uid())
    and h.lead_id = p_lead_id
    and h.revoked_at is null
  limit 1;
$$;

revoke all on function public.hlc_homeowner_portal_workspace_for_lead(bigint) from public, anon;
grant execute on function public.hlc_homeowner_portal_workspace_for_lead(bigint) to authenticated, service_role;

create or replace function public.hlc_contractor_portal_workspace(p_contractor_id bigint)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select cpl.workspace_id
  from public.contractor_portal_links cpl
  where cpl.user_id = (select auth.uid())
    and cpl.contractor_id = p_contractor_id
    and cpl.revoked_at is null
  limit 1;
$$;

revoke all on function public.hlc_contractor_portal_workspace(bigint) from public, anon;
grant execute on function public.hlc_contractor_portal_workspace(bigint) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Resident provider matching.
-- ---------------------------------------------------------------------------
create or replace function public.create_resident_provider_match(
  p_lead_id bigint,
  p_contractor_id bigint,
  p_rationale text default null
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
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id, lower(coalesce(p.role,'')) into v_workspace, v_role
  from public.profiles p where p.user_id = auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then
    raise exception 'Management access is required.' using errcode='42501';
  end if;
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;
  if not exists(select 1 from public.leads l where l.id=p_lead_id and l.workspace_id=v_workspace) then
    raise exception 'Lead is not in the current workspace.' using errcode='42501';
  end if;
  if not exists(select 1 from public.contractors c where c.id=p_contractor_id and c.workspace_id=v_workspace) then
    raise exception 'Provider is not in the current workspace.' using errcode='42501';
  end if;

  insert into public.resident_provider_matches(workspace_id,lead_id,contractor_id,rationale,created_by)
  values(v_workspace,p_lead_id,p_contractor_id,nullif(btrim(coalesce(p_rationale,'')),''),auth.uid())
  on conflict(workspace_id,lead_id,contractor_id) do update
    set status='proposed', rationale=excluded.rationale, updated_at=now(), resident_decided_by=null, resident_decided_at=null
  returning id into v_id;

  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_workspace,'lead',p_lead_id::text,'resident.match.proposed',jsonb_build_object('match_id',v_id,'contractor_id',p_contractor_id));
  return v_id;
end;
$$;

revoke all on function public.create_resident_provider_match(bigint,bigint,text) from public, anon;
grant execute on function public.create_resident_provider_match(bigint,bigint,text) to authenticated, service_role;

create or replace function public.get_homeowner_portal_matches()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',m.id,
    'workspace_id',m.workspace_id,
    'lead_id',m.lead_id,
    'status',m.status,
    'rationale',m.rationale,
    'created_at',m.created_at,
    'provider',jsonb_build_object(
      'id',c.id,
      'company_name',c.company_name,
      'contact_name',c.contact_name,
      'specialty',c.specialty,
      'provider_type',c.provider_type,
      'city',c.city,
      'state',c.state,
      'verification_status',c.verification_status
    )
  ) order by m.created_at desc),'[]'::jsonb)
  from public.resident_provider_matches m
  join public.contractors c on c.id=m.contractor_id and c.workspace_id=m.workspace_id
  where exists(
    select 1 from public.homeowner_portal_links h
    where h.user_id=auth.uid() and h.workspace_id=m.workspace_id and h.lead_id=m.lead_id and h.revoked_at is null
  );
$$;

revoke all on function public.get_homeowner_portal_matches() from public, anon;
grant execute on function public.get_homeowner_portal_matches() to authenticated, service_role;

create or replace function public.homeowner_decide_provider_match(p_match_id uuid, p_decision text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_match public.resident_provider_matches%rowtype;
begin
  if lower(p_decision) not in ('accepted','declined') then raise exception 'Invalid match decision.' using errcode='22023'; end if;
  select m.* into v_match from public.resident_provider_matches m where m.id=p_match_id for update;
  if not found then raise exception 'Provider match not found.' using errcode='P0002'; end if;
  if not exists(select 1 from public.homeowner_portal_links h where h.user_id=auth.uid() and h.workspace_id=v_match.workspace_id and h.lead_id=v_match.lead_id and h.revoked_at is null) then
    raise exception 'Provider match is not authorized for this resident account.' using errcode='42501';
  end if;
  if v_match.status <> 'proposed' then raise exception 'Only a proposed provider match can be accepted or declined.' using errcode='22023'; end if;

  update public.resident_provider_matches
  set status=lower(p_decision), resident_decided_by=auth.uid(), resident_decided_at=now(), updated_at=now()
  where id=p_match_id;

  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_match.workspace_id,'lead',v_match.lead_id::text,'resident.match.'||lower(p_decision),jsonb_build_object('match_id',p_match_id,'contractor_id',v_match.contractor_id));
  return lower(p_decision);
end;
$$;

revoke all on function public.homeowner_decide_provider_match(uuid,text) from public, anon;
grant execute on function public.homeowner_decide_provider_match(uuid,text) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Resident payment ledger access and management-created payment request.
-- Checkout/provider updates remain server-only and are handled separately.
-- ---------------------------------------------------------------------------
create or replace function public.create_resident_job_payment_request(p_job_id uuid, p_amount numeric)
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
  if p_amount is null or p_amount <= 0 then raise exception 'Payment amount must be positive.' using errcode='22023'; end if;
  select p.workspace_id, lower(coalesce(p.role,'')) into v_workspace,v_role from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace and wm.user_id=auth.uid()) then raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.crm_jobs j where j.id=p_job_id and j.workspace_id=v_workspace) then raise exception 'Job is not in the current workspace.' using errcode='42501'; end if;

  insert into public.resident_job_payments(workspace_id,job_id,amount,created_by)
  values(v_workspace,p_job_id,p_amount,auth.uid())
  on conflict(workspace_id,job_id) do update set amount=excluded.amount,updated_at=now()
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.create_resident_job_payment_request(uuid,numeric) from public, anon;
grant execute on function public.create_resident_job_payment_request(uuid,numeric) to authenticated, service_role;

create or replace function public.get_homeowner_portal_payments()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',p.id,'job_id',p.job_id,'amount',p.amount,'currency',p.currency,'status',p.status,
    'checkout_url',case when p.status in ('pending','checkout_created','processing') then p.checkout_url else null end,
    'receipt_url',case when p.status in ('paid','refunded') then p.receipt_url else null end,
    'failure_message',case when p.status='failed' then p.failure_message else null end,
    'created_at',p.created_at,'paid_at',p.paid_at
  ) order by p.created_at desc),'[]'::jsonb)
  from public.resident_job_payments p
  join public.crm_jobs j on j.id=p.job_id and j.workspace_id=p.workspace_id
  where exists(
    select 1 from public.homeowner_portal_links h
    where h.user_id=auth.uid() and h.workspace_id=p.workspace_id and h.lead_id=j.lead_id and h.revoked_at is null
  );
$$;

revoke all on function public.get_homeowner_portal_payments() from public, anon;
grant execute on function public.get_homeowner_portal_payments() to authenticated, service_role;

-- Service-role helpers for Stripe Edge Functions. Browser roles cannot execute these.
create or replace function public.attach_resident_job_checkout(
  p_payment_id uuid,
  p_resident_user_id uuid,
  p_checkout_session_id text,
  p_checkout_url text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required.' using errcode='42501'; end if;
  update public.resident_job_payments
  set resident_user_id=p_resident_user_id,status='checkout_created',external_checkout_session_id=p_checkout_session_id,checkout_url=p_checkout_url,updated_at=now()
  where id=p_payment_id and status in ('pending','failed','checkout_created');
  if not found then raise exception 'Payment request is not available for checkout.' using errcode='22023'; end if;
end;
$$;
revoke all on function public.attach_resident_job_checkout(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.attach_resident_job_checkout(uuid,uuid,text,text) to service_role;

create or replace function public.set_resident_job_payment_provider_state(
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_status text,
  p_receipt_url text default null,
  p_failure_code text default null,
  p_failure_message text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Service role required.' using errcode='42501'; end if;
  if p_status not in ('processing','paid','failed','cancelled','refunded') then raise exception 'Unsupported payment state.' using errcode='22023'; end if;
  update public.resident_job_payments
  set external_payment_intent_id=coalesce(nullif(p_payment_intent_id,''),external_payment_intent_id),
      status=p_status,
      receipt_url=coalesce(nullif(p_receipt_url,''),receipt_url),
      failure_code=nullif(p_failure_code,''),
      failure_message=nullif(p_failure_message,''),
      paid_at=case when p_status='paid' then coalesce(paid_at,now()) else paid_at end,
      updated_at=now()
  where external_checkout_session_id=p_checkout_session_id;
  if not found then raise exception 'Payment checkout session was not found.' using errcode='P0002'; end if;
end;
$$;
revoke all on function public.set_resident_job_payment_provider_state(text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.set_resident_job_payment_provider_state(text,text,text,text,text,text) to service_role;

-- ---------------------------------------------------------------------------
-- Resident completion-linked reviews.
-- Existing workspace RLS remains intact; portal calls use explicit linkage RPCs.
-- ---------------------------------------------------------------------------
create or replace function public.list_homeowner_review_eligible_jobs()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',j.id,'name',j.name,'completed_status',j.status) order by j.updated_at desc),'[]'::jsonb)
  from public.crm_jobs j
  where j.status='completed'
    and exists(select 1 from public.homeowner_portal_links h where h.user_id=auth.uid() and h.workspace_id=j.workspace_id and h.lead_id=j.lead_id and h.revoked_at is null)
    and not exists(select 1 from public.community_reviews r where r.job_id=j.id and r.author_user_id=auth.uid());
$$;

revoke all on function public.list_homeowner_review_eligible_jobs() from public, anon;
grant execute on function public.list_homeowner_review_eligible_jobs() to authenticated, service_role;

create or replace function public.homeowner_create_review(p_job_id uuid, p_rating integer, p_body text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_id uuid;
begin
  if p_rating < 1 or p_rating > 5 then raise exception 'Rating must be between 1 and 5.' using errcode='22023'; end if;
  if length(btrim(coalesce(p_body,''))) < 3 then raise exception 'Review text is required.' using errcode='22023'; end if;
  select j.workspace_id into v_workspace from public.crm_jobs j
  where j.id=p_job_id and j.status='completed'
    and exists(select 1 from public.homeowner_portal_links h where h.user_id=auth.uid() and h.workspace_id=j.workspace_id and h.lead_id=j.lead_id and h.revoked_at is null)
  for update;
  if v_workspace is null then raise exception 'Completed job is not authorized for this resident account.' using errcode='42501'; end if;
  if exists(select 1 from public.community_reviews r where r.job_id=p_job_id and r.author_user_id=auth.uid()) then raise exception 'A review for this job already exists.' using errcode='23505'; end if;

  insert into public.community_reviews(workspace_id,job_id,author_user_id,rating,body,status)
  values(v_workspace,p_job_id,auth.uid(),p_rating,btrim(p_body),'published') returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.homeowner_create_review(uuid,integer,text) from public, anon;
grant execute on function public.homeowner_create_review(uuid,integer,text) to authenticated, service_role;

create or replace function public.list_homeowner_reviews()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'job_id',r.job_id,'rating',r.rating,'body',r.body,'status',r.status,'created_at',r.created_at) order by r.created_at desc),'[]'::jsonb)
  from public.community_reviews r
  join public.crm_jobs j on j.id=r.job_id and j.workspace_id=r.workspace_id
  where r.author_user_id=auth.uid()
    and exists(select 1 from public.homeowner_portal_links h where h.user_id=auth.uid() and h.workspace_id=j.workspace_id and h.lead_id=j.lead_id and h.revoked_at is null);
$$;

revoke all on function public.list_homeowner_reviews() from public, anon;
grant execute on function public.list_homeowner_reviews() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Resident referrals with source attribution and status visibility.
-- Recording attribution does not message or enroll the referred person.
-- ---------------------------------------------------------------------------
create or replace function public.homeowner_create_referral(p_lead_id bigint, p_email text, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_id uuid;
begin
  if position('@' in coalesce(p_email,'')) < 2 then raise exception 'A valid referral email is required.' using errcode='22023'; end if;
  select h.workspace_id into v_workspace from public.homeowner_portal_links h
  where h.user_id=auth.uid() and h.lead_id=p_lead_id and h.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Resident portal linkage is required.' using errcode='42501'; end if;

  if exists(select 1 from public.community_referrals r where r.referrer_user_id=auth.uid() and lower(r.referred_email)=lower(btrim(p_email)) and r.created_at > now()-interval '30 days') then
    raise exception 'This referral was already recorded recently.' using errcode='23505';
  end if;

  insert into public.community_referrals(workspace_id,referrer_user_id,referred_email,note,status,source_kind,source_lead_id)
  values(v_workspace,auth.uid(),lower(btrim(p_email)),nullif(btrim(coalesce(p_note,'')),''),'recorded','resident',p_lead_id)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.homeowner_create_referral(bigint,text,text) from public, anon;
grant execute on function public.homeowner_create_referral(bigint,text,text) to authenticated, service_role;

create or replace function public.list_homeowner_referrals()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'referred_email',r.referred_email,'note',r.note,'status',r.status,'source_lead_id',r.source_lead_id,'created_at',r.created_at) order by r.created_at desc),'[]'::jsonb)
  from public.community_referrals r
  where r.referrer_user_id=auth.uid() and r.source_kind='resident'
    and exists(select 1 from public.homeowner_portal_links h where h.user_id=auth.uid() and h.workspace_id=r.workspace_id and h.lead_id=r.source_lead_id and h.revoked_at is null);
$$;

revoke all on function public.list_homeowner_referrals() from public, anon;
grant execute on function public.list_homeowner_referrals() to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Professional verification and provider progress/performance.
-- ---------------------------------------------------------------------------
create or replace function public.set_contractor_verification(
  p_contractor_id bigint,
  p_status text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_role text;
begin
  if p_status not in ('unverified','pending','verified','rejected','suspended') then raise exception 'Unsupported verification status.' using errcode='22023'; end if;
  select p.workspace_id,lower(coalesce(p.role,'')) into v_workspace,v_role from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace and wm.user_id=auth.uid()) then raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  update public.contractors
  set verification_status=p_status,
      verification_note=nullif(btrim(coalesce(p_note,'')),''),
      verified_at=case when p_status='verified' then now() else null end,
      verified_by=case when p_status='verified' then auth.uid() else null end,
      updated_at=now()
  where id=p_contractor_id and workspace_id=v_workspace;
  if not found then raise exception 'Provider is not in the current workspace.' using errcode='42501'; end if;
end;
$$;

revoke all on function public.set_contractor_verification(bigint,text,text) from public, anon;
grant execute on function public.set_contractor_verification(bigint,text,text) to authenticated, service_role;

create or replace function public.get_linked_provider_verification(p_contractor_id bigint)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_result jsonb;
begin
  select cpl.workspace_id into v_workspace from public.contractor_portal_links cpl
  where cpl.user_id=auth.uid() and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;
  select jsonb_build_object('contractor_id',c.id,'status',c.verification_status,'note',c.verification_note,'verified_at',c.verified_at)
  into v_result from public.contractors c where c.id=p_contractor_id and c.workspace_id=v_workspace;
  return coalesce(v_result,'{}'::jsonb);
end;
$$;

revoke all on function public.get_linked_provider_verification(bigint) from public, anon;
grant execute on function public.get_linked_provider_verification(bigint) to authenticated, service_role;

create or replace function public.contractor_record_job_progress(p_assignment_id uuid, p_status text, p_note text default null)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment public.job_assignments%rowtype;
  v_id uuid;
begin
  if p_status not in ('started','in_progress','blocked','completed') then raise exception 'Unsupported provider progress status.' using errcode='22023'; end if;
  select ja.* into v_assignment from public.job_assignments ja where ja.id=p_assignment_id;
  if not found then raise exception 'Assignment not found.' using errcode='P0002'; end if;
  if v_assignment.status <> 'accepted' then raise exception 'Only an accepted assignment can report service progress.' using errcode='22023'; end if;
  if not exists(select 1 from public.contractor_portal_links cpl where cpl.user_id=auth.uid() and cpl.workspace_id=v_assignment.workspace_id and cpl.contractor_id=v_assignment.contractor_id and cpl.revoked_at is null) then
    raise exception 'Assignment is not authorized for this contractor account.' using errcode='42501';
  end if;

  insert into public.provider_job_progress(workspace_id,assignment_id,job_id,contractor_id,progress_status,note,created_by)
  values(v_assignment.workspace_id,v_assignment.id,v_assignment.job_id,v_assignment.contractor_id,p_status,nullif(btrim(coalesce(p_note,'')),''),auth.uid())
  returning id into v_id;

  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_assignment.workspace_id,'job',v_assignment.job_id::text,'provider.progress.'||p_status,jsonb_build_object('assignment_id',v_assignment.id,'progress_id',v_id,'contractor_id',v_assignment.contractor_id));
  return v_id;
end;
$$;

revoke all on function public.contractor_record_job_progress(uuid,text,text) from public, anon;
grant execute on function public.contractor_record_job_progress(uuid,text,text) to authenticated, service_role;

create or replace function public.get_contractor_portal_progress()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',p.id,'assignment_id',p.assignment_id,'job_id',p.job_id,'contractor_id',p.contractor_id,
    'status',p.progress_status,'note',p.note,'created_at',p.created_at
  ) order by p.created_at desc),'[]'::jsonb)
  from public.provider_job_progress p
  where exists(select 1 from public.contractor_portal_links cpl where cpl.user_id=auth.uid() and cpl.workspace_id=p.workspace_id and cpl.contractor_id=p.contractor_id and cpl.revoked_at is null);
$$;

revoke all on function public.get_contractor_portal_progress() from public, anon;
grant execute on function public.get_contractor_portal_progress() to authenticated, service_role;

create or replace function public.get_linked_provider_performance(p_contractor_id bigint)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_result jsonb;
begin
  select cpl.workspace_id into v_workspace from public.contractor_portal_links cpl
  where cpl.user_id=auth.uid() and cpl.contractor_id=p_contractor_id and cpl.revoked_at is null limit 1;
  if v_workspace is null then raise exception 'Linked provider access required.' using errcode='42501'; end if;

  select jsonb_build_object(
    'accepted_assignments',(select count(*) from public.job_assignments ja where ja.workspace_id=v_workspace and ja.contractor_id=p_contractor_id and ja.status='accepted'),
    'completed_jobs',(select count(distinct j.id) from public.job_assignments ja join public.crm_jobs j on j.id=ja.job_id and j.workspace_id=ja.workspace_id where ja.workspace_id=v_workspace and ja.contractor_id=p_contractor_id and ja.status='accepted' and j.status='completed'),
    'provider_completed_reports',(select count(*) from public.provider_job_progress p where p.workspace_id=v_workspace and p.contractor_id=p_contractor_id and p.progress_status='completed'),
    'published_reviews',(select count(*) from public.community_reviews r where r.workspace_id=v_workspace and r.status='published' and exists(select 1 from public.job_assignments ja where ja.workspace_id=v_workspace and ja.contractor_id=p_contractor_id and ja.job_id=r.job_id and ja.status='accepted')),
    'average_rating',(select round(avg(r.rating)::numeric,2) from public.community_reviews r where r.workspace_id=v_workspace and r.status='published' and exists(select 1 from public.job_assignments ja where ja.workspace_id=v_workspace and ja.contractor_id=p_contractor_id and ja.job_id=r.job_id and ja.status='accepted'))
  ) into v_result;
  return v_result;
end;
$$;

revoke all on function public.get_linked_provider_performance(bigint) from public, anon;
grant execute on function public.get_linked_provider_performance(bigint) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Operations exception completion state.
-- ---------------------------------------------------------------------------
create or replace function public.record_operations_exception_disposition(
  p_source_type text,
  p_source_id text,
  p_disposition text,
  p_note text default null,
  p_affected_route text default null
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
  if p_disposition not in ('resolved','escalated','deferred') then raise exception 'Unsupported exception disposition.' using errcode='22023'; end if;
  if length(btrim(coalesce(p_source_type,''))) < 2 or length(btrim(coalesce(p_source_id,''))) < 1 then raise exception 'Exception source is required.' using errcode='22023'; end if;
  select p.workspace_id,lower(coalesce(p.role,'')) into v_workspace,v_role from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Operations management access is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace and wm.user_id=auth.uid()) then raise exception 'Workspace membership is required.' using errcode='42501'; end if;

  insert into public.operations_exception_dispositions(workspace_id,source_type,source_id,disposition,note,affected_route,created_by)
  values(v_workspace,lower(btrim(p_source_type)),btrim(p_source_id),p_disposition,nullif(btrim(coalesce(p_note,'')),''),nullif(btrim(coalesce(p_affected_route,'')),''),auth.uid())
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.record_operations_exception_disposition(text,text,text,text,text) from public, anon;
grant execute on function public.record_operations_exception_disposition(text,text,text,text,text) to authenticated, service_role;

create or replace function public.list_operations_exception_dispositions(p_limit integer default 100)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_workspace uuid;
  v_role text;
  v_result jsonb;
begin
  select p.workspace_id,lower(coalesce(p.role,'')) into v_workspace,v_role from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Operations management access is required.' using errcode='42501'; end if;
  select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc),'[]'::jsonb) into v_result
  from (
    select d.id,d.source_type,d.source_id,d.disposition,d.note,d.affected_route,d.created_by,d.created_at
    from public.operations_exception_dispositions d
    where d.workspace_id=v_workspace
    order by d.created_at desc
    limit greatest(1,least(coalesce(p_limit,100),500))
  ) x;
  return v_result;
end;
$$;

revoke all on function public.list_operations_exception_dispositions(integer) from public, anon;
grant execute on function public.list_operations_exception_dispositions(integer) to authenticated, service_role;
