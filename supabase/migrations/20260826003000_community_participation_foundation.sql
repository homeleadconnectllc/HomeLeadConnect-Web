create table if not exists public.community_post_replies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  status text not null default 'active' check (status in ('active','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_post_replies_workspace_post_idx on public.community_post_replies(workspace_id, post_id, created_at);
create index if not exists community_post_replies_author_idx on public.community_post_replies(author_user_id);
alter table public.community_post_replies enable row level security;

drop policy if exists community_post_replies_select on public.community_post_replies;
create policy community_post_replies_select on public.community_post_replies for select to authenticated
using (public.hlc_is_workspace_member(workspace_id) and exists (select 1 from public.community_posts p where p.id=post_id and p.workspace_id=community_post_replies.workspace_id));

drop policy if exists community_post_replies_insert on public.community_post_replies;
create policy community_post_replies_insert on public.community_post_replies for insert to authenticated
with check (author_user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id) and exists (select 1 from public.community_posts p where p.id=post_id and p.workspace_id=community_post_replies.workspace_id and p.kind='discussion'));

drop policy if exists community_post_replies_update on public.community_post_replies;
create policy community_post_replies_update on public.community_post_replies for update to authenticated
using ((author_user_id=(select auth.uid()) or public.hlc_is_workspace_owner(workspace_id)) and public.hlc_is_workspace_member(workspace_id))
with check (public.hlc_is_workspace_member(workspace_id) and exists (select 1 from public.community_posts p where p.id=post_id and p.workspace_id=community_post_replies.workspace_id and p.kind='discussion'));

revoke all on public.community_post_replies from public, anon;
revoke all on public.community_post_replies from authenticated;
grant select, insert on public.community_post_replies to authenticated;
grant update(body,status,updated_at) on public.community_post_replies to authenticated;
grant all on public.community_post_replies to service_role;

create table if not exists public.community_group_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  group_id uuid not null references public.community_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index if not exists community_group_members_workspace_idx on public.community_group_members(workspace_id, user_id);
alter table public.community_group_members enable row level security;

drop policy if exists community_group_members_select on public.community_group_members;
create policy community_group_members_select on public.community_group_members for select to authenticated
using (public.hlc_is_workspace_member(workspace_id) and exists (select 1 from public.community_groups g where g.id=group_id and g.workspace_id=community_group_members.workspace_id));

drop policy if exists community_group_members_insert on public.community_group_members;
create policy community_group_members_insert on public.community_group_members for insert to authenticated
with check (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id) and exists (select 1 from public.community_groups g where g.id=group_id and g.workspace_id=community_group_members.workspace_id));

drop policy if exists community_group_members_delete on public.community_group_members;
create policy community_group_members_delete on public.community_group_members for delete to authenticated
using (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id));

revoke all on public.community_group_members from public, anon;
revoke all on public.community_group_members from authenticated;
grant select, insert, delete on public.community_group_members to authenticated;
grant all on public.community_group_members to service_role;

create table if not exists public.community_event_attendance (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  response text not null check (response in ('going','interested','not_going')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_post_id, user_id)
);
create index if not exists community_event_attendance_workspace_idx on public.community_event_attendance(workspace_id, user_id);
alter table public.community_event_attendance enable row level security;

drop policy if exists community_event_attendance_select on public.community_event_attendance;
create policy community_event_attendance_select on public.community_event_attendance for select to authenticated
using (public.hlc_is_workspace_member(workspace_id) and exists (select 1 from public.community_posts p where p.id=event_post_id and p.workspace_id=community_event_attendance.workspace_id and p.kind='event'));

drop policy if exists community_event_attendance_insert on public.community_event_attendance;
create policy community_event_attendance_insert on public.community_event_attendance for insert to authenticated
with check (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id) and exists (select 1 from public.community_posts p where p.id=event_post_id and p.workspace_id=community_event_attendance.workspace_id and p.kind='event'));

drop policy if exists community_event_attendance_update on public.community_event_attendance;
create policy community_event_attendance_update on public.community_event_attendance for update to authenticated
using (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id))
with check (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id) and exists (select 1 from public.community_posts p where p.id=event_post_id and p.workspace_id=community_event_attendance.workspace_id and p.kind='event'));

drop policy if exists community_event_attendance_delete on public.community_event_attendance;
create policy community_event_attendance_delete on public.community_event_attendance for delete to authenticated
using (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id));

revoke all on public.community_event_attendance from public, anon;
revoke all on public.community_event_attendance from authenticated;
grant select, insert, delete on public.community_event_attendance to authenticated;
grant update(response,updated_at) on public.community_event_attendance to authenticated;
grant all on public.community_event_attendance to service_role;
