-- Run only inside BEGIN/ROLLBACK against the clean non-production project.
-- This synthetic proof sends no email, SMS, or call.
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at)
values('48e50f8e-e9e1-4af2-8fd9-9255663dd001','00000000-0000-0000-0000-000000000000',
  'authenticated','authenticated','finish-fixture@invalid.example','!',now());
insert into public.workspaces(id,name,created_by)
values('48e50f8e-e9e1-4af2-8fd9-9255663dd002','Finish fixture','48e50f8e-e9e1-4af2-8fd9-9255663dd001');
insert into public.workspace_members(workspace_id,user_id,role)
values('48e50f8e-e9e1-4af2-8fd9-9255663dd002','48e50f8e-e9e1-4af2-8fd9-9255663dd001','owner')
on conflict do nothing;
insert into public.leads(id,workspace_id,phone,email,full_name)
values
  (984001,'48e50f8e-e9e1-4af2-8fd9-9255663dd002','717-555-0142','first@invalid.example','First'),
  (984002,'48e50f8e-e9e1-4af2-8fd9-9255663dd002','+1 (717) 555-0142','second@invalid.example','Second');

do $proof$
declare v_match jsonb;
begin
  v_match:=public.resolve_communication_subject('48e50f8e-e9e1-4af2-8fd9-9255663dd002','sms','+1 717-555-0142');
  if v_match->>'status'<>'ambiguous' or (v_match->>'candidate_count')::integer<>2
    or v_match?'subject_id' then raise exception 'Shared phone was attached to a subject'; end if;
  v_match:=public.resolve_communication_subject('48e50f8e-e9e1-4af2-8fd9-9255663dd002','email','FIRST@invalid.example');
  if v_match->>'status'<>'matched' or v_match->>'subject_id'<>'984001'
    then raise exception 'Unique email failed to resolve'; end if;
  if public.resolve_communication_subject('48e50f8e-e9e1-4af2-8fd9-9255663dd002','sms','717-555-0199') is not null
    then raise exception 'Unknown endpoint was attached'; end if;
end $proof$;

insert into public.communication_compliance_checks(
  id,workspace_id,actor_user_id,subject_type,subject_id,channel,provider_name,
  purpose,direction,decision,reasons,requested_automated,requested_prerecorded_or_ai_voice,requested_recording
) values(
  '48e50f8e-e9e1-4af2-8fd9-9255663dd003','48e50f8e-e9e1-4af2-8fd9-9255663dd002',
  '48e50f8e-e9e1-4af2-8fd9-9255663dd001','lead','984001','email','resend','service',
  'outbound','ALLOW','[]'::jsonb,false,false,false
);
insert into public.communication_transmissions(
  id,workspace_id,subject_type,subject_id,channel,direction,purpose,destination,
  client_request_id,status,attempt_count,max_attempts,provider_name,provider_reference,created_by
) values
('48e50f8e-e9e1-4af2-8fd9-9255663dd004','48e50f8e-e9e1-4af2-8fd9-9255663dd002',
 'lead','984001','email','outbound','service','first@invalid.example',
 '48e50f8e-e9e1-4af2-8fd9-9255663dd014','sent',1,3,'resend','proof-provider-ref',
 '48e50f8e-e9e1-4af2-8fd9-9255663dd001'),
('48e50f8e-e9e1-4af2-8fd9-9255663dd005','48e50f8e-e9e1-4af2-8fd9-9255663dd002',
 'lead','984001','email','outbound','service','first@invalid.example',
 '48e50f8e-e9e1-4af2-8fd9-9255663dd015','retry_wait',1,3,'resend',null,
 '48e50f8e-e9e1-4af2-8fd9-9255663dd001'),
('48e50f8e-e9e1-4af2-8fd9-9255663dd006','48e50f8e-e9e1-4af2-8fd9-9255663dd002',
 'lead','984001','email','outbound','service','first@invalid.example',
 '48e50f8e-e9e1-4af2-8fd9-9255663dd016','sending',1,3,'resend',null,
 '48e50f8e-e9e1-4af2-8fd9-9255663dd001'),
('48e50f8e-e9e1-4af2-8fd9-9255663dd007','48e50f8e-e9e1-4af2-8fd9-9255663dd002',
 'lead','984001','email','outbound','service','first@invalid.example',
 '48e50f8e-e9e1-4af2-8fd9-9255663dd017','sent',1,3,'resend','proof-failure-first-ref',
 '48e50f8e-e9e1-4af2-8fd9-9255663dd001');
