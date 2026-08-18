-- Align canonical communication compliance with the providers used by
-- supabase/functions/send-communication.
--
-- Email is delivered by Resend. SMS and call are delivered by Twilio.
-- Device-native/manual provider checks may still pass an explicit provider name.

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
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_destination text;
  v_state text;
  v_provider_name text;
  v_check_id uuid;
  v_reasons jsonb := '[]'::jsonb;
  v_decision text := 'ALLOW';
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  select p.workspace_id
    into v_workspace_id
  from public.profiles p
  where p.user_id = auth.uid();

  if not exists(
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_workspace_id
      and wm.user_id = auth.uid()
  ) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  if lower(p_subject_type) = 'lead' then
    select
      case when lower(p_channel) = 'email'
        then lower(l.email)
        else regexp_replace(l.phone,'[() .-]','','g')
      end,
      null::text
    into v_destination, v_state
    from public.leads l
    where l.id = p_subject_id::bigint
      and l.workspace_id = v_workspace_id;

    if not found then
      raise exception 'Lead is not in the current workspace.' using errcode='42501';
    end if;
  elsif lower(p_subject_type) = 'contractor' then
    select
      case when lower(p_channel) = 'email'
        then lower(c.email)
        else regexp_replace(c.phone,'[() .-]','','g')
      end,
      upper(c.state)
    into v_destination, v_state
    from public.contractors c
    where c.id = p_subject_id::bigint
      and c.workspace_id = v_workspace_id;

    if not found then
      raise exception 'Contractor is not in the current workspace.' using errcode='42501';
    end if;
  else
    raise exception 'Invalid subject type.' using errcode='22023';
  end if;

  v_provider_name := coalesce(
    nullif(lower(btrim(p_provider_name)), ''),
    case lower(p_channel)
      when 'email' then 'resend'
      when 'sms' then 'twilio'
      when 'call' then 'twilio'
      else 'unconfigured'
    end
  );

  if v_destination is null or v_destination = '' then
    v_decision := 'BLOCK';
    v_reasons := v_reasons || '["destination_missing"]'::jsonb;
  end if;

  if v_provider_name <> 'device_native'
    and not exists(
      select 1
      from public.communication_provider_connections pc
      where pc.workspace_id = v_workspace_id
        and pc.channel = lower(p_channel)
        and pc.provider_name = v_provider_name
        and (
          pc.status = 'connected'
          or (v_provider_name = 'google_voice' and pc.status = 'manual_available')
        )
    )
  then
    v_decision := 'BLOCK';
    v_reasons := v_reasons || '["provider_not_connected"]'::jsonb;
  end if;

  if exists(
    select 1
    from public.communication_suppressions s
    where s.workspace_id = v_workspace_id
      and s.channel = lower(p_channel)
      and s.destination = v_destination
      and s.released_at is null
  ) then
    v_decision := 'BLOCK';
    v_reasons := v_reasons || '["destination_suppressed"]'::jsonb;
  end if;

  if lower(p_direction) = 'outbound' and lower(p_purpose) = 'marketing' then
    if lower(p_channel) = 'call'
      and (
        extract(hour from now() at time zone 'America/New_York') < 8
        or extract(hour from now() at time zone 'America/New_York') >= 21
      )
    then
      v_decision := 'BLOCK';
      v_reasons := v_reasons || '["outside_permitted_calling_window"]'::jsonb;
    end if;

    if v_state is null then
      if v_decision <> 'BLOCK' then v_decision := 'REVIEW'; end if;
      v_reasons := v_reasons || '["contact_location_unknown"]'::jsonb;
    end if;

    if lower(p_channel) in ('call','sms')
      and not exists(
        select 1
        from public.communication_dnc_screenings d
        where d.workspace_id = v_workspace_id
          and d.destination = v_destination
          and d.result = 'clear'
          and d.expires_at > now()
      )
    then
      if v_decision <> 'BLOCK' then v_decision := 'REVIEW'; end if;
      v_reasons := v_reasons || '["dnc_screening_required"]'::jsonb;
    end if;
  end if;

  if lower(p_channel) = 'sms'
    and not exists(
      select 1
      from public.communication_consents c
      where c.workspace_id = v_workspace_id
        and c.subject_type = lower(p_subject_type)
        and c.subject_id = p_subject_id
        and c.channel = 'sms'
        and c.purpose = lower(p_purpose)
        and c.status = 'granted'
        and c.revoked_at is null
    )
  then
    v_decision := 'BLOCK';
    v_reasons := v_reasons || '["sms_consent_not_proven"]'::jsonb;
  end if;

  if p_requested_automated or p_requested_prerecorded_or_ai_voice then
    if v_decision <> 'BLOCK' then v_decision := 'REVIEW'; end if;
    v_reasons := v_reasons || '["automated_or_prerecorded_review_required"]'::jsonb;
  end if;

  if p_requested_recording
    and not exists(
      select 1
      from public.communication_consents c
      where c.workspace_id = v_workspace_id
        and c.subject_type = lower(p_subject_type)
        and c.subject_id = p_subject_id
        and c.channel = 'recording'
        and c.status = 'granted'
        and c.revoked_at is null
    )
  then
    v_decision := 'BLOCK';
    v_reasons := v_reasons || '["recording_consent_not_proven"]'::jsonb;
  end if;

  insert into public.communication_compliance_checks(
    workspace_id,
    actor_user_id,
    subject_type,
    subject_id,
    channel,
    provider_name,
    purpose,
    direction,
    decision,
    reasons,
    requested_automated,
    requested_prerecorded_or_ai_voice,
    requested_recording
  ) values (
    v_workspace_id,
    auth.uid(),
    lower(p_subject_type),
    p_subject_id,
    lower(p_channel),
    v_provider_name,
    lower(p_purpose),
    lower(p_direction),
    v_decision,
    v_reasons,
    p_requested_automated,
    p_requested_prerecorded_or_ai_voice,
    p_requested_recording
  )
  returning id into v_check_id;

  return jsonb_build_object(
    'id', v_check_id,
    'decision', v_decision,
    'reasons', v_reasons,
    'provider_ready', v_provider_name = 'device_native' or not (v_reasons ? 'provider_not_connected')
  );
