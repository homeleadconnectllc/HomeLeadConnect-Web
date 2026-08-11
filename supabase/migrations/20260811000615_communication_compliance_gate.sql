create table public.communication_consents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  subject_type text not null check(subject_type in ('lead','contractor')),
  subject_id text not null,
  channel text not null check(channel in ('sms','email','call','recording')),
  purpose text not null check(purpose in ('service','appointment','lead_follow_up','marketing')),
  status text not null check(status in ('granted','revoked')),
  source text not null,
  consent_text text not null,
  captured_by uuid not null references auth.users(id),
  captured_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check((status='revoked')=(revoked_at is not null))
);
create index communication_consents_lookup_idx on public.communication_consents
  (workspace_id,subject_type,subject_id,channel,purpose,captured_at desc);

create table public.communication_suppressions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel text not null check(channel in ('sms','email','call')),
  destination text not null,
  reason text not null,
  source text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  released_at timestamptz
);
create unique index communication_suppressions_active_unique on public.communication_suppressions
  (workspace_id,channel,destination) where released_at is null;

create table public.communication_dnc_screenings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  destination text not null,
  registry text not null check(registry in ('internal','national','pennsylvania')),
  result text not null check(result in ('clear','listed','unknown')),
  checked_at timestamptz not null,
  expires_at timestamptz not null,
  provider_reference text,
  created_at timestamptz not null default now()
);
create index communication_dnc_screenings_lookup_idx on public.communication_dnc_screenings
  (workspace_id,destination,registry,checked_at desc);

create table public.communication_provider_connections (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  channel text not null check(channel in ('sms','email','call','voice_note')),
  status text not null check(status in ('not_connected','configured','manual_available','connected','disabled')) default 'not_connected',
  provider_name text not null,
  sender_identity text,
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key(workspace_id,channel,provider_name),
  check(status<>'connected' or (provider_name is not null and sender_identity is not null and verified_at is not null))
);

create table public.communication_compliance_checks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id),
  subject_type text not null,
  subject_id text not null,
  channel text not null,
  provider_name text not null,
  purpose text not null,
  direction text not null,
  decision text not null check(decision in ('ALLOW','BLOCK','REVIEW')),
  reasons jsonb not null,
  requested_automated boolean not null,
  requested_prerecorded_or_ai_voice boolean not null,
  requested_recording boolean not null,
  created_at timestamptz not null default now()
);
create index communication_compliance_checks_workspace_idx on public.communication_compliance_checks
  (workspace_id,created_at desc);
create index communication_compliance_checks_subject_idx on public.communication_compliance_checks
  (workspace_id,subject_type,subject_id,created_at desc);

alter table public.communication_consents enable row level security;
alter table public.communication_suppressions enable row level security;
alter table public.communication_dnc_screenings enable row level security;
alter table public.communication_provider_connections enable row level security;
alter table public.communication_compliance_checks enable row level security;

create policy communication_consents_workspace_select on public.communication_consents for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=communication_consents.workspace_id and wm.user_id=(select auth.uid()))
);
create policy communication_suppressions_workspace_select on public.communication_suppressions for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=communication_suppressions.workspace_id and wm.user_id=(select auth.uid()))
);
create policy communication_dnc_workspace_select on public.communication_dnc_screenings for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=communication_dnc_screenings.workspace_id and wm.user_id=(select auth.uid()))
);
create policy communication_connections_workspace_select on public.communication_provider_connections for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=communication_provider_connections.workspace_id and wm.user_id=(select auth.uid()))
);
create policy communication_checks_workspace_select on public.communication_compliance_checks for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=communication_compliance_checks.workspace_id and wm.user_id=(select auth.uid()))
);

grant select on public.communication_consents,public.communication_suppressions,
  public.communication_dnc_screenings,public.communication_provider_connections,
  public.communication_compliance_checks to authenticated;
grant all on public.communication_consents,public.communication_suppressions,
  public.communication_dnc_screenings,public.communication_provider_connections,
  public.communication_compliance_checks to service_role;

