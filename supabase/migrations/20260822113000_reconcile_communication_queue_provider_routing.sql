-- Source-control reconciliation for canonical production communication routing.
--
-- Canonical production already runs this exact queue function. This migration
-- preserves the live Resend/Twilio provider selection in the ordered source
-- migration chain without widening browser privileges or changing compliance
-- semantics.

create or replace function public.queue_communication_transmission(
  p_subject_type text,
  p_subject_id text,
  p_channel text,
  p_purpose text,
  p_content text,
  p_client_request_id uuid,
  p_conversation_id uuid default null::uuid,
  p_message_id uuid default null::uuid
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_destination text;
  v_check jsonb;
  v_check_id uuid;
  v_decision text;
  v_status text;
  v_transmission_id uuid;
  v_provider_name text;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  select p.workspace_id into v_workspace_id
  from public.profiles p
  where p.user_id=auth.uid();

  if not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()
  ) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  if lower(p_channel) not in ('sms','email','call') then
    raise exception 'Unsupported communication channel.' using errcode='22023';
  end if;

  v_provider_name := case
    when lower(p_channel) in ('sms','call') then 'twilio'
    when lower(p_channel)='email' then 'resend'
    else null
  end;

  select t.id,t.status,t.compliance_check_id
    into v_transmission_id,v_status,v_check_id
  from public.communication_transmissions t
  where t.workspace_id=v_workspace_id
    and t.channel=lower(p_channel)
    and t.client_request_id=p_client_request_id;

  if v_transmission_id is not null then
    select jsonb_build_object('decision',cc.decision,'reasons',cc.reasons)
      into v_check
    from public.communication_compliance_checks cc
    where cc.id=v_check_id;
    return jsonb_build_object(
      'id',v_transmission_id,
      'decision',coalesce(v_check->>'decision','BLOCK'),
      'status',v_status,
      'reasons',coalesce(v_check->'reasons','[]'::jsonb)
    );
  end if;

  if lower(p_subject_type)='lead' then
    select case when lower(p_channel)='email' then lower(l.email)
                else regexp_replace(l.phone,'[() .-]','','g') end
      into v_destination
    from public.leads l
    where l.id=p_subject_id::bigint and l.workspace_id=v_workspace_id;
  elsif lower(p_subject_type)='contractor' then
    select case when lower(p_channel)='email' then lower(c.email)
                else regexp_replace(c.phone,'[() .-]','','g') end
      into v_destination
    from public.contractors c
    where c.id=p_subject_id::bigint and c.workspace_id=v_workspace_id;
  else
    raise exception 'Invalid subject type.' using errcode='22023';
  end if;

  if p_conversation_id is not null and not exists (
    select 1 from public.conversations c
    where c.id=p_conversation_id and c.workspace_id=v_workspace_id
  ) then
    raise exception 'Conversation is not in the current workspace.' using errcode='42501';
  end if;

  if p_message_id is not null and not exists (
    select 1 from public.messages m
    where m.id=p_message_id
      and m.conversation_id=p_conversation_id
      and m.workspace_id=v_workspace_id
  ) then
    raise exception 'Message is not in the selected conversation.' using errcode='42501';
  end if;

  v_check := public.evaluate_communication_compliance(
    lower(p_subject_type),p_subject_id,lower(p_channel),lower(p_purpose),'outbound',
    false,false,false,v_provider_name
  );
  v_decision := v_check->>'decision';

  select cc.id into v_check_id
  from public.communication_compliance_checks cc
  where cc.workspace_id=v_workspace_id and cc.actor_user_id=auth.uid()
  order by cc.created_at desc limit 1;

  v_status := case v_decision when 'ALLOW' then 'queued' when 'REVIEW' then 'review' else 'blocked' end;

  insert into public.communication_transmissions(
    workspace_id,conversation_id,message_id,compliance_check_id,subject_type,subject_id,channel,direction,
    purpose,destination,content,provider_name,client_request_id,status,created_by
  ) values (
    v_workspace_id,p_conversation_id,p_message_id,v_check_id,lower(p_subject_type),p_subject_id,
    lower(p_channel),'outbound',lower(p_purpose),coalesce(v_destination,''),
    nullif(btrim(coalesce(p_content,'')),''),v_provider_name,p_client_request_id,v_status,auth.uid()
  )
  on conflict(workspace_id,channel,client_request_id)
  do update set client_request_id=public.communication_transmissions.client_request_id
  returning id into v_transmission_id;

  return jsonb_build_object(
    'id',v_transmission_id,
    'decision',v_decision,
    'status',v_status,
    'reasons',v_check->'reasons'
  );
end;
$function$;
