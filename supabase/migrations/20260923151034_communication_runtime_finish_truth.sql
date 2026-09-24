-- Keep unmatched provider evidence on the canonical event. It is service-only
-- and never assigned to an arbitrary CRM person when a number is shared.
alter table public.communication_provider_events
  add column if not exists unmatched_channel text,
  add column if not exists unmatched_source text,
  add column if not exists unmatched_content text,
  add column if not exists unmatched_reason text;

create index if not exists communication_transmissions_due_retry_idx
  on public.communication_transmissions(next_retry_at,id)
  where status='retry_wait' and direction='outbound' and evidence_source='provider';

-- The dispatch worker reads only due retries. begin_communication_delivery_attempt
-- locks the row and rechecks policy; duplicate workers cannot create two attempts.
create or replace function public.list_due_communication_retries(p_limit integer default 20)
returns table(transmission_id uuid)
language sql security definer set search_path=''
as $$
  select t.id from public.communication_transmissions t
  where t.status='retry_wait' and t.direction='outbound' and t.evidence_source='provider'
    and t.next_retry_at<=now() and t.attempt_count<t.max_attempts
  order by t.next_retry_at,t.id limit least(greatest(p_limit,1),20);
$$;
revoke all on function public.list_due_communication_retries(integer) from public,anon,authenticated;
grant execute on function public.list_due_communication_retries(integer) to service_role;

-- An attempt stuck while the provider response was lost has unknown outcome.
-- Never resend it automatically: require a human to reconcile provider evidence.
create or replace function public.quarantine_stale_communication_attempts(p_age interval default interval '10 minutes')
returns integer
language plpgsql security definer set search_path=''
as $$
declare v_count integer;
begin
  if p_age<interval '5 minutes' then raise exception 'Minimum reconciliation age is five minutes.' using errcode='22023'; end if;
  update public.communication_transmissions t set status='review',
    failure_code='PROVIDER_OUTCOME_UNKNOWN',
    failure_message='Provider response was lost; reconcile with the provider before retrying.'
  where t.status='sending' and t.last_attempt_at<now()-p_age
    and t.direction='outbound' and t.evidence_source='provider';
  get diagnostics v_count=row_count;
  return v_count;
end;
$$;
revoke all on function public.quarantine_stale_communication_attempts(interval) from public,anon,authenticated;
grant execute on function public.quarantine_stale_communication_attempts(interval) to service_role;

