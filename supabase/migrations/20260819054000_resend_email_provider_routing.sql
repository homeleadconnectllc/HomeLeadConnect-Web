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
set search_path = ''
as $$
declare
  v_workspace_id uuid;
  v_destination text;
  v_state text;
  v_provider_name text;
  v_check_id uuid;
  v_reasons jsonb := '[]'::jsonb;
  v_decision text := 'ALLOW';
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  if lower(p_subject_type)='lead' then
    select case when lower(p_channel)='email' then lower(l.email) else regexp_replace(l.phone,'[() .-]','','g') end,
      null::text
    into v_destination,v_state from public.leads l where l.id=p_subject_id::bigint and l.workspace_id=v_workspace_id;
    if not found then raise exception 'Lead is not in the current workspace.' using errcode='42501'; end if;
  elsif lower(p_subject_type)='contractor' then
    select case when lower(p_channel)='email' then lower(c.email) else regexp_replace(c.phone,'[() .-]','','g') end,upper(c.state)
    into v_destination,v_state from public.contractors c where c.id=p_subject_id::bigint and c.workspace_id=v_workspace_id;
    if not found then raise exception 'Contractor is not in the current workspace.' using errcode='42501'; end if;
  else
    raise exception 'Invalid subject type.' using errcode='22023';
  end if;

  v_provider_name := coalesce(
    nullif(lower(btrim(p_provider_name)),''),
    case
      when lower(p_channel) in ('sms','call') then 'twilio'
      when lower(p_channel)='email' then 'resend'
      else 'unconfigured'
    end
  );

  if v_destination is null or v_destination='' then
    v_decision:='BLOCK';
    v_reasons:=v_reasons||'["destination_missing"]'::jsonb;
  end if;

  if not exists(
    select 1 from public.communication_provider_connections pc
    where pc.workspace_id=v_workspace_id
      and pc.channel=lower(p_channel)
      and pc.provider_name=v_provider_name
      and (pc.status='connected' or (v_provider_name='google_voice' and pc.status='manual_available'))
  ) then
    v_decision:='BLOCK';
    v_reasons:=v_reasons||'["provider_not_connected"]'::jsonb;
  end if;

  if exists(
    select 1 from public.communication_suppressions s
    where s.workspace_id=v_workspace_id
      and s.channel=lower(p_channel)
      and s.destination=v_destination
      and s.released_at is null
  ) then
    v_decision:='BLOCK';
    v_reasons:=v_reasons||'["destination_suppressed"]'::jsonb;
  end if;

  if lower(p_direction)='outbound' and lower(p_purpose)='marketing' then
    if lower(p_channel)='call' and (extract(hour from now() at time zone 'America/New_York')<8 or extract(hour from now() at time zone 'America/New_York')>=21) then
      v_decision:='BLOCK';
      v_reasons:=v_reasons||'["outside_permitted_calling_window"]'::jsonb;
    end if;
    if v_state is null then
      if v_decision<>'BLOCK' then v_decision:='REVIEW'; end if;
      v_reasons:=v_reasons||'["contact_location_unknown"]'::jsonb;
    end if;
    if lower(p_channel) in ('call','sms') and not exists(
      select 1 from public.communication_dnc_screenings d
      where d.workspace_id=v_workspace_id and d.destination=v_destination and d.result='clear' and d.expires_at>now()
    ) then
      if v_decision<>'BLOCK' then v_decision:='REVIEW'; end if;
      v_reasons:=v_reasons||'["dnc_screening_required"]'::jsonb;
    end if;
  end if;

  if lower(p_channel)='sms' and not exists(
    select 1 from public.communication_consents c
    where c.workspace_id=v_workspace_id
      and c.subject_type=lower(p_subject_type)
      and c.subject_id=p_subject_id
      and c.channel='sms'
      and c.purpose=lower(p_purpose)
      and c.status='granted'
      and c.revoked_at is null
  ) then
    v_decision:='BLOCK';
    v_reasons:=v_reasons||'["sms_consent_not_proven"]'::jsonb;
  end if;

  if p_requested_automated or p_requested_prerecorded_or_ai_voice then
    if v_decision<>'BLOCK' then v_decision:='REVIEW'; end if;
    v_reasons:=v_reasons||'["automated_or_prerecorded_review_required"]'::jsonb;
  end if;

  if p_requested_recording and not exists(
    select 1 from public.communication_consents c
    where c.workspace_id=v_workspace_id
      and c.subject_type=lower(p_subject_type)
      and c.subject_id=p_subject_id
      and c.channel='recording'
      and c.status='granted'
      and c.revoked_at is null
  ) then
    v_decision:='BLOCK';
    v_reasons:=v_reasons||'["recording_consent_not_proven"]'::jsonb;
  end if;

  insert into public.communication_compliance_checks(
    workspace_id,actor_user_id,subject_type,subject_id,channel,provider_name,purpose,direction,
    decision,reasons,requested_automated,requested_prerecorded_or_ai_voice,requested_recording
  ) values(
    v_workspace_id,auth.uid(),lower(p_subject_type),p_subject_id,lower(p_channel),v_provider_name,lower(p_purpose),lower(p_direction),
    v_decision,v_reasons,p_requested_automated,p_requested_prerecorded_or_ai_voice,p_requested_recording
  ) returning id into v_check_id;

  return jsonb_build_object(
    'id',v_check_id,
    'decision',v_decision,
    'reasons',v_reasons,
    'provider_ready',not(v_reasons?'provider_not_connected')
  );
end;
$$;

insert into public.communication_provider_connections(
  workspace_id, channel, status, provider_name, sender_identity, verified_at, updated_at
)
select
  w.id,
  'email',
  'connected',
  'resend',
  'notifications@mail.homeleadconnect.org',
  now(),
  now()
from public.workspaces w
where exists (
  select 1 from public.workspace_members wm where wm.workspace_id=w.id
)
on conflict (workspace_id, channel) do update
set status='connected',
    provider_name='resend',
    sender_identity='notifications@mail.homeleadconnect.org',
    verified_at=coalesce(public.communication_provider_connections.verified_at, now()),
    updated_at=now();
