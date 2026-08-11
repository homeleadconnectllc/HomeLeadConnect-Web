-- The existing call-log trigger uses ON CONFLICT (job_key). PostgreSQL cannot
-- infer the legacy partial unique index, so ordinary call logging fails. A full
-- unique index retains multiple NULL keys while making the trigger target valid.
drop index if exists public.queue_jobs_job_key_uq;
create unique index queue_jobs_job_key_uq on public.queue_jobs(job_key);

create or replace function public.update_lead_priority_from_call_logs()
returns trigger language plpgsql set search_path='pg_catalog','public','auth' as $$
begin
  insert into public.queue_jobs(workspace_id,job_type,payload,status,run_at,attempt_no,max_attempts,priority,job_key,created_at,updated_at)
  values(new.workspace_id,'recompute_lead_priority',jsonb_build_object('lead_id',new.lead_id),'queued',now(),0,5,10,
    'lead:'||new.lead_id||':recompute_priority',now(),now())
  on conflict(job_key) do update set run_at=excluded.run_at,updated_at=now(),status='queued';
  return new;
end; $$;

alter table public.communication_transmissions drop constraint communication_transmissions_status_check;
alter table public.communication_transmissions add constraint communication_transmissions_status_check
  check(status in ('blocked','review','queued','sending','sent','delivered','received','failed','cancelled','manually_logged'));
alter table public.communication_transmissions add column evidence_source text not null default 'provider'
  check(evidence_source in ('provider','operator_reported'));
alter table public.communication_transmissions add column manual_outcome text;
alter table public.communication_transmissions add column operator_notes text;
alter table public.communication_transmissions add constraint communication_transmissions_manual_evidence_check check (
  (provider_name='google_voice' and status='manually_logged' and evidence_source='operator_reported'
    and provider_reference is null and sent_at is null and delivered_at is null
    and char_length(btrim(coalesce(manual_outcome,''))) between 2 and 80)
  or provider_name<>'google_voice'
);

create or replace function public.configure_google_voice_manual_channel(p_sender_identity text)
returns void language plpgsql security definer set search_path='' as $$
declare v_workspace_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;
  if char_length(btrim(coalesce(p_sender_identity,'')))<7 then
    raise exception 'Enter the Google Voice business number.' using errcode='22023';
  end if;
  insert into public.communication_provider_connections(workspace_id,channel,status,provider_name,sender_identity)
  values
    (v_workspace_id,'sms','manual_available','google_voice',btrim(p_sender_identity)),
    (v_workspace_id,'call','manual_available','google_voice',btrim(p_sender_identity))
  on conflict(workspace_id,channel,provider_name) do update
    set status='manual_available',sender_identity=excluded.sender_identity,verified_at=null,updated_at=now();
end; $$;

create or replace function public.log_google_voice_activity(
  p_subject_type text,p_subject_id text,p_channel text,p_direction text,p_purpose text,
  p_outcome text,p_notes text,p_client_request_id uuid,p_compliance_check_id uuid default null,
  p_conversation_id uuid default null
)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_workspace_id uuid; v_destination text; v_id uuid; v_lead_id bigint;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;
  if lower(p_channel) not in ('sms','call') or lower(p_direction) not in ('inbound','outbound') then
    raise exception 'Google Voice logging supports interactive calls and texts.' using errcode='22023';
  end if;
  if char_length(btrim(coalesce(p_outcome,''))) not between 2 and 80 or char_length(coalesce(p_notes,''))>2000 then
    raise exception 'Enter a short outcome; notes may contain up to 2,000 characters.' using errcode='22023';
  end if;
  if lower(p_subject_type)='lead' then
    select l.id,regexp_replace(l.phone,'[() .-]','','g') into v_lead_id,v_destination
    from public.leads l where l.id=p_subject_id::bigint and l.workspace_id=v_workspace_id;
    if not found then raise exception 'Lead is not in the current workspace.' using errcode='42501'; end if;
  elsif lower(p_subject_type)='contractor' then
    select regexp_replace(c.phone,'[() .-]','','g') into v_destination
    from public.contractors c where c.id=p_subject_id::bigint and c.workspace_id=v_workspace_id;
    if not found then raise exception 'Contractor is not in the current workspace.' using errcode='42501'; end if;
  else raise exception 'Invalid subject type.' using errcode='22023'; end if;
  if v_destination is null or v_destination='' then raise exception 'The selected contact has no phone number.' using errcode='22023'; end if;
  if p_conversation_id is not null and not exists(select 1 from public.conversations c where c.id=p_conversation_id and c.workspace_id=v_workspace_id) then
    raise exception 'Conversation is not in the current workspace.' using errcode='42501';
  end if;
  if lower(p_direction)='outbound' and not exists(
    select 1 from public.communication_compliance_checks cc
    where cc.id=p_compliance_check_id and cc.workspace_id=v_workspace_id and cc.actor_user_id=auth.uid()
      and cc.subject_type=lower(p_subject_type) and cc.subject_id=p_subject_id and cc.channel=lower(p_channel)
      and cc.provider_name='google_voice' and cc.purpose=lower(p_purpose) and cc.direction='outbound'
      and cc.decision='ALLOW' and cc.created_at>now()-interval '30 minutes'
  ) then raise exception 'A current ALLOW compliance check is required before logging an outbound Google Voice action.' using errcode='42501'; end if;

  insert into public.communication_transmissions(workspace_id,conversation_id,compliance_check_id,subject_type,subject_id,
    channel,direction,purpose,destination,provider_name,client_request_id,status,evidence_source,manual_outcome,operator_notes,
    attempt_count,created_by)
  values(v_workspace_id,p_conversation_id,p_compliance_check_id,lower(p_subject_type),p_subject_id,lower(p_channel),
    lower(p_direction),lower(p_purpose),v_destination,'google_voice',p_client_request_id,'manually_logged',
    'operator_reported',btrim(p_outcome),nullif(btrim(coalesce(p_notes,'')),''),1,auth.uid())
  on conflict(workspace_id,channel,client_request_id) do update set client_request_id=public.communication_transmissions.client_request_id
  returning id into v_id;

  if v_lead_id is not null and not exists(select 1 from public.lead_activities la where la.workspace_id=v_workspace_id and la.request_id=p_client_request_id) then
    insert into public.lead_activities(workspace_id,lead_id,user_id,activity_type,outcome,notes,request_id)
    values(v_workspace_id,v_lead_id,auth.uid(),case when lower(p_channel)='call' then 'manual_call' else 'manual_text' end,
      btrim(p_outcome),nullif(btrim(coalesce(p_notes,'')),''),p_client_request_id);
  end if;
  if v_lead_id is not null and lower(p_channel)='call' and not exists(select 1 from public.call_logs cl where cl.workspace_id=v_workspace_id and cl.request_id=p_client_request_id) then
    insert into public.call_logs(workspace_id,lead_id,outcome,request_id) values(v_workspace_id,v_lead_id,btrim(p_outcome),p_client_request_id);
  end if;
  return v_id;
end; $$;

revoke all on function public.configure_google_voice_manual_channel(text) from public,anon;
revoke all on function public.log_google_voice_activity(text,text,text,text,text,text,text,uuid,uuid,uuid) from public,anon;
grant execute on function public.configure_google_voice_manual_channel(text) to authenticated,service_role;
grant execute on function public.log_google_voice_activity(text,text,text,text,text,text,text,uuid,uuid,uuid) to authenticated,service_role;