create or replace function public.record_communication_consent(
  p_subject_type text,p_subject_id text,p_channel text,p_purpose text,p_source text,p_consent_text text
)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_workspace_id uuid; v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  if lower(p_subject_type)='lead' and not exists(select 1 from public.leads l where l.id=p_subject_id::bigint and l.workspace_id=v_workspace_id) then
    raise exception 'Lead is not in the current workspace.' using errcode='42501';
  elsif lower(p_subject_type)='contractor' and not exists(select 1 from public.contractors c where c.id=p_subject_id::bigint and c.workspace_id=v_workspace_id) then
    raise exception 'Contractor is not in the current workspace.' using errcode='42501';
  elsif lower(p_subject_type) not in ('lead','contractor') then raise exception 'Invalid subject type.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_source,'')))<2 or char_length(btrim(coalesce(p_consent_text,'')))<10 then
    raise exception 'Consent source and exact consent language are required.' using errcode='22023'; end if;
  insert into public.communication_consents(workspace_id,subject_type,subject_id,channel,purpose,status,source,consent_text,captured_by)
  values(v_workspace_id,lower(p_subject_type),p_subject_id,lower(p_channel),lower(p_purpose),'granted',btrim(p_source),btrim(p_consent_text),auth.uid())
  returning id into v_id;
  return v_id;
end; $$;

create or replace function public.suppress_communication_destination(
  p_channel text,p_destination text,p_reason text,p_source text
)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_workspace_id uuid; v_id uuid; v_destination text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  v_destination:=lower(regexp_replace(btrim(coalesce(p_destination,'')),'[() .-]','','g'));
  if v_destination='' then raise exception 'Destination is required.' using errcode='22023'; end if;
  insert into public.communication_suppressions(workspace_id,channel,destination,reason,source,created_by)
  values(v_workspace_id,lower(p_channel),v_destination,btrim(p_reason),btrim(p_source),auth.uid())
  on conflict(workspace_id,channel,destination) where released_at is null do update set reason=excluded.reason,source=excluded.source
  returning id into v_id;
  return v_id;
end; $$;

