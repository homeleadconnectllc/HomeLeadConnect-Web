-- HCX Connected Core: action-time communication policy and provider truth.
-- A queued transmission is intent, not proof that a provider action completed.

create table public.communication_action_policies (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  timezone text not null default 'America/New_York',
  business_days smallint[] not null default array[1,2,3,4,5]::smallint[],
  business_start time not null default time '08:00',
  business_end time not null default time '18:00',
  quiet_start time not null default time '21:00',
  quiet_end time not null default time '08:00',
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (business_start < business_end),
  check (quiet_start <> quiet_end),
  check (cardinality(business_days) between 1 and 7),
  check (business_days <@ array[0,1,2,3,4,5,6]::smallint[])
);

alter table public.communication_action_policies enable row level security;
create policy communication_action_policies_member_select
on public.communication_action_policies for select to authenticated
using (exists(
  select 1 from public.workspace_members wm
  where wm.workspace_id=communication_action_policies.workspace_id
    and wm.user_id=(select auth.uid())
));
grant select on public.communication_action_policies to authenticated;
grant all on public.communication_action_policies to service_role;

alter table public.communication_compliance_checks
  add column if not exists policy_timezone text,
  add column if not exists evaluated_local_at timestamp,
  add column if not exists within_business_hours boolean,
  add column if not exists within_quiet_hours boolean;

alter table public.communication_transmissions
  drop constraint if exists communication_transmissions_status_check;
alter table public.communication_transmissions
  add constraint communication_transmissions_status_check
  check(status in ('blocked','review','queued','sending','sent','delivered','received','failed','cancelled','manually_logged','retry_wait'));
alter table public.communication_transmissions
  add column if not exists max_attempts integer not null default 3 check(max_attempts between 1 and 5),
  add column if not exists last_attempt_at timestamptz,
  add column if not exists next_retry_at timestamptz;

create table public.communication_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  transmission_id uuid not null references public.communication_transmissions(id) on delete cascade,
  compliance_check_id uuid not null references public.communication_compliance_checks(id) on delete restrict,
  attempt_number integer not null check(attempt_number between 1 and 5),
  status text not null check(status in ('blocked','started','accepted','delivered','retry_wait','exhausted')),
  provider_reference text,
  failure_code text,
  failure_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  unique(transmission_id,attempt_number)
);
create index communication_delivery_attempts_workspace_idx
  on public.communication_delivery_attempts(workspace_id,started_at desc);
create index communication_delivery_attempts_transmission_idx
  on public.communication_delivery_attempts(transmission_id,attempt_number desc);
alter table public.communication_delivery_attempts enable row level security;
create policy communication_delivery_attempts_internal_select
on public.communication_delivery_attempts for select to authenticated
using (exists(
  select 1 from public.workspace_members wm
  where wm.workspace_id=communication_delivery_attempts.workspace_id
    and wm.user_id=(select auth.uid())
    and lower(wm.role) in ('owner','manager')
));
grant select on public.communication_delivery_attempts to authenticated;
grant all on public.communication_delivery_attempts to service_role;

