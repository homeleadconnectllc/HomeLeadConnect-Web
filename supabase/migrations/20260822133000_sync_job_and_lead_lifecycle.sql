-- Keep canonical lead lifecycle aligned with persisted job progress.
--
-- Verified production gap before this migration:
-- - a lead with a completed job remained status/stage `new`
-- - a lead with a converted estimate + pending job remained status `new`
-- - historical stage data also contained the exact uppercase `NEW` variant
--
-- Canonical pipeline stages are lowercase: new -> contacted -> qualified -> booked -> closed.
-- The legacy uppercase direct-advance function is service-role-only and remains a
-- separate compatibility path; this migration does not rewrite unrelated legacy
-- terminal statuses.

update public.leads
set stage = 'new',
    stage_updated_at = now(),
    updated_at = now()
where stage = 'NEW';

alter table public.leads
  drop constraint if exists leads_stage_no_uppercase_new;

alter table public.leads
  add constraint leads_stage_no_uppercase_new
  check (stage is null or stage <> 'NEW');

create or replace function internal.sync_lead_lifecycle_from_job()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_target_state text;
begin
  if new.lead_id is null then
    return new;
  end if;

  if new.status = 'completed' then
    v_target_state := 'closed';
  elsif new.status in ('pending', 'active') then
    v_target_state := 'booked';
  else
    return new;
  end if;

  if v_target_state = 'closed' then
    update public.leads l
    set status = 'closed',
        stage = 'closed',
        stage_updated_at = now(),
        updated_at = now()
    where l.id = new.lead_id
      and l.workspace_id = new.workspace_id
      and (l.status is distinct from 'closed' or l.stage is distinct from 'closed');
  else
    update public.leads l
    set status = 'booked',
        stage = 'booked',
        stage_updated_at = now(),
        updated_at = now()
    where l.id = new.lead_id
      and l.workspace_id = new.workspace_id
      and lower(coalesce(l.status, '')) in ('new', 'claimed', 'contacted', 'qualified', 'booked')
      and lower(coalesce(l.stage, '')) in ('new', 'claimed', 'contacted', 'qualified', 'booked')
      and not exists (
        select 1
        from public.crm_jobs completed_job
        where completed_job.workspace_id = new.workspace_id
          and completed_job.lead_id = new.lead_id
          and completed_job.status = 'completed'
      )
      and (l.status is distinct from 'booked' or l.stage is distinct from 'booked');
  end if;

  return new;
end;
$$;

revoke all on function internal.sync_lead_lifecycle_from_job() from public, anon, authenticated;

-- Recreate the trigger idempotently so every canonical job creation/status update
-- maintains the lead lifecycle, regardless of which approved job mutation path ran.
drop trigger if exists crm_jobs_sync_lead_lifecycle on public.crm_jobs;
create trigger crm_jobs_sync_lead_lifecycle
after insert or update of status, lead_id, workspace_id on public.crm_jobs
for each row
execute function internal.sync_lead_lifecycle_from_job();

-- Backfill persisted production relationships. Completed work wins over pending
-- work so a lead can never regress from closed back to booked.
update public.leads l
set status = 'closed',
    stage = 'closed',
    stage_updated_at = now(),
    updated_at = now()
where exists (
  select 1
  from public.crm_jobs j
  where j.workspace_id = l.workspace_id
    and j.lead_id = l.id
    and j.status = 'completed'
)
and (l.status is distinct from 'closed' or l.stage is distinct from 'closed');

update public.leads l
set status = 'booked',
    stage = 'booked',
    stage_updated_at = now(),
    updated_at = now()
where not exists (
  select 1
  from public.crm_jobs completed_job
  where completed_job.workspace_id = l.workspace_id
    and completed_job.lead_id = l.id
    and completed_job.status = 'completed'
)
and exists (
  select 1
  from public.crm_jobs active_job
  where active_job.workspace_id = l.workspace_id
    and active_job.lead_id = l.id
    and active_job.status in ('pending', 'active')
)
and lower(coalesce(l.status, '')) in ('new', 'claimed', 'contacted', 'qualified', 'booked')
and lower(coalesce(l.stage, '')) in ('new', 'claimed', 'contacted', 'qualified', 'booked')
and (l.status is distinct from 'booked' or l.stage is distinct from 'booked');
