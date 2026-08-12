revoke all on table public.automation_jobs from anon, authenticated;
grant select on table public.automation_jobs to authenticated;

drop policy if exists automation_jobs_select_workspace on public.automation_jobs;
create policy automation_jobs_select_workspace
on public.automation_jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = automation_jobs.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create index if not exists automation_jobs_workspace_created_idx
  on public.automation_jobs (workspace_id, created_at desc);
