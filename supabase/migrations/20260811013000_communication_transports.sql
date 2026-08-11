create table public.communication_transmissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  compliance_check_id uuid references public.communication_compliance_checks(id) on delete restrict,
  subject_type text not null check(subject_type in ('lead','contractor')),
  subject_id text not null,
  channel text not null check(channel in ('sms','email','call')),
  direction text not null check(direction in ('inbound','outbound')),
  purpose text not null check(purpose in ('service','appointment','lead_follow_up','marketing')),
  destination text not null,
  content text,
  provider_name text,
  provider_reference text,
  client_request_id uuid not null,
  status text not null check(status in ('blocked','review','queued','sending','sent','delivered','received','failed','cancelled')),
  failure_code text,
  failure_message text,
  attempt_count integer not null default 0 check(attempt_count >= 0),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  unique(workspace_id,channel,client_request_id)
);

create index communication_transmissions_workspace_idx on public.communication_transmissions(workspace_id,created_at desc);
create index communication_transmissions_conversation_idx on public.communication_transmissions(conversation_id,created_at);
create index communication_transmissions_provider_idx on public.communication_transmissions(provider_name,provider_reference)
  where provider_reference is not null;
create index communication_transmissions_queue_idx on public.communication_transmissions(status,created_at)
  where status in ('queued','sending');

create table public.communication_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  provider_event_key text not null,
  event_type text not null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  transmission_id uuid references public.communication_transmissions(id) on delete set null,
  payload_sha256 text not null,
  processing_status text not null check(processing_status in ('received','processed','ignored','failed')),
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider_name,provider_event_key)
);

create index communication_provider_events_workspace_idx on public.communication_provider_events(workspace_id,received_at desc);

create table public.voice_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id),
  storage_bucket text not null default 'communication-voice-notes' check(storage_bucket='communication-voice-notes'),
  storage_path text not null,
  mime_type text not null check(mime_type in ('audio/webm','audio/ogg','audio/mpeg','audio/mp4','audio/wav')),
  byte_size bigint not null check(byte_size between 1 and 26214400),
  duration_seconds numeric check(duration_seconds is null or duration_seconds between 0 and 1800),
  transcript text,
  client_request_id uuid not null,
  created_at timestamptz not null default now(),
  unique(conversation_id,sender_user_id,client_request_id),
  unique(storage_bucket,storage_path)
);

create index voice_notes_conversation_idx on public.voice_notes(conversation_id,created_at);

create trigger communication_transmissions_set_updated_at before update on public.communication_transmissions
for each row execute function public.hlc_set_updated_at();

alter table public.communication_transmissions enable row level security;
alter table public.communication_provider_events enable row level security;
alter table public.voice_notes enable row level security;

create policy communication_transmissions_member_select on public.communication_transmissions for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=communication_transmissions.workspace_id and wm.user_id=(select auth.uid()))
  or exists(select 1 from public.conversation_participants cp where cp.conversation_id=communication_transmissions.conversation_id and cp.user_id=(select auth.uid()))
);
create policy communication_provider_events_member_select on public.communication_provider_events for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=communication_provider_events.workspace_id and wm.user_id=(select auth.uid()))
);
create policy voice_notes_participant_select on public.voice_notes for select to authenticated using (
  exists(select 1 from public.conversation_participants cp where cp.conversation_id=voice_notes.conversation_id and cp.user_id=(select auth.uid()))
);

grant select on public.communication_transmissions,public.communication_provider_events,public.voice_notes to authenticated;
grant all on public.communication_transmissions,public.communication_provider_events,public.voice_notes to service_role;

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
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_workspace_id uuid;
  v_destination text;
  v_check jsonb;
  v_check_id uuid;
  v_decision text;
  v_status text;
  v_transmission_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;
  if lower(p_channel) not in ('sms','email','call') then raise exception 'Unsupported communication channel.' using errcode='22023'; end if;
  select t.id,t.status,t.compliance_check_id into v_transmission_id,v_status,v_check_id
  from public.communication_transmissions t
  where t.workspace_id=v_workspace_id and t.channel=lower(p_channel) and t.client_request_id=p_client_request_id;
  if v_transmission_id is not null then
    select jsonb_build_object('decision',cc.decision,'reasons',cc.reasons) into v_check
    from public.communication_compliance_checks cc where cc.id=v_check_id;
    return jsonb_build_object('id',v_transmission_id,'decision',coalesce(v_check->>'decision','BLOCK'),
      'status',v_status,'reasons',coalesce(v_check->'reasons','[]'::jsonb));
  end if;
  if lower(p_subject_type)='lead' then
    select case when lower(p_channel)='email' then lower(l.email) else regexp_replace(l.phone,'[() .-]','','g') end
      into v_destination from public.leads l where l.id=p_subject_id::bigint and l.workspace_id=v_workspace_id;
  elsif lower(p_subject_type)='contractor' then
    select case when lower(p_channel)='email' then lower(c.email) else regexp_replace(c.phone,'[() .-]','','g') end
      into v_destination from public.contractors c where c.id=p_subject_id::bigint and c.workspace_id=v_workspace_id;
  else raise exception 'Invalid subject type.' using errcode='22023'; end if;
  if p_conversation_id is not null and not exists(select 1 from public.conversations c where c.id=p_conversation_id and c.workspace_id=v_workspace_id) then
    raise exception 'Conversation is not in the current workspace.' using errcode='42501';
  end if;
  if p_message_id is not null and not exists(select 1 from public.messages m where m.id=p_message_id and m.conversation_id=p_conversation_id and m.workspace_id=v_workspace_id) then
    raise exception 'Message is not in the selected conversation.' using errcode='42501';
  end if;

  v_check:=public.evaluate_communication_compliance(lower(p_subject_type),p_subject_id,lower(p_channel),lower(p_purpose),'outbound',false,false,false);
  v_decision:=v_check->>'decision';
  select cc.id into v_check_id from public.communication_compliance_checks cc
    where cc.workspace_id=v_workspace_id and cc.actor_user_id=auth.uid()
    order by cc.created_at desc limit 1;
  v_status:=case v_decision when 'ALLOW' then 'queued' when 'REVIEW' then 'review' else 'blocked' end;

  insert into public.communication_transmissions(workspace_id,conversation_id,message_id,compliance_check_id,
    subject_type,subject_id,channel,direction,purpose,destination,content,provider_name,client_request_id,status,created_by)
  values(v_workspace_id,p_conversation_id,p_message_id,v_check_id,lower(p_subject_type),p_subject_id,lower(p_channel),
    'outbound',lower(p_purpose),coalesce(v_destination,''),nullif(btrim(coalesce(p_content,'')),''),
    case when lower(p_channel) in ('sms','call') then 'twilio' else null end,p_client_request_id,v_status,auth.uid())
  on conflict(workspace_id,channel,client_request_id) do update set client_request_id=public.communication_transmissions.client_request_id
  returning id into v_transmission_id;
  return jsonb_build_object('id',v_transmission_id,'decision',v_decision,'status',v_status,'reasons',v_check->'reasons');
