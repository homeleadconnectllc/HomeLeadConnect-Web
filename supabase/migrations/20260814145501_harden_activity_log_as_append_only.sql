drop policy if exists "activity_log: members can select their org" on public.activity_log;
drop policy if exists activity_log_update_workspace on public.activity_log;
drop policy if exists activity_log_delete_workspace on public.activity_log;

revoke update, delete on public.activity_log from authenticated;

drop policy if exists activity_log_select_workspace on public.activity_log;
create policy activity_log_select_workspace
on public.activity_log
for select to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = activity_log.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists activity_log_insert_workspace on public.activity_log;
create policy activity_log_insert_workspace
on public.activity_log
for insert to authenticated
with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = activity_log.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

comment on table public.activity_log is 'Append-only HLC workspace activity history. Browser roles may read and append authorized events but may not rewrite or delete history.';