-- No endpoint or token is seeded. Scheduling is inert until an operator
-- installs the non-production worker URL and a matching Edge secret.
create table if not exists internal.communication_retry_dispatch_config (
  singleton boolean primary key default true check(singleton),
  edge_url text not null check(edge_url like 'https://%/functions/v1/send-communication'),
  dispatch_token text not null check(length(dispatch_token)>=32),
  publishable_jwt text not null check(length(publishable_jwt)>=20),
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table internal.communication_retry_dispatch_config enable row level security;
revoke all on internal.communication_retry_dispatch_config from public,anon,authenticated;
grant select on internal.communication_retry_dispatch_config to service_role;

create or replace function public.run_hlc_communication_retry_pickup()
returns jsonb language plpgsql security definer set search_path=''
as $$
declare v_config internal.communication_retry_dispatch_config%rowtype;
  v_due record; v_count integer := 0; v_quarantined integer := 0;
begin
  select * into v_config from internal.communication_retry_dispatch_config where singleton=true;
  if not found or not v_config.enabled then
    return jsonb_build_object('status','disabled','dispatched',0);
  end if;
  v_quarantined:=public.quarantine_stale_communication_attempts(interval '10 minutes');
  for v_due in select * from public.list_due_communication_retries(20) loop
    perform net.http_post(
      url:=v_config.edge_url,
      headers:=jsonb_build_object('Content-Type','application/json',
        'Authorization','Bearer '||v_config.publishable_jwt,
        'X-HLC-Communication-Worker',v_config.dispatch_token),
      body:=jsonb_build_object('transmissionId',v_due.transmission_id),
      timeout_milliseconds:=5000
    );
    v_count:=v_count+1;
  end loop;
  return jsonb_build_object('status','dispatched','dispatched',v_count,
    'unknown_outcome_quarantined',v_quarantined);
end;
$$;
revoke all on function public.run_hlc_communication_retry_pickup() from public,anon,authenticated;
grant execute on function public.run_hlc_communication_retry_pickup() to service_role;
select cron.schedule('hlc-communication-retry-minute','* * * * *',
  'select public.run_hlc_communication_retry_pickup();');

-- Callback precedence is based on the attempt's own provider reference.
-- An older failed callback cannot roll back a later delivery or a newer send.
create or replace function public.record_communication_provider_outcome(
  p_provider_name text,p_provider_event_key text,p_provider_reference text,
  p_event_type text,p_outcome text,p_failure_code text default null,p_failure_message text default null
)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare
  v_event public.communication_provider_events%rowtype;
  v_tx public.communication_transmissions%rowtype;
  v_attempt public.communication_delivery_attempts%rowtype;
  v_terminal boolean := false;
  v_next timestamptz;
  v_status text;
  v_outcome text := lower(p_outcome);
  v_effective boolean := false;
begin
  if v_outcome not in ('delivered','failed','delayed','ignored') then
    raise exception 'Invalid provider outcome.' using errcode='22023';
  end if;
  select * into v_event from public.communication_provider_events
    where provider_name=lower(p_provider_name) and provider_event_key=p_provider_event_key for update;
  if not found then raise exception 'Provider event was not persisted.' using errcode='P0002'; end if;
  if v_event.processing_status in ('processed','ignored') then
    return jsonb_build_object('status','duplicate','provider_event_id',v_event.id);
  end if;
  select a.* into v_attempt from public.communication_delivery_attempts a
    join public.communication_transmissions t on t.id=a.transmission_id
    where a.provider_reference=p_provider_reference and p_provider_reference is not null
      and t.provider_name=lower(p_provider_name)
      and a.status in ('accepted','delivered','retry_wait','exhausted')
    order by a.started_at desc limit 1 for update of a;
  if v_attempt.id is null then
    update public.communication_provider_events set processing_status='ignored',processed_at=now(),
      error_message='No accepted attempt matches this provider reference.' where id=v_event.id;
    return jsonb_build_object('status','ignored','provider_event_id',v_event.id);
  end if;
  select * into v_tx from public.communication_transmissions
    where id=v_attempt.transmission_id and provider_name=lower(p_provider_name) for update;
  if not found then
    update public.communication_provider_events set processing_status='ignored',processed_at=now() where id=v_event.id;
    return jsonb_build_object('status','ignored','provider_event_id',v_event.id);
  end if;
  if v_tx.status='delivered' then
    v_status:='delivered';
  elsif v_outcome='delivered' then
    update public.communication_transmissions set status='delivered',delivered_at=now(),
      failure_code=null,failure_message=null,next_retry_at=null where id=v_tx.id;
    update public.communication_delivery_attempts set status='delivered',finished_at=now(),
      failure_code=null,failure_message=null where id=v_attempt.id;
    v_status:='delivered';
    v_effective:=true;
  elsif v_outcome='failed' and v_attempt.status='accepted' and v_tx.status in ('sent','retry_wait') then
    v_terminal:=v_attempt.attempt_number>=v_tx.max_attempts;
    v_next:=case when v_terminal then null
      else now()+(interval '1 minute'*power(2,v_attempt.attempt_number-1)) end;
    update public.communication_delivery_attempts set
      status=case when v_terminal then 'exhausted' else 'retry_wait' end,
      failure_code=coalesce(nullif(p_failure_code,''),p_event_type),
      failure_message=left(coalesce(nullif(p_failure_message,''),'Provider reported delivery failure.'),500),
      finished_at=now() where id=v_attempt.id;
    -- A later attempt may already be in flight. Never overwrite its state.
    if v_tx.provider_reference=p_provider_reference then
      update public.communication_transmissions set status=case when v_terminal then 'failed' else 'retry_wait' end,
        failure_code=coalesce(nullif(p_failure_code,''),p_event_type),
        failure_message=left(coalesce(nullif(p_failure_message,''),'Provider reported delivery failure.'),500),
        next_retry_at=v_next where id=v_tx.id;
      v_status:=case when v_terminal then 'failed' else 'retry_wait' end;
      v_effective:=true;
    else
      v_status:=v_tx.status; v_terminal:=false;
    end if;
  elsif v_outcome='delayed' and v_tx.status='sent' and v_tx.provider_reference=p_provider_reference then
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
  if v_effective and v_tx.subject_type='lead' and v_outcome in ('delivered','failed')
    and not exists(select 1 from public.lead_activities la where la.request_id=v_event.id) then
    insert into public.lead_activities(workspace_id,lead_id,user_id,activity_type,outcome,notes,request_id)
    values(v_tx.workspace_id,v_tx.subject_id::bigint,v_tx.created_by,
      'communication_'||v_outcome,v_status,v_tx.channel||' provider event: '||p_event_type,v_event.id);
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
    processing_status=case when v_outcome='ignored' then 'ignored' else 'processed' end,
    error_message=null,processed_at=now() where id=v_event.id;
  return jsonb_build_object('status',v_status,'transmission_id',v_tx.id,
    'provider_event_id',v_event.id,'retry_after',v_next,'exhausted',v_terminal);
end;
$$;
revoke all on function public.record_communication_provider_outcome(text,text,text,text,text,text,text) from public,anon,authenticated;
grant execute on function public.record_communication_provider_outcome(text,text,text,text,text,text,text) to service_role;