end; $$;

create or replace function public.register_voice_note(
  p_conversation_id uuid,p_storage_path text,p_mime_type text,p_byte_size bigint,
  p_duration_seconds numeric,p_client_request_id uuid
)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_workspace_id uuid; v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select c.workspace_id into v_workspace_id from public.conversations c
    join public.conversation_participants cp on cp.conversation_id=c.id and cp.user_id=auth.uid()
    where c.id=p_conversation_id and c.closed_at is null;
  if v_workspace_id is null then raise exception 'Conversation is unavailable.' using errcode='42501'; end if;
  if p_storage_path not like v_workspace_id::text||'/'||p_conversation_id::text||'/%' then
    raise exception 'Voice-note storage path is outside the authorized conversation.' using errcode='42501';
  end if;
  insert into public.voice_notes(workspace_id,conversation_id,sender_user_id,storage_path,mime_type,byte_size,duration_seconds,client_request_id)
  values(v_workspace_id,p_conversation_id,auth.uid(),p_storage_path,lower(p_mime_type),p_byte_size,p_duration_seconds,p_client_request_id)
  on conflict(conversation_id,sender_user_id,client_request_id) do update set client_request_id=public.voice_notes.client_request_id
  returning id into v_id;
  return v_id;
end; $$;

create or replace function public.resolve_communication_subject(
  p_workspace_id uuid,p_channel text,p_destination text
)
returns jsonb language sql security invoker set search_path='' as $$
  select result from (
    select jsonb_build_object('subject_type','lead','subject_id',l.id::text) result,1 priority
    from public.leads l where l.workspace_id=p_workspace_id and (
      lower(p_channel)='email' and lower(l.email)=lower(btrim(p_destination))
      or lower(p_channel) in ('sms','call') and regexp_replace(l.phone,'[() .-]','','g')=regexp_replace(p_destination,'[() .-]','','g')
    )
    union all
    select jsonb_build_object('subject_type','contractor','subject_id',c.id::text),2
    from public.contractors c where c.workspace_id=p_workspace_id and (
      lower(p_channel)='email' and lower(c.email)=lower(btrim(p_destination))
      or lower(p_channel) in ('sms','call') and regexp_replace(c.phone,'[() .-]','','g')=regexp_replace(p_destination,'[() .-]','','g')
    )
  ) candidates order by priority limit 1;
$$;

revoke all on function public.queue_communication_transmission(text,text,text,text,text,uuid,uuid,uuid) from public,anon;
revoke all on function public.register_voice_note(uuid,text,text,bigint,numeric,uuid) from public,anon;
revoke all on function public.resolve_communication_subject(uuid,text,text) from public,anon,authenticated;
grant execute on function public.queue_communication_transmission(text,text,text,text,text,uuid,uuid,uuid) to authenticated,service_role;
grant execute on function public.register_voice_note(uuid,text,text,bigint,numeric,uuid) to authenticated,service_role;
grant execute on function public.resolve_communication_subject(uuid,text,text) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('communication-voice-notes','communication-voice-notes',false,26214400,array['audio/webm','audio/ogg','audio/mpeg','audio/mp4','audio/wav'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy voice_note_objects_insert on storage.objects for insert to authenticated with check (
  bucket_id='communication-voice-notes'
  and (storage.foldername(name))[1] in (select wm.workspace_id::text from public.workspace_members wm where wm.user_id=(select auth.uid()))
  and exists(select 1 from public.conversation_participants cp
    where cp.conversation_id::text=(storage.foldername(name))[2] and cp.user_id=(select auth.uid()))
);
create policy voice_note_objects_select on storage.objects for select to authenticated using (
  bucket_id='communication-voice-notes'
  and exists(select 1 from public.conversation_participants cp
    where cp.conversation_id::text=(storage.foldername(name))[2] and cp.user_id=(select auth.uid()))
);
