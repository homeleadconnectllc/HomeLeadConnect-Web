create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  subject text not null check (char_length(btrim(subject)) between 1 and 160),
  lead_id bigint references public.leads(id) on delete set null,
  job_id uuid references public.crm_jobs(id) on delete set null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create index conversations_workspace_updated_idx on public.conversations(workspace_id, updated_at desc);
create index conversations_lead_idx on public.conversations(lead_id) where lead_id is not null;
create index conversations_job_idx on public.conversations(job_id) where job_id is not null;

create table public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  participant_role text not null check (participant_role in ('business','homeowner','contractor')),
  homeowner_portal_link_id uuid references public.homeowner_portal_links(id) on delete restrict,
  contractor_portal_link_id uuid references public.contractor_portal_links(id) on delete restrict,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  unique(conversation_id, user_id),
  check (
    (participant_role='business' and homeowner_portal_link_id is null and contractor_portal_link_id is null)
    or (participant_role='homeowner' and homeowner_portal_link_id is not null and contractor_portal_link_id is null)
    or (participant_role='contractor' and contractor_portal_link_id is not null and homeowner_portal_link_id is null)
  )
);

create index conversation_participants_user_idx on public.conversation_participants(user_id, joined_at desc);
create index conversation_participants_conversation_idx on public.conversation_participants(conversation_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id),
  channel text not null default 'internal' check (channel='internal'),
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  persistence_status text not null default 'persisted' check (persistence_status='persisted'),
  client_request_id uuid not null,
  created_at timestamptz not null default now(),
  unique(conversation_id, sender_user_id, client_request_id)
);

create index messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index messages_workspace_created_idx on public.messages(workspace_id, created_at desc);

create or replace function public.hlc_validate_conversation_record()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.lead_id is not null and not exists (
    select 1 from public.leads l where l.id=new.lead_id and l.workspace_id=new.workspace_id
  ) then raise exception 'Conversation lead must belong to the same workspace.' using errcode='23514'; end if;
  if new.job_id is not null and not exists (
    select 1 from public.crm_jobs j where j.id=new.job_id and j.workspace_id=new.workspace_id
  ) then raise exception 'Conversation job must belong to the same workspace.' using errcode='23514'; end if;
  if tg_op='UPDATE' and (new.workspace_id,new.lead_id,new.job_id,new.created_by,new.created_at)
    is distinct from (old.workspace_id,old.lead_id,old.job_id,old.created_by,old.created_at) then
    raise exception 'Conversation identity fields are immutable.' using errcode='23514';
  end if;
  return new;
end; $$;

create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.hlc_set_updated_at();
create trigger conversations_validate before insert or update on public.conversations
for each row execute function public.hlc_validate_conversation_record();

create or replace function public.hlc_validate_conversation_participant()
returns trigger language plpgsql set search_path = '' as $$
declare v_conversation public.conversations%rowtype;
begin
  select * into v_conversation from public.conversations where id=new.conversation_id;
  if not found or v_conversation.workspace_id<>new.workspace_id then
    raise exception 'Conversation participant workspace mismatch.' using errcode='23514';
  end if;
  if new.participant_role='business' and not exists (
    select 1 from public.workspace_members wm where wm.workspace_id=new.workspace_id and wm.user_id=new.user_id
  ) then raise exception 'Business participant is not a workspace member.' using errcode='23514'; end if;
  if new.participant_role='homeowner' and not exists (
    select 1 from public.homeowner_portal_links h where h.id=new.homeowner_portal_link_id
      and h.user_id=new.user_id and h.workspace_id=new.workspace_id and h.revoked_at is null
  ) then raise exception 'Homeowner participant link is invalid.' using errcode='23514'; end if;
  if new.participant_role='contractor' and not exists (
    select 1 from public.contractor_portal_links c where c.id=new.contractor_portal_link_id
      and c.user_id=new.user_id and c.workspace_id=new.workspace_id and c.revoked_at is null
  ) then raise exception 'Contractor participant link is invalid.' using errcode='23514'; end if;
  if tg_op='UPDATE' and (new.conversation_id,new.workspace_id,new.user_id,new.participant_role,
    new.homeowner_portal_link_id,new.contractor_portal_link_id,new.joined_at)
    is distinct from (old.conversation_id,old.workspace_id,old.user_id,old.participant_role,
    old.homeowner_portal_link_id,old.contractor_portal_link_id,old.joined_at) then
    raise exception 'Participant identity fields are immutable.' using errcode='23514';
  end if;
  return new;
end; $$;

create trigger conversation_participants_validate before insert or update on public.conversation_participants
for each row execute function public.hlc_validate_conversation_participant();

create or replace function public.hlc_validate_message()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.conversations c
    where c.id=new.conversation_id and c.workspace_id=new.workspace_id and c.closed_at is null) then
    raise exception 'Conversation is unavailable.' using errcode='23514';
  end if;
  if not exists (select 1 from public.conversation_participants p
    where p.conversation_id=new.conversation_id and p.user_id=new.sender_user_id) then
    raise exception 'Message sender is not a conversation participant.' using errcode='23514';
  end if;
  return new;