update public.communication_transmissions set next_retry_at=now()-interval '1 minute'
where id='48e50f8e-e9e1-4af2-8fd9-9255663dd005';
update public.communication_transmissions set last_attempt_at=now()-interval '11 minutes'
where id='48e50f8e-e9e1-4af2-8fd9-9255663dd006';
insert into public.communication_delivery_attempts(
  workspace_id,transmission_id,compliance_check_id,attempt_number,status,provider_reference,finished_at
) values(
 '48e50f8e-e9e1-4af2-8fd9-9255663dd002','48e50f8e-e9e1-4af2-8fd9-9255663dd004',
 '48e50f8e-e9e1-4af2-8fd9-9255663dd003',1,'accepted','proof-provider-ref',now()
),(
 '48e50f8e-e9e1-4af2-8fd9-9255663dd002','48e50f8e-e9e1-4af2-8fd9-9255663dd007',
 '48e50f8e-e9e1-4af2-8fd9-9255663dd003',1,'accepted','proof-failure-first-ref',now()
);
insert into public.communication_provider_events(provider_name,provider_event_key,event_type,payload_sha256,processing_status)
values('resend','proof-delivered','email.delivered',repeat('a',64),'received'),
  ('resend','proof-failed-late','email.failed',repeat('b',64),'received'),
  ('resend','proof-failed-first','email.failed',repeat('c',64),'received'),
  ('resend','proof-delivered-late','email.delivered',repeat('d',64),'received');

do $proof$
declare v_result jsonb; v_count integer;
begin
  v_result:=public.record_communication_provider_outcome('resend','proof-delivered','proof-provider-ref',
    'email.delivered','delivered');
  if v_result->>'status'<>'delivered' then raise exception 'Delivery callback failed'; end if;
  v_result:=public.record_communication_provider_outcome('resend','proof-failed-late','proof-provider-ref',
    'email.failed','failed');
  if v_result->>'status'<>'delivered' then raise exception 'Late failure overwrote delivered'; end if;
  v_result:=public.record_communication_provider_outcome('resend','proof-delivered','proof-provider-ref',
    'email.delivered','delivered');
  if v_result->>'status'<>'duplicate' then raise exception 'Callback replay changed state'; end if;
  v_result:=public.record_communication_provider_outcome('resend','proof-failed-first','proof-failure-first-ref',
    'email.failed','failed');
  if v_result->>'status'<>'retry_wait' then raise exception 'First failure did not enter retry wait'; end if;
  v_result:=public.record_communication_provider_outcome('resend','proof-delivered-late','proof-failure-first-ref',
    'email.delivered','delivered');
  if v_result->>'status'<>'delivered' or (select next_retry_at from public.communication_transmissions
      where id='48e50f8e-e9e1-4af2-8fd9-9255663dd007') is not null
    then raise exception 'Delayed delivery did not cancel scheduled retry'; end if;
  select count(*) into v_count from public.lead_activities
    where request_id in (select id from public.communication_provider_events
      where provider_event_key in ('proof-delivered','proof-failed-late'));
  if v_count<>1 then raise exception 'CRM evidence was duplicated: %',v_count; end if;
  if (select count(*) from public.list_due_communication_retries(20)
      where transmission_id='48e50f8e-e9e1-4af2-8fd9-9255663dd005')<>1
    then raise exception 'Due retry was not picked up'; end if;
  if public.quarantine_stale_communication_attempts(interval '10 minutes')<>1
    then raise exception 'Lost provider response was not quarantined'; end if;
  if (select status from public.communication_transmissions
      where id='48e50f8e-e9e1-4af2-8fd9-9255663dd006')<>'review'
    then raise exception 'Unknown provider outcome was retried'; end if;
  if public.run_hlc_communication_retry_pickup()->>'status'<>'disabled'
    then raise exception 'Unconfigured scheduler was not inert'; end if;
end $proof$;

-- The fake endpoint request is queued by pg_net only inside this rolled-back
-- transaction. It never reaches a provider or an Edge Function.
insert into internal.communication_retry_dispatch_config(
  singleton,edge_url,dispatch_token,publishable_jwt,enabled
) values(
 true,'https://example.invalid/functions/v1/send-communication',
 repeat('t',40),repeat('j',40),true
);
do $proof$
declare v_result jsonb;
begin
  v_result:=public.run_hlc_communication_retry_pickup();
  if v_result->>'status'<>'dispatched' or (v_result->>'dispatched')::integer<>1
    then raise exception 'Due retry worker did not enqueue exactly one pickup: %',v_result; end if;
end $proof$;
