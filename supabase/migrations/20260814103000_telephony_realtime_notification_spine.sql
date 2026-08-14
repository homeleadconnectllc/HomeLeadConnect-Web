create or replace function public.hlc_notify_telephony_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
  v_title text;
  v_body text;
  v_state text;
begin
  if new.direction is distinct from 'inbound' then
    return new;
  end if;

  v_state := coalesce(new.normalized_state, 'requested');

  if tg_op = 'INSERT' then
    v_type := 'incoming_call';
    v_title := 'Incoming call';
    v_body := 'An inbound call reached HomeLead Connect.';
  elsif new.normalized_state is not distinct from old.normalized_state then
    return new;
  elsif new.normalized_state = 'no_answer' then
    v_type := 'missed_call';
    v_title := 'Missed call';
    v_body := 'An inbound call was not answered.';
  elsif new.normalized_state = 'voicemail' then
    v_type := 'voicemail';
    v_title := 'New voicemail';
    v_body := 'An inbound call reached voicemail.';
  else
    return new;
  end if;

  insert into public.notifications(
    workspace_id, recipient_user_id, notification_type, title, body,
    related_entity_type, related_entity_id, deep_link, dedupe_key
  )
  select
    new.workspace_id, wm.user_id, v_type, v_title, v_body,
    'call_session', new.id, '/call-center',
    'call:' || new.id::text || ':' || case when tg_op = 'INSERT' then 'incoming' else v_state end
  from public.workspace_members wm
  where wm.workspace_id = new.workspace_id
  on conflict (recipient_user_id, dedupe_key) do nothing;

  return new;
end
$$;

revoke all on function public.hlc_notify_telephony_event() from public, anon, authenticated;

drop trigger if exists call_sessions_notify_hlc on public.call_sessions;
create trigger call_sessions_notify_hlc
after insert or update of normalized_state on public.call_sessions
for each row execute function public.hlc_notify_telephony_event();

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