end; $$;

create trigger messages_validate before insert on public.messages
for each row execute function public.hlc_validate_message();

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

create policy conversations_participant_select on public.conversations for select to authenticated using (
  exists (select 1 from public.conversation_participants p
    where p.conversation_id=conversations.id and p.user_id=(select auth.uid()))
);
create policy participants_self_select on public.conversation_participants for select to authenticated
using (user_id=(select auth.uid()));
create policy participants_self_read_update on public.conversation_participants for update to authenticated
using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy messages_participant_select on public.messages for select to authenticated using (
  exists (select 1 from public.conversation_participants p
    where p.conversation_id=messages.conversation_id and p.user_id=(select auth.uid()))
);

grant select on public.conversations,public.conversation_participants,public.messages to authenticated;
grant update(last_read_at) on public.conversation_participants to authenticated;
grant all on public.conversations,public.conversation_participants,public.messages to service_role;

create or replace function public.start_portal_conversation(
  p_portal_role text,
  p_portal_link_id uuid,
  p_subject text,
  p_body text,
  p_client_request_id uuid,
  p_job_id uuid default null
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_workspace_id uuid; v_target_user uuid; v_lead_id bigint; v_contractor_id bigint; v_conversation_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  if lower(p_portal_role)='homeowner' then
    select h.workspace_id,h.user_id,h.lead_id into v_workspace_id,v_target_user,v_lead_id
    from public.homeowner_portal_links h where h.id=p_portal_link_id and h.revoked_at is null;
  elsif lower(p_portal_role)='contractor' then
    select c.workspace_id,c.user_id,c.contractor_id into v_workspace_id,v_target_user,v_contractor_id
    from public.contractor_portal_links c where c.id=p_portal_link_id and c.revoked_at is null;
  else raise exception 'Invalid portal role.' using errcode='22023'; end if;
  if v_workspace_id is null then raise exception 'Portal link not found.' using errcode='P0002'; end if;
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'You cannot start a conversation for that workspace.' using errcode='42501';
  end if;
  if p_job_id is not null and not exists(select 1 from public.crm_jobs j where j.id=p_job_id and j.workspace_id=v_workspace_id
    and (lower(p_portal_role)='homeowner' and j.lead_id=v_lead_id or lower(p_portal_role)='contractor' and exists(
      select 1 from public.job_assignments a where a.job_id=j.id and a.contractor_id=v_contractor_id))) then
    raise exception 'Job is not authorized for this portal relationship.' using errcode='42501';
  end if;
  insert into public.conversations(workspace_id,subject,lead_id,job_id,created_by)
  values(v_workspace_id,btrim(p_subject),v_lead_id,p_job_id,auth.uid()) returning id into v_conversation_id;
  if auth.uid()<>v_target_user then
    insert into public.conversation_participants(conversation_id,workspace_id,user_id,participant_role)
    values(v_conversation_id,v_workspace_id,auth.uid(),'business');
  end if;
  if lower(p_portal_role)='homeowner' then
    insert into public.conversation_participants(conversation_id,workspace_id,user_id,participant_role,homeowner_portal_link_id)
    values(v_conversation_id,v_workspace_id,v_target_user,'homeowner',p_portal_link_id);
  else
    insert into public.conversation_participants(conversation_id,workspace_id,user_id,participant_role,contractor_portal_link_id)
    values(v_conversation_id,v_workspace_id,v_target_user,'contractor',p_portal_link_id);
  end if;
  insert into public.messages(conversation_id,workspace_id,sender_user_id,body,client_request_id)
  values(v_conversation_id,v_workspace_id,auth.uid(),btrim(p_body),p_client_request_id);
  return v_conversation_id;
end; $$;

create or replace function public.post_internal_message(
  p_conversation_id uuid,p_body text,p_client_request_id uuid
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_workspace_id uuid; v_message_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select c.workspace_id into v_workspace_id from public.conversations c where c.id=p_conversation_id and c.closed_at is null;
  if v_workspace_id is null or not exists(select 1 from public.conversation_participants p
    where p.conversation_id=p_conversation_id and p.user_id=auth.uid()) then
    raise exception 'Conversation is not available to this account.' using errcode='42501';
  end if;
  insert into public.messages(conversation_id,workspace_id,sender_user_id,body,client_request_id)
  values(p_conversation_id,v_workspace_id,auth.uid(),btrim(p_body),p_client_request_id)
  on conflict(conversation_id,sender_user_id,client_request_id) do update set body=public.messages.body
  returning id into v_message_id;
  update public.conversations set updated_at=now() where id=p_conversation_id;
  return v_message_id;
end; $$;

revoke all on function public.start_portal_conversation(text,uuid,text,text,uuid,uuid) from public,anon;
revoke all on function public.post_internal_message(uuid,text,uuid) from public,anon;
grant execute on function public.start_portal_conversation(text,uuid,text,text,uuid,uuid) to authenticated,service_role;
grant execute on function public.post_internal_message(uuid,text,uuid) to authenticated,service_role;
