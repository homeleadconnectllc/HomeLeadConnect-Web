drop trigger if exists appointments_validate_job_schedule on public.appointments;

revoke all on table public.subscriptions from anon, authenticated;

revoke all on table public.workspace_plan_status from anon, authenticated;
grant select on table public.workspace_plan_status to authenticated;

drop policy if exists workspace_plan_status_select_workspace on public.workspace_plan_status;
create policy workspace_plan_status_select_workspace
on public.workspace_plan_status
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_plan_status.workspace_id
      and wm.user_id = (select auth.uid())
  )
);
