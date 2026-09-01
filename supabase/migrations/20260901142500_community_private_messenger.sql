-- E1 Community Premium: accepted-relationship private messenger runtime.
-- Source-controlled on the isolated E1 branch and intentionally excluded from the production release plan.

create table if not exists public.community_private_messages (
  id uuid primary key default gen_random_uuid(),
  sender_user_id uuid not null references public.profiles(user_id) on delete cascade,
  recipient_user_id uuid not null references public.profiles(user_id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint community_private_messages_distinct_users check (sender_user_id <> recipient_user_id)
);

create index if not exists community_private_messages_pair_created_idx
  on public.community_private_messages (
    (least(sender_user_id, recipient_user_id)),
    (greatest(sender_user_id, recipient_user_id)),
    created_at desc
  );

alter table public.community_private_messages enable row level security;
revoke all on public.community_private_messages from anon;
revoke insert, update, delete on public.community_private_messages from authenticated;
grant select on public.community_private_messages to authenticated;

create policy "community message participants read accepted conversations"
on public.community_private_messages
for select
to authenticated
using (
  (sender_user_id = (select auth.uid()) or recipient_user_id = (select auth.uid()))
  and public.community_can_message(
    case
      when sender_user_id = (select auth.uid()) then recipient_user_id
      else sender_user_id
    end
  )
);

create or replace function public.community_list_relationships()
returns table (
  connection_id uuid,
  peer_user_id uuid,
  peer_full_name text,
  peer_avatar_url text,
  peer_role text,
  peer_headline text,
  peer_city text,
  peer_state text,
  relationship_status text,
  direction text,
  requested_at timestamptz,
  responded_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    case when c.requester_user_id = (select auth.uid()) then c.addressee_user_id else c.requester_user_id end,
    p.full_name,
    p.avatar_url,
    p.role,
    p.community_headline,
    p.community_city,
    p.community_state,
    c.status,
    case when c.requester_user_id = (select auth.uid()) then 'outgoing' else 'incoming' end,
    c.requested_at,
    c.responded_at
  from public.community_connections c
  join public.profiles p
    on p.user_id = case when c.requester_user_id = (select auth.uid()) then c.addressee_user_id else c.requester_user_id end
  where c.requester_user_id = (select auth.uid())
     or c.addressee_user_id = (select auth.uid())
  order by c.updated_at desc, c.requested_at desc;
$$;

revoke all on function public.community_list_relationships() from public;
grant execute on function public.community_list_relationships() to authenticated;

create or replace function public.community_send_message(peer_user_id uuid, message_body text)
returns public.community_private_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := (select auth.uid());
  clean_body text := trim(coalesce(message_body, ''));
  result public.community_private_messages;
begin
  if actor is null then
    raise exception 'authentication required';
  end if;
  if peer_user_id is null or peer_user_id = actor then
    raise exception 'invalid community message target';
  end if;
  if char_length(clean_body) < 1 or char_length(clean_body) > 4000 then
    raise exception 'community message must contain 1 to 4000 characters';
  end if;
  if not public.community_can_message(peer_user_id) then
    raise exception 'accepted community relationship required';
  end if;

  insert into public.community_private_messages (sender_user_id, recipient_user_id, body)
  values (actor, peer_user_id, clean_body)
  returning * into result;

  return result;
end;
$$;

revoke all on function public.community_send_message(uuid, text) from public;
grant execute on function public.community_send_message(uuid, text) to authenticated;

create or replace function public.community_list_messages(peer_user_id uuid)
returns table (
  id uuid,
  sender_user_id uuid,
  recipient_user_id uuid,
  body text,
  created_at timestamptz,
  read_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;
  if not public.community_can_message(peer_user_id) then
    raise exception 'accepted community relationship required';
  end if;

  return query
  select m.id, m.sender_user_id, m.recipient_user_id, m.body, m.created_at, m.read_at
  from public.community_private_messages m
  where (m.sender_user_id = (select auth.uid()) and m.recipient_user_id = peer_user_id)
     or (m.recipient_user_id = (select auth.uid()) and m.sender_user_id = peer_user_id)
  order by m.created_at asc, m.id asc;
end;
$$;

revoke all on function public.community_list_messages(uuid) from public;
grant execute on function public.community_list_messages(uuid) to authenticated;

create or replace function public.community_block_connection(peer_user_id uuid)
returns public.community_connections
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := (select auth.uid());
  result public.community_connections;
begin
  if actor is null then
    raise exception 'authentication required';
  end if;
  if peer_user_id is null or peer_user_id = actor then
    raise exception 'invalid community block target';
  end if;
  if not exists (select 1 from public.profiles p where p.user_id = peer_user_id) then
    raise exception 'community member unavailable';
  end if;

  update public.community_connections c
  set status = 'blocked', responded_at = now(), updated_at = now()
  where least(c.requester_user_id, c.addressee_user_id) = least(actor, peer_user_id)
    and greatest(c.requester_user_id, c.addressee_user_id) = greatest(actor, peer_user_id)
  returning * into result;

  if result.id is null then
    insert into public.community_connections (requester_user_id, addressee_user_id, status, responded_at)
    values (actor, peer_user_id, 'blocked', now())
    returning * into result;
  end if;

  return result;
end;
$$;

revoke all on function public.community_block_connection(uuid) from public;
grant execute on function public.community_block_connection(uuid) to authenticated;
