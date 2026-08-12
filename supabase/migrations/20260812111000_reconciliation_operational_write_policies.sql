-- Restore the authenticated write policies required by the existing HLC client contract.
-- These policies preserve workspace membership and actor identity; contractor acceptance
-- remains controlled by the contractor portal enforcement trigger/RPC.

drop policy if exists crm_jobs_update_workspace_members on public.crm_jobs;
create policy crm_jobs_update_workspace_members
on public.crm_jobs for update to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = crm_jobs.workspace_id
      and wm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = crm_jobs.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists job_assignments_insert_workspace_members on public.job_assignments;
create policy job_assignments_insert_workspace_members
on public.job_assignments for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = job_assignments.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists job_assignments_update_workspace_members on public.job_assignments;
create policy job_assignments_update_workspace_members
on public.job_assignments for update to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = job_assignments.workspace_id
      and wm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = job_assignments.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists appointments_insert_workspace_members on public.appointments;
create policy appointments_insert_workspace_members
on public.appointments for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = appointments.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists appointments_update_workspace_members on public.appointments;
create policy appointments_update_workspace_members
on public.appointments for update to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = appointments.workspace_id
      and wm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = appointments.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

grant update on public.crm_jobs to authenticated;
grant insert, update on public.job_assignments to authenticated;
grant insert, update on public.appointments to authenticated;
grant usage, select on sequence public.appointments_id_seq to authenticated;