end;
$function$;

create or replace function public.queue_communication_transmission(
  p_subject_type text,
  p_subject_id text,
  p_channel text,
  p_purpose text,
  p_content text,
  p_client_request_id uuid,
  p_conversation_id uuid default null,
  p_message_id uuid default null
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

  select p.workspace_id
    into v_workspace_id
  from public.profiles p
  where p.user_id = auth.uid();

  if not exists(
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_workspace_id
      and wm.user_id = auth.uid()
  ) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  if lower(p_channel) not in ('sms','email','call') then
    raise exception 'Unsupported communication channel.' using errcode='22023';
  end if;

  v_provider_name := case lower(p_channel)
    when 'email' then 'resend'
    when 'sms' then 'twilio'
    when 'call' then 'twilio'
  end;

  select t.id, t.status, t.compliance_check_id
    into v_transmission_id, v_status, v_check_id
  from public.communication_transmissions t
  where t.workspace_id = v_workspace_id
    and t.channel = lower(p_channel)
    and t.client_request_id = p_client_request_id;

  if v_transmission_id is not null then
    select jsonb_build_object('decision', cc.decision, 'reasons', cc.reasons)
      into v_check
    from public.communication_compliance_checks cc
    where cc.id = v_check_id;

    return jsonb_build_object(
      'id', v_transmission_id,
      'decision', coalesce(v_check->>'decision','BLOCK'),
      'status', v_status,
      'reasons', coalesce(v_check->'reasons','[]'::jsonb)
    );
  end if;

  if lower(p_subject_type) = 'lead' then
    select case when lower(p_channel) = 'email'
      then lower(l.email)
      else regexp_replace(l.phone,'[() .-]','','g')
    end
    into v_destination
    from public.leads l
    where l.id = p_subject_id::bigint
      and l.workspace_id = v_workspace_id;
  elsif lower(p_subject_type) = 'contractor' then
    select case when lower(p_channel) = 'email'
      then lower(c.email)
      else regexp_replace(c.phone,'[() .-]','','g')
    end
    into v_destination
    from public.contractors c
    where c.id = p_subject_id::bigint
      and c.workspace_id = v_workspace_id;
  else
    raise exception 'Invalid subject type.' using errcode='22023';
  end if;

  if p_conversation_id is not null
    and not exists(
      select 1
      from public.conversations c
      where c.id = p_conversation_id
        and c.workspace_id = v_workspace_id
    )
  then
    raise exception 'Conversation is not in the current workspace.' using errcode='42501';
  end if;

  if p_message_id is not null
    and not exists(
      select 1
      from public.messages m
      where m.id = p_message_id
        and m.conversation_id = p_conversation_id
        and m.workspace_id = v_workspace_id
    )
  then
    raise exception 'Message is not in the selected conversation.' using errcode='42501';
  end if;

  v_check := public.evaluate_communication_compliance(
    lower(p_subject_type),
    p_subject_id,
    lower(p_channel),
    lower(p_purpose),
    'outbound',
    false,
    false,
    false,
    v_provider_name
  );
  v_decision := v_check->>'decision';

  select cc.id
    into v_check_id
  from public.communication_compliance_checks cc
  where cc.workspace_id = v_workspace_id
    and cc.actor_user_id = auth.uid()
  order by cc.created_at desc
  limit 1;

  v_status := case v_decision
    when 'ALLOW' then 'queued'
    when 'REVIEW' then 'review'
    else 'blocked'
  end;

  insert into public.communication_transmissions(
    workspace_id,
    conversation_id,
    message_id,
    compliance_check_id,
    subject_type,
    subject_id,
    channel,
    direction,
    purpose,
    destination,
    content,
    provider_name,
    client_request_id,
    status,
    created_by
  ) values (
    v_workspace_id,
    p_conversation_id,
    p_message_id,
    v_check_id,
    lower(p_subject_type),
    p_subject_id,
    lower(p_channel),
    'outbound',
    lower(p_purpose),
    coalesce(v_destination,''),
    nullif(btrim(coalesce(p_content,'')),''),
    v_provider_name,
    p_client_request_id,
    v_status,
    auth.uid()
  )
  on conflict(workspace_id, channel, client_request_id)
  do update set client_request_id = public.communication_transmissions.client_request_id
  returning id into v_transmission_id;

  return jsonb_build_object(
    'id', v_transmission_id,
    'decision', v_decision,
    'status', v_status,
    'reasons', v_check->'reasons'
  );
end;
$function$;
