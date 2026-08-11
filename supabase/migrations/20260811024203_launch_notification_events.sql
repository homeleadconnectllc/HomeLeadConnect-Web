alter table public.notifications drop constraint if exists notifications_notification_type_check;
alter table public.notifications add constraint notifications_notification_type_check check(notification_type in (
  'assignment_offered','assignment_accepted','assignment_rejected','assignment_cancelled',
  'appointment_scheduled','appointment_completed','appointment_cancelled','appointment_no_show',
  'message_received','operational_escalation','owner_attention'
));
alter table public.notifications drop constraint if exists notifications_related_entity_type_check;
alter table public.notifications add constraint notifications_related_entity_type_check check(related_entity_type in (
  'assignment','appointment','conversation','agent_handoff','owner_attention'
));

create or replace function public.hlc_notify_assignment_response()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  v_type text;
  v_title text;
begin
  if old.status=new.status or new.status not in ('accepted','rejected','cancelled') then return new; end if;
  v_type:='assignment_'||new.status;
  v_title:=case new.status when 'accepted' then 'Job offer accepted' when 'rejected' then 'Job offer rejected' else 'Job assignment cancelled' end;
  insert into public.notifications(workspace_id,recipient_user_id,notification_type,title,body,related_entity_type,related_entity_id,deep_link,dedupe_key)
  select new.workspace_id,wm.user_id,v_type,v_title,'A contractor assignment changed to '||new.status||'.',
    'assignment',new.id,'/jobs/'||new.job_id::text,'assignment:'||new.id::text||':'||new.status
  from public.workspace_members wm where wm.workspace_id=new.workspace_id
  on conflict(recipient_user_id,dedupe_key) do nothing;
  return new;
end $$;

create trigger job_assignments_notify_response after update of status on public.job_assignments
for each row execute function public.hlc_notify_assignment_response();

create or replace function public.hlc_notify_agent_handoff()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  insert into public.notifications(workspace_id,recipient_user_id,notification_type,title,body,related_entity_type,related_entity_id,deep_link,dedupe_key)
  select new.workspace_id,p.user_id,
    case when new.destination_agent='kendrell' then 'owner_attention' else 'operational_escalation' end,
    case when new.destination_agent='kendrell' then 'Owner attention requested' else 'Operations handoff received' end,
    new.source_agent||' handed off an HLC item to '||new.destination_agent||'.',
    'agent_handoff',new.id,
    case when new.destination_agent='kendrell' then '/hq' else '/operations' end,
    'agent-handoff:'||new.id::text
  from public.profiles p
  join public.workspace_members wm on wm.user_id=p.user_id and wm.workspace_id=new.workspace_id
  where p.workspace_id=new.workspace_id and (
    (new.destination_agent='kendrell' and lower(p.role)='owner')
    or (new.destination_agent='dion')
  )
  on conflict(recipient_user_id,dedupe_key) do nothing;
  return new;
end $$;

create trigger ai_agent_handoffs_notify after insert on public.ai_agent_handoffs
for each row execute function public.hlc_notify_agent_handoff();

revoke all on function public.hlc_notify_assignment_response() from public,anon,authenticated;
revoke all on function public.hlc_notify_agent_handoff() from public,anon,authenticated;
