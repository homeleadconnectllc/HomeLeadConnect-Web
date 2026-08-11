create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  notification_type text not null check(notification_type in ('assignment_offered','appointment_scheduled','appointment_completed','appointment_cancelled','appointment_no_show','message_received')),
  title text not null check(char_length(btrim(title)) between 1 and 160),
  body text not null check(char_length(btrim(body)) between 1 and 500),
  related_entity_type text not null check(related_entity_type in ('assignment','appointment','conversation')),
  related_entity_id uuid not null,
  deep_link text not null check(deep_link like '/%'),
  dedupe_key text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique(recipient_user_id,dedupe_key)
);
create index notifications_recipient_idx on public.notifications(recipient_user_id,read_at,created_at desc);
create index notifications_workspace_idx on public.notifications(workspace_id,created_at desc);

alter table public.notifications enable row level security;
create policy notifications_recipient_select on public.notifications for select to authenticated
using(recipient_user_id=(select auth.uid()));
create policy notifications_recipient_read_update on public.notifications for update to authenticated
using(recipient_user_id=(select auth.uid())) with check(recipient_user_id=(select auth.uid()));
grant select on public.notifications to authenticated;
grant update(read_at) on public.notifications to authenticated;
grant all on public.notifications to service_role;

create or replace function public.hlc_notify_assignment_offer()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.status='offered' then
    insert into public.notifications(workspace_id,recipient_user_id,notification_type,title,body,related_entity_type,related_entity_id,deep_link,dedupe_key)
    select new.workspace_id,cpl.user_id,'assignment_offered','New job offer','A new HLC job offer is ready for review.',
      'assignment',new.id,'/contractor-portal','assignment:'||new.id::text||':offered'
    from public.contractor_portal_links cpl
    where cpl.workspace_id=new.workspace_id and cpl.contractor_id=new.contractor_id and cpl.revoked_at is null
    on conflict(recipient_user_id,dedupe_key) do nothing;
  end if;
  return new;
end; $$;
create trigger job_assignments_notify_offer after insert on public.job_assignments
for each row execute function public.hlc_notify_assignment_offer();

create or replace function public.hlc_notify_appointment()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_lead_id bigint; v_type text; v_title text; v_body text;
begin
  if tg_op='UPDATE' and new.status=old.status then return new; end if;
  select j.lead_id into v_lead_id from public.crm_jobs j where j.id=new.job_id and j.workspace_id=new.workspace_id;
  v_type:=case new.status when 'scheduled' then 'appointment_scheduled' when 'completed' then 'appointment_completed'
    when 'cancelled' then 'appointment_cancelled' when 'no_show' then 'appointment_no_show' end;
  v_title:=case new.status when 'scheduled' then 'Appointment scheduled' when 'completed' then 'Appointment completed'
    when 'cancelled' then 'Appointment cancelled' when 'no_show' then 'Appointment marked no-show' end;
  v_body:='Appointment status changed to '||replace(new.status,'_',' ')||'.';
  if v_type is null then return new; end if;
  insert into public.notifications(workspace_id,recipient_user_id,notification_type,title,body,related_entity_type,related_entity_id,deep_link,dedupe_key)
  select new.workspace_id,recipient.user_id,v_type,v_title,v_body,'appointment',new.id,recipient.deep_link,
    'appointment:'||new.id::text||':'||new.status
  from (
    select cpl.user_id,'/contractor-portal'::text deep_link from public.contractor_portal_links cpl
      where cpl.workspace_id=new.workspace_id and cpl.contractor_id=new.contractor_id and cpl.revoked_at is null
    union
    select hpl.user_id,'/homeowner-portal'::text from public.homeowner_portal_links hpl
      where hpl.workspace_id=new.workspace_id and hpl.lead_id=v_lead_id and hpl.revoked_at is null
  ) recipient
  on conflict(recipient_user_id,dedupe_key) do nothing;
  return new;
end; $$;
create trigger appointments_notify_portals after insert or update of status on public.appointments
for each row execute function public.hlc_notify_appointment();

create or replace function public.hlc_notify_message_participants()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.notifications(workspace_id,recipient_user_id,notification_type,title,body,related_entity_type,related_entity_id,deep_link,dedupe_key)
  select new.workspace_id,cp.user_id,'message_received','New HLC message','A conversation you participate in has a new message.',
    'conversation',new.conversation_id,'/messages','message:'||new.id::text
  from public.conversation_participants cp
  where cp.conversation_id=new.conversation_id and cp.user_id<>new.sender_user_id
  on conflict(recipient_user_id,dedupe_key) do nothing;
  return new;
end; $$;
create trigger messages_notify_participants after insert on public.messages
for each row execute function public.hlc_notify_message_participants();

revoke all on function public.hlc_notify_assignment_offer() from public,anon,authenticated;
revoke all on function public.hlc_notify_appointment() from public,anon,authenticated;
revoke all on function public.hlc_notify_message_participants() from public,anon,authenticated;