create or replace function public.set_communication_action_policy(
  p_timezone text,
  p_business_days smallint[],
  p_business_start time,
  p_business_end time,
  p_quiet_start time,
  p_quiet_end time
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare v_workspace_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(
    select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id
      and wm.user_id=auth.uid() and lower(wm.role) in ('owner','manager')
  ) then raise exception 'Owner or manager access is required.' using errcode='42501'; end if;
  if not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then
    raise exception 'Use a valid IANA timezone.' using errcode='22023';
  end if;
  insert into public.communication_action_policies(
    workspace_id,timezone,business_days,business_start,business_end,quiet_start,quiet_end,updated_by
  ) values (
    v_workspace_id,p_timezone,p_business_days,p_business_start,p_business_end,p_quiet_start,p_quiet_end,auth.uid()
  ) on conflict(workspace_id) do update set
    timezone=excluded.timezone,business_days=excluded.business_days,
    business_start=excluded.business_start,business_end=excluded.business_end,
    quiet_start=excluded.quiet_start,quiet_end=excluded.quiet_end,
    updated_by=auth.uid(),updated_at=now();
  return jsonb_build_object('workspace_id',v_workspace_id,'status','saved');
end;
$$;
revoke all on function public.set_communication_action_policy(text,smallint[],time,time,time,time) from public,anon;
grant execute on function public.set_communication_action_policy(text,smallint[],time,time,time,time) to authenticated,service_role;

-- Preserve the proven destination/provider/consent/suppression evaluator as the
-- canonical core, then add the action-time policy snapshot around it.
alter function public.evaluate_communication_compliance(text,text,text,text,text,boolean,boolean,boolean,text)
  rename to evaluate_communication_compliance_core;
revoke all on function public.evaluate_communication_compliance_core(text,text,text,text,text,boolean,boolean,boolean,text)
  from public,anon,authenticated,service_role;

create or replace function public.evaluate_communication_compliance(
  p_subject_type text,
  p_subject_id text,
  p_channel text,
  p_purpose text,
  p_direction text,
  p_requested_automated boolean default false,
  p_requested_prerecorded_or_ai_voice boolean default false,
  p_requested_recording boolean default false,
  p_provider_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_result jsonb;
  v_check_id uuid;
  v_workspace_id uuid;
  v_timezone text := 'America/New_York';
  v_business_days smallint[] := array[1,2,3,4,5]::smallint[];
  v_business_start time := time '08:00';
  v_business_end time := time '18:00';
  v_quiet_start time := time '21:00';
  v_quiet_end time := time '08:00';
  v_local timestamp;
  v_local_time time;
  v_business boolean;
  v_quiet boolean;
  v_decision text;
  v_reasons jsonb;
begin
  v_result:=public.evaluate_communication_compliance_core(
    p_subject_type,p_subject_id,p_channel,p_purpose,p_direction,
    p_requested_automated,p_requested_prerecorded_or_ai_voice,p_requested_recording,p_provider_name
  );
  v_check_id:=(v_result->>'id')::uuid;
  select cc.workspace_id into v_workspace_id from public.communication_compliance_checks cc where cc.id=v_check_id;
  select p.timezone,p.business_days,p.business_start,p.business_end,p.quiet_start,p.quiet_end
    into v_timezone,v_business_days,v_business_start,v_business_end,v_quiet_start,v_quiet_end
  from public.communication_action_policies p where p.workspace_id=v_workspace_id;
  v_timezone:=coalesce(v_timezone,'America/New_York');
  v_business_days:=coalesce(v_business_days,array[1,2,3,4,5]::smallint[]);
  v_business_start:=coalesce(v_business_start,time '08:00');
  v_business_end:=coalesce(v_business_end,time '18:00');
  v_quiet_start:=coalesce(v_quiet_start,time '21:00');
  v_quiet_end:=coalesce(v_quiet_end,time '08:00');
  v_local:=now() at time zone v_timezone;
  v_local_time:=v_local::time;
  v_business:=(extract(dow from v_local)::smallint=any(v_business_days)
    and v_local_time>=v_business_start and v_local_time<v_business_end);
  v_quiet:=case when v_quiet_start<v_quiet_end
    then v_local_time>=v_quiet_start and v_local_time<v_quiet_end
    else v_local_time>=v_quiet_start or v_local_time<v_quiet_end end;
  v_decision:=v_result->>'decision';
  v_reasons:=coalesce(v_result->'reasons','[]'::jsonb);
  if lower(p_direction)='outbound' and v_quiet then
    v_decision:='BLOCK';
    if not (v_reasons?'quiet_hours_active') then v_reasons:=v_reasons||'["quiet_hours_active"]'::jsonb; end if;
  elsif lower(p_direction)='outbound' and not v_business then
    if p_requested_automated or lower(p_purpose)='marketing' then v_decision:='BLOCK';
    elsif v_decision<>'BLOCK' then v_decision:='REVIEW'; end if;
    if not (v_reasons?'outside_business_hours') then v_reasons:=v_reasons||'["outside_business_hours"]'::jsonb; end if;
  end if;
  if lower(p_direction)='outbound' and lower(p_channel)='email' and lower(p_purpose)='marketing'
    and not exists(
      select 1 from public.communication_consents c
      where c.workspace_id=v_workspace_id and c.subject_type=lower(p_subject_type)
        and c.subject_id=p_subject_id and c.channel='email' and c.purpose='marketing'
        and c.status='granted' and c.revoked_at is null
    ) then
      v_decision:='BLOCK';
      if not (v_reasons?'email_marketing_consent_not_proven') then
        v_reasons:=v_reasons||'["email_marketing_consent_not_proven"]'::jsonb;
      end if;
  end if;
  update public.communication_compliance_checks set
    decision=v_decision,reasons=v_reasons,policy_timezone=v_timezone,
    evaluated_local_at=v_local,within_business_hours=v_business,within_quiet_hours=v_quiet
  where id=v_check_id;
  return v_result||jsonb_build_object(
    'decision',v_decision,'reasons',v_reasons,'policy_timezone',v_timezone,
    'evaluated_local_at',v_local,'within_business_hours',v_business,'within_quiet_hours',v_quiet
  );
end;
$$;
revoke all on function public.evaluate_communication_compliance(text,text,text,text,text,boolean,boolean,boolean,text) from public,anon;
grant execute on function public.evaluate_communication_compliance(text,text,text,text,text,boolean,boolean,boolean,text) to authenticated,service_role;

create or replace function public.begin_communication_delivery_attempt(p_transmission_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_tx public.communication_transmissions%rowtype;
  v_check jsonb;
  v_attempt_id uuid;
  v_attempt_number integer;
  v_status text;
begin
  select * into v_tx from public.communication_transmissions where id=p_transmission_id for update;
  if not found then raise exception 'Communication transmission was not found.' using errcode='P0002'; end if;
  if v_tx.direction<>'outbound' or v_tx.evidence_source<>'provider' then
    raise exception 'Only provider-backed outbound transmissions can be dispatched.' using errcode='22023';
  end if;
  if v_tx.status not in ('queued','retry_wait') then
    return jsonb_build_object('id',v_tx.id,'status',v_tx.status,'duplicate',true);
  end if;
  if v_tx.status='retry_wait' and v_tx.next_retry_at is not null and v_tx.next_retry_at>now() then
    return jsonb_build_object('id',v_tx.id,'status','retry_wait','retry_after',v_tx.next_retry_at,'duplicate',true);
  end if;
  v_attempt_number:=v_tx.attempt_count+1;
  if v_attempt_number>v_tx.max_attempts then
    update public.communication_transmissions set status='failed',failure_code='RETRY_EXHAUSTED',
      failure_message='Communication delivery retry limit was exhausted.',next_retry_at=null where id=v_tx.id;
    return jsonb_build_object('id',v_tx.id,'status','failed','exhausted',true);
  end if;
  perform set_config('request.jwt.claim.sub',v_tx.created_by::text,true);
  v_check:=public.evaluate_communication_compliance(
    v_tx.subject_type,v_tx.subject_id,v_tx.channel,v_tx.purpose,v_tx.direction,false,false,false,v_tx.provider_name
  );
  v_status:=case when v_check->>'decision'='ALLOW' then 'started' else 'blocked' end;
  insert into public.communication_delivery_attempts(
    workspace_id,transmission_id,compliance_check_id,attempt_number,status,finished_at
  ) values(
    v_tx.workspace_id,v_tx.id,(v_check->>'id')::uuid,v_attempt_number,v_status,
    case when v_status='blocked' then now() else null end
  ) returning id into v_attempt_id;
  update public.communication_transmissions set
    status=case when v_status='started' then 'sending' when v_check->>'decision'='REVIEW' then 'review' else 'blocked' end,
    compliance_check_id=(v_check->>'id')::uuid,attempt_count=v_attempt_number,last_attempt_at=now(),next_retry_at=null,
    failure_code=case when v_status='blocked' then 'ACTION_TIME_POLICY' else null end,
    failure_message=case when v_status='blocked' then array_to_string(array(select jsonb_array_elements_text(v_check->'reasons')),', ') else null end
  where id=v_tx.id;
  return jsonb_build_object('id',v_tx.id,'attempt_id',v_attempt_id,'attempt_number',v_attempt_number,
    'status',v_status,'decision',v_check->>'decision','reasons',v_check->'reasons');
end;
$$;

create or replace function public.complete_communication_delivery_attempt(
  p_attempt_id uuid,
  p_result text,
  p_provider_reference text default null,
  p_failure_code text default null,
  p_failure_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_attempt public.communication_delivery_attempts%rowtype;
  v_tx public.communication_transmissions%rowtype;
  v_terminal boolean;
  v_next timestamptz;
begin
  if lower(p_result) not in ('accepted','failed') then raise exception 'Invalid delivery result.' using errcode='22023'; end if;
  select * into v_attempt from public.communication_delivery_attempts where id=p_attempt_id for update;
  if not found then raise exception 'Communication attempt was not found.' using errcode='P0002'; end if;
  select * into v_tx from public.communication_transmissions where id=v_attempt.transmission_id for update;
  if v_attempt.status<>'started' then
    return jsonb_build_object('id',v_tx.id,'attempt_id',v_attempt.id,'status',v_attempt.status,'duplicate',true);
  end if;
  if lower(p_result)='accepted' then
    update public.communication_delivery_attempts set status='accepted',provider_reference=p_provider_reference,finished_at=now()
      where id=v_attempt.id;
    update public.communication_transmissions set status='sent',provider_reference=p_provider_reference,sent_at=now(),
      failure_code=null,failure_message=null,next_retry_at=null where id=v_tx.id;
    return jsonb_build_object('id',v_tx.id,'attempt_id',v_attempt.id,'status','sent');
  end if;
  v_terminal:=v_attempt.attempt_number>=v_tx.max_attempts;
  v_next:=case when v_terminal then null else now()+(interval '1 minute'*power(2,v_attempt.attempt_number-1)) end;
  update public.communication_delivery_attempts set
    status=case when v_terminal then 'exhausted' else 'retry_wait' end,
    failure_code=coalesce(nullif(p_failure_code,''),'PROVIDER_FAILURE'),
    failure_message=left(coalesce(nullif(p_failure_message,''),'Provider delivery failed.'),500),finished_at=now()
  where id=v_attempt.id;
  update public.communication_transmissions set
    status=case when v_terminal then 'failed' else 'retry_wait' end,
    failure_code=coalesce(nullif(p_failure_code,''),'PROVIDER_FAILURE'),
    failure_message=left(coalesce(nullif(p_failure_message,''),'Provider delivery failed.'),500),next_retry_at=v_next
  where id=v_tx.id;
  if v_tx.subject_type='lead' and v_terminal and not exists(
    select 1 from public.lead_activities la where la.request_id=v_attempt.id
  ) then
    insert into public.lead_activities(workspace_id,lead_id,user_id,activity_type,outcome,notes,request_id)
    values(v_tx.workspace_id,v_tx.subject_id::bigint,v_tx.created_by,'communication_failed','retry_exhausted',
      left(coalesce(nullif(p_failure_message,''),'Provider delivery failed.'),2000),v_attempt.id);
  end if;
  if v_terminal then
    insert into public.notifications(workspace_id,recipient_user_id,notification_type,title,body,related_entity_type,related_entity_id,deep_link,dedupe_key)
    select v_tx.workspace_id,wm.user_id,'communication_failed','Communication delivery failed',
      'A provider-backed '||v_tx.channel||' exhausted its delivery attempts.','communication',v_tx.id,
      '/manual-communications','communication:'||v_tx.id::text||':exhausted'
    from public.workspace_members wm where wm.workspace_id=v_tx.workspace_id and lower(wm.role) in ('owner','manager')
    on conflict(recipient_user_id,dedupe_key) do nothing;
  end if;
  return jsonb_build_object('id',v_tx.id,'attempt_id',v_attempt.id,
    'status',case when v_terminal then 'failed' else 'retry_wait' end,'retry_after',v_next,'exhausted',v_terminal);
end;
$$;

create or replace function public.record_communication_provider_outcome(
  p_provider_name text,
  p_provider_event_key text,
  p_provider_reference text,
  p_event_type text,
  p_outcome text,
  p_failure_code text default null,
  p_failure_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_event public.communication_provider_events%rowtype;
  v_tx public.communication_transmissions%rowtype;
  v_attempt public.communication_delivery_attempts%rowtype;
  v_terminal boolean := false;
  v_next timestamptz;
  v_status text;
begin
  if lower(p_outcome) not in ('delivered','failed','delayed','ignored') then
    raise exception 'Invalid provider outcome.' using errcode='22023';
  end if;
  select * into v_event from public.communication_provider_events
    where provider_name=lower(p_provider_name) and provider_event_key=p_provider_event_key for update;
  if not found then raise exception 'Provider event was not persisted.' using errcode='P0002'; end if;
  if v_event.processing_status in ('processed','ignored') then
    return jsonb_build_object('status','duplicate','provider_event_id',v_event.id);
  end if;
  select * into v_tx from public.communication_transmissions
    where provider_name=lower(p_provider_name) and provider_reference=p_provider_reference for update;
  if not found then
    update public.communication_provider_events set processing_status='ignored',processed_at=now()
      where id=v_event.id;
    return jsonb_build_object('status','ignored','provider_event_id',v_event.id);
  end if;
  select * into v_attempt from public.communication_delivery_attempts
    where transmission_id=v_tx.id order by attempt_number desc limit 1 for update;
  if lower(p_outcome)='delivered' then
    update public.communication_transmissions set status='delivered',delivered_at=now(),failure_code=null,
      failure_message=null,next_retry_at=null where id=v_tx.id;
    if v_attempt.id is not null then
      update public.communication_delivery_attempts set status='delivered',finished_at=now(),
        provider_reference=coalesce(provider_reference,p_provider_reference),failure_code=null,failure_message=null
      where id=v_attempt.id;
    end if;
    v_status:='delivered';
  elsif lower(p_outcome)='failed' then
    v_terminal:=coalesce(v_attempt.attempt_number,v_tx.attempt_count)>=v_tx.max_attempts;
    v_next:=case when v_terminal then null else now()+(interval '1 minute'*power(2,greatest(coalesce(v_attempt.attempt_number,v_tx.attempt_count),1)-1)) end;
    update public.communication_transmissions set
      status=case when v_terminal then 'failed' else 'retry_wait' end,
      failure_code=coalesce(nullif(p_failure_code,''),p_event_type),
      failure_message=left(coalesce(nullif(p_failure_message,''),'Provider reported delivery failure.'),500),
      next_retry_at=v_next where id=v_tx.id;
    if v_attempt.id is not null then
      update public.communication_delivery_attempts set
        status=case when v_terminal then 'exhausted' else 'retry_wait' end,
        failure_code=coalesce(nullif(p_failure_code,''),p_event_type),
        failure_message=left(coalesce(nullif(p_failure_message,''),'Provider reported delivery failure.'),500),finished_at=now()
      where id=v_attempt.id;
    end if;
    v_status:=case when v_terminal then 'failed' else 'retry_wait' end;
  elsif lower(p_outcome)='delayed' then
    update public.communication_transmissions set failure_code='delivery_delayed',
      failure_message='Provider reported delayed delivery.' where id=v_tx.id;
    v_status:='sent';
  else
    v_status:=v_tx.status;
  end if;
  if lower(p_event_type) in ('email.bounced','email.complained') then
    insert into public.communication_suppressions(workspace_id,channel,destination,reason,source)
    values(v_tx.workspace_id,'email',v_tx.destination,
      case when lower(p_event_type)='email.complained' then 'Recipient reported spam' else 'Permanent email bounce' end,
      lower(p_provider_name)||'_webhook')
    on conflict(workspace_id,channel,destination) where released_at is null do nothing;
  end if;
  if v_tx.subject_type='lead' and lower(p_outcome) in ('delivered','failed') and not exists(
    select 1 from public.lead_activities la where la.request_id=v_event.id
  ) then
    insert into public.lead_activities(workspace_id,lead_id,user_id,activity_type,outcome,notes,request_id)
    values(v_tx.workspace_id,v_tx.subject_id::bigint,v_tx.created_by,
      'communication_'||lower(p_outcome),v_status,
      v_tx.channel||' provider event: '||p_event_type,v_event.id);
  end if;
  if v_terminal then
    insert into public.notifications(workspace_id,recipient_user_id,notification_type,title,body,related_entity_type,related_entity_id,deep_link,dedupe_key)
    select v_tx.workspace_id,wm.user_id,'communication_failed','Communication delivery failed',
      'A provider-backed '||v_tx.channel||' exhausted its delivery attempts.','communication',v_tx.id,
      '/manual-communications','communication:'||v_tx.id::text||':exhausted'
    from public.workspace_members wm where wm.workspace_id=v_tx.workspace_id and lower(wm.role) in ('owner','manager')
    on conflict(recipient_user_id,dedupe_key) do nothing;
  end if;
  update public.communication_provider_events set workspace_id=v_tx.workspace_id,transmission_id=v_tx.id,
    processing_status=case when lower(p_outcome)='ignored' then 'ignored' else 'processed' end,
    error_message=null,processed_at=now() where id=v_event.id;
  return jsonb_build_object('status',v_status,'transmission_id',v_tx.id,'provider_event_id',v_event.id,
    'retry_after',v_next,'exhausted',v_terminal);
end;
$$;

alter table public.notifications drop constraint if exists notifications_notification_type_check;
alter table public.notifications add constraint notifications_notification_type_check check(notification_type in (
  'assignment_offered','assignment_accepted','assignment_rejected','assignment_cancelled',
  'appointment_scheduled','appointment_completed','appointment_cancelled','appointment_no_show',
  'message_received','incoming_call','missed_call','voicemail','communication_failed'
));
alter table public.notifications drop constraint if exists notifications_related_entity_type_check;
alter table public.notifications add constraint notifications_related_entity_type_check check(related_entity_type in (
  'assignment','appointment','conversation','call_session','communication'
));

revoke all on function public.begin_communication_delivery_attempt(uuid) from public,anon,authenticated;
revoke all on function public.complete_communication_delivery_attempt(uuid,text,text,text,text) from public,anon,authenticated;
revoke all on function public.record_communication_provider_outcome(text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.begin_communication_delivery_attempt(uuid) to service_role;
grant execute on function public.complete_communication_delivery_attempt(uuid,text,text,text,text) to service_role;
grant execute on function public.record_communication_provider_outcome(text,text,text,text,text,text,text) to service_role;
