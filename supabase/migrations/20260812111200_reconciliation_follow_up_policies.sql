-- The launch UI directly reads and writes follow_ups. Keep access tenant-scoped
-- through the linked lead's workspace and require the creator to own new follow-ups.

drop policy if exists follow_ups_workspace_select on public.follow_ups;
create policy follow_ups_workspace_select
on public.follow_ups for select to authenticated
using (
  exists (
    select 1
    from public.leads l
    join public.workspace_members wm on wm.workspace_id = l.workspace_id
    where l.id_uuid = follow_ups.lead_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists follow_ups_workspace_insert on public.follow_ups;
create policy follow_ups_workspace_insert
on public.follow_ups for insert to authenticated
with check (
  assigned_user_id = (select auth.uid())
  and exists (
    select 1
    from public.leads l
    join public.workspace_members wm on wm.workspace_id = l.workspace_id
    where l.id_uuid = follow_ups.lead_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists follow_ups_workspace_update on public.follow_ups;
create policy follow_ups_workspace_update
on public.follow_ups for update to authenticated
using (
  exists (
    select 1
    from public.leads l
    join public.workspace_members wm on wm.workspace_id = l.workspace_id
    where l.id_uuid = follow_ups.lead_id
      and wm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.leads l
    join public.workspace_members wm on wm.workspace_id = l.workspace_id
    where l.id_uuid = follow_ups.lead_id
      and wm.user_id = (select auth.uid())
  )
);

grant select, insert, update on public.follow_ups to authenticated;
