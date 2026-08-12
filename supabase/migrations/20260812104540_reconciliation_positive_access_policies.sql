-- Reconciliation-project positive-access RLS policies.
-- Keeps leads read-only from the browser while enabling the existing estimator/editor
-- and workspace-scoped read paths. Production must not receive this migration until
-- the complete reconciliation/acceptance gate is approved.

drop policy if exists leads_member_select on public.leads;
create policy leads_member_select
on public.leads for select to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = leads.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists estimates_member_select on public.estimates;
create policy estimates_member_select
on public.estimates for select to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = estimates.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists estimates_member_insert on public.estimates;
create policy estimates_member_insert
on public.estimates for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = estimates.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists estimates_member_update on public.estimates;
create policy estimates_member_update
on public.estimates for update to authenticated
using (
  status <> 'converted'
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = estimates.workspace_id
      and wm.user_id = (select auth.uid())
  )
)
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = estimates.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists estimates_member_delete on public.estimates;
create policy estimates_member_delete
on public.estimates for delete to authenticated
using (
  status <> 'converted'
  and exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = estimates.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists estimate_lines_member_select on public.estimate_lines;
create policy estimate_lines_member_select
on public.estimate_lines for select to authenticated
using (
  exists (
    select 1
    from public.estimates e
    join public.workspace_members wm on wm.workspace_id = e.workspace_id
    where e.id = estimate_lines.estimate_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists estimate_lines_member_insert on public.estimate_lines;
create policy estimate_lines_member_insert
on public.estimate_lines for insert to authenticated
with check (
  exists (
    select 1
    from public.estimates e
    join public.workspace_members wm on wm.workspace_id = e.workspace_id
    where e.id = estimate_lines.estimate_id
      and e.status <> 'converted'
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists estimate_lines_member_update on public.estimate_lines;
create policy estimate_lines_member_update
on public.estimate_lines for update to authenticated
using (
  exists (
    select 1
    from public.estimates e
    join public.workspace_members wm on wm.workspace_id = e.workspace_id
    where e.id = estimate_lines.estimate_id
      and e.status <> 'converted'
      and wm.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.estimates e
    join public.workspace_members wm on wm.workspace_id = e.workspace_id
    where e.id = estimate_lines.estimate_id
      and e.status <> 'converted'
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists estimate_lines_member_delete on public.estimate_lines;
create policy estimate_lines_member_delete
on public.estimate_lines for delete to authenticated
using (
  exists (
    select 1
    from public.estimates e
    join public.workspace_members wm on wm.workspace_id = e.workspace_id
    where e.id = estimate_lines.estimate_id
      and e.status <> 'converted'
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists crm_jobs_member_select on public.crm_jobs;
create policy crm_jobs_member_select
on public.crm_jobs for select to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = crm_jobs.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists job_assignments_member_select on public.job_assignments;
create policy job_assignments_member_select
on public.job_assignments for select to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = job_assignments.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists appointments_member_select on public.appointments;
create policy appointments_member_select
on public.appointments for select to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = appointments.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists contractors_member_select on public.contractors;
create policy contractors_member_select
on public.contractors for select to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = contractors.workspace_id
      and wm.user_id = (select auth.uid())
  )
);
