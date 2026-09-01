-- E1 Community Premium: shared member profile extension + explicit accepted relationship gate.
-- This migration is source-controlled on an isolated implementation branch only.

alter table public.profiles
  add column if not exists community_discoverable boolean not null default false,
  add column if not exists community_headline text,
  add column if not exists community_bio text,
  add column if not exists community_city text,
  add column if not exists community_state text;

comment on column public.profiles.community_discoverable is
  'Explicit opt-in for Community member discovery. Does not grant access to private profile columns.';

grant update (
  community_discoverable,
  community_headline,
  community_bio,
  community_city,
  community_state
) on public.profiles to authenticated;

create table if not exists public.community_connections (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.profiles(user_id) on delete cascade,
  addressee_user_id uuid not null references public.profiles(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'blocked')),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_connections_distinct_users check (requester_user_id <> addressee_user_id)
);

create unique index if not exists community_connections_unique_pair
  on public.community_connections (
    least(requester_user_id, addressee_user_id),
    greatest(requester_user_id, addressee_user_id)
  );

create index if not exists community_connections_requester_status_idx
  on public.community_connections (requester_user_id, status);

create index if not exists community_connections_addressee_status_idx
  on public.community_connections (addressee_user_id, status);

alter table public.community_connections enable row level security;

revoke all on public.community_connections from anon;
revoke insert, update, delete on public.community_connections from authenticated;
grant select on public.community_connections to authenticated;

create policy "community participants can read own connections"
on public.community_connections
for select
to authenticated
using (
  requester_user_id = (select auth.uid())
  or addressee_user_id = (select auth.uid())
);

create or replace function public.community_discover_members()
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  role text,
  headline text,
  bio text,
  city text,
  state text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.role,
    p.community_headline,
    p.community_bio,
    p.community_city,
    p.community_state
  from public.profiles p
  where p.community_discoverable = true
    and p.user_id <> (select auth.uid())
  order by p.full_name nulls last, p.user_id;
$$;

revoke all on function public.community_discover_members() from public;
grant execute on function public.community_discover_members() to authenticated;

create or replace function public.community_request_connection(peer_user_id uuid)
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
    raise exception 'invalid community connection target';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = peer_user_id and p.community_discoverable = true
  ) then
    raise exception 'community member unavailable';
  end if;

  insert into public.community_connections (requester_user_id, addressee_user_id, status)
  values (actor, peer_user_id, 'pending')
  on conflict (
    least(requester_user_id, addressee_user_id),
    greatest(requester_user_id, addressee_user_id)
  ) do nothing
  returning * into result;

  if result.id is null then
    select * into result
    from public.community_connections c
    where least(c.requester_user_id, c.addressee_user_id) = least(actor, peer_user_id)
      and greatest(c.requester_user_id, c.addressee_user_id) = greatest(actor, peer_user_id);
  end if;

  return result;
end;
$$;

revoke all on function public.community_request_connection(uuid) from public;
grant execute on function public.community_request_connection(uuid) to authenticated;

create or replace function public.community_respond_connection(connection_id uuid, accept_connection boolean)
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

  update public.community_connections c
  set
    status = case when accept_connection then 'accepted' else 'declined' end,
    responded_at = now(),
    updated_at = now()
  where c.id = connection_id
    and c.addressee_user_id = actor
    and c.status = 'pending'
  returning * into result;

  if result.id is null then
    raise exception 'pending community connection not found';
  end if;

  return result;
end;
$$;

revoke all on function public.community_respond_connection(uuid, boolean) from public;
grant execute on function public.community_respond_connection(uuid, boolean) to authenticated;

create or replace function public.community_can_message(peer_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.community_connections c
    where c.status = 'accepted'
      and (
        (c.requester_user_id = (select auth.uid()) and c.addressee_user_id = peer_user_id)
        or
        (c.addressee_user_id = (select auth.uid()) and c.requester_user_id = peer_user_id)
      )
  );
$$;

revoke all on function public.community_can_message(uuid) from public;
grant execute on function public.community_can_message(uuid) to authenticated;
