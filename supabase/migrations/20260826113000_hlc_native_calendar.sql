create table if not exists public.hlc_calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  all_day boolean not null default false,
  event_type text not null default 'meeting' check (event_type in ('meeting','reminder','task','focus','other')),
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  linked_type text check (linked_type is null or linked_type in ('lead','job','appointment','follow_up','contractor','conversation')),
  linked_id text,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hlc_calendar_events_time_range check (end_at > start_at),
  constraint hlc_calendar_events_link_pair check ((linked_type is null) = (linked_id is null))
);

create index if not exists hlc_calendar_events_workspace_start_idx
  on public.hlc_calendar_events (workspace_id, start_at);
create index if not exists hlc_calendar_events_workspace_status_idx
  on public.hlc_calendar_events (workspace_id, status, start_at);

alter table public.hlc_calendar_events enable row level security;
revoke all on public.hlc_calendar_events from anon;
grant select, insert, update, delete on public.hlc_calendar_events to authenticated;

create policy hlc_calendar_events_select_workspace
on public.hlc_calendar_events
for select
to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = hlc_calendar_events.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create policy hlc_calendar_events_insert_workspace
on public.hlc_calendar_events
for insert
to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = hlc_calendar_events.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create policy hlc_calendar_events_update_owner_or_management
on public.hlc_calendar_events
for update
to authenticated
using (
  created_by = (select auth.uid())
  or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = hlc_calendar_events.workspace_id
      and wm.user_id = (select auth.uid())
      and wm.role in ('owner','manager')
  )
)
with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = hlc_calendar_events.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create policy hlc_calendar_events_delete_owner_or_management
on public.hlc_calendar_events
for delete
to authenticated
using (
  created_by = (select auth.uid())
  or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = hlc_calendar_events.workspace_id
      and wm.user_id = (select auth.uid())
      and wm.role in ('owner','manager')
  )
);