create or replace function public.evaluate_communication_compliance(
  p_subject_type text,p_subject_id text,p_channel text,p_purpose text,p_direction text,
  p_requested_automated boolean default false,p_requested_prerecorded_or_ai_voice boolean default false,
  p_requested_recording boolean default false,p_provider_name text default null
)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_workspace_id uuid; v_destination text; v_state text; v_provider_name text; v_check_id uuid; v_reasons jsonb:='[]'::jsonb; v_decision text:='ALLOW';
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  if lower(p_subject_type)='lead' then
    select case when lower(p_channel)='email' then lower(l.email) else regexp_replace(l.phone,'[() .-]','','g') end,
      null::text
    into v_destination,v_state from public.leads l where l.id=p_subject_id::bigint and l.workspace_id=v_workspace_id;
    if not found then raise exception 'Lead is not in the current workspace.' using errcode='42501'; end if;
  elsif lower(p_subject_type)='contractor' then
    select case when lower(p_channel)='email' then lower(c.email) else regexp_replace(c.phone,'[() .-]','','g') end,upper(c.state)
    into v_destination,v_state from public.contractors c where c.id=p_subject_id::bigint and c.workspace_id=v_workspace_id;
    if not found then raise exception 'Contractor is not in the current workspace.' using errcode='42501'; end if;
  else raise exception 'Invalid subject type.' using errcode='22023'; end if;
  v_provider_name:=coalesce(nullif(lower(btrim(p_provider_name)),''),case when lower(p_channel) in ('sms','call') then 'twilio' else 'email_unconfigured' end);
  if v_destination is null or v_destination='' then v_decision:='BLOCK'; v_reasons:=v_reasons||'["destination_missing"]'::jsonb; end if;
  if not exists(select 1 from public.communication_provider_connections pc where pc.workspace_id=v_workspace_id
    and pc.channel=lower(p_channel) and pc.provider_name=v_provider_name
    and (pc.status='connected' or (v_provider_name='google_voice' and pc.status='manual_available'))) then
    v_decision:='BLOCK'; v_reasons:=v_reasons||'["provider_not_connected"]'::jsonb;
  end if;
  if exists(select 1 from public.communication_suppressions s where s.workspace_id=v_workspace_id
    and s.channel=lower(p_channel) and s.destination=v_destination and s.released_at is null) then
    v_decision:='BLOCK'; v_reasons:=v_reasons||'["destination_suppressed"]'::jsonb;
  end if;
  if lower(p_direction)='outbound' and lower(p_purpose)='marketing' then
    if lower(p_channel)='call' and (extract(hour from now() at time zone 'America/New_York')<8 or extract(hour from now() at time zone 'America/New_York')>=21) then
      v_decision:='BLOCK'; v_reasons:=v_reasons||'["outside_permitted_calling_window"]'::jsonb;
    end if;
    if v_state is null then if v_decision<>'BLOCK' then v_decision:='REVIEW'; end if; v_reasons:=v_reasons||'["contact_location_unknown"]'::jsonb; end if;
    if lower(p_channel) in ('call','sms') and not exists(select 1 from public.communication_dnc_screenings d
      where d.workspace_id=v_workspace_id and d.destination=v_destination and d.result='clear' and d.expires_at>now()) then
      if v_decision<>'BLOCK' then v_decision:='REVIEW'; end if; v_reasons:=v_reasons||'["dnc_screening_required"]'::jsonb;
    end if;
  end if;
  if lower(p_channel)='sms' and not exists(select 1 from public.communication_consents c where c.workspace_id=v_workspace_id
    and c.subject_type=lower(p_subject_type) and c.subject_id=p_subject_id and c.channel='sms' and c.purpose=lower(p_purpose)
    and c.status='granted' and c.revoked_at is null) then
    v_decision:='BLOCK'; v_reasons:=v_reasons||'["sms_consent_not_proven"]'::jsonb;
  end if;
  if p_requested_automated or p_requested_prerecorded_or_ai_voice then
    if v_decision<>'BLOCK' then v_decision:='REVIEW'; end if; v_reasons:=v_reasons||'["automated_or_prerecorded_review_required"]'::jsonb;
  end if;
  if p_requested_recording and not exists(select 1 from public.communication_consents c where c.workspace_id=v_workspace_id
    and c.subject_type=lower(p_subject_type) and c.subject_id=p_subject_id and c.channel='recording'
    and c.status='granted' and c.revoked_at is null) then
    v_decision:='BLOCK'; v_reasons:=v_reasons||'["recording_consent_not_proven"]'::jsonb;
  end if;
  insert into public.communication_compliance_checks(workspace_id,actor_user_id,subject_type,subject_id,channel,provider_name,purpose,direction,
    decision,reasons,requested_automated,requested_prerecorded_or_ai_voice,requested_recording)
  values(v_workspace_id,auth.uid(),lower(p_subject_type),p_subject_id,lower(p_channel),v_provider_name,lower(p_purpose),lower(p_direction),
    v_decision,v_reasons,p_requested_automated,p_requested_prerecorded_or_ai_voice,p_requested_recording)
  returning id into v_check_id;
  return jsonb_build_object('id',v_check_id,'decision',v_decision,'reasons',v_reasons,'provider_ready',not(v_reasons?'provider_not_connected'));
end; $$;

revoke all on function public.record_communication_consent(text,text,text,text,text,text) from public,anon;
revoke all on function public.suppress_communication_destination(text,text,text,text) from public,anon;
revoke all on function public.evaluate_communication_compliance(text,text,text,text,text,boolean,boolean,boolean,text) from public,anon;
grant execute on function public.record_communication_consent(text,text,text,text,text,text) to authenticated,service_role;
grant execute on function public.suppress_communication_destination(text,text,text,text) to authenticated,service_role;
grant execute on function public.evaluate_communication_compliance(text,text,text,text,text,boolean,boolean,boolean,text) to authenticated,service_role;
