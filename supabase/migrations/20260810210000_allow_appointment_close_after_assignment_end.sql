-- Appointment creation requires an accepted assignment. Once created, its
-- terminal status must remain manageable even if that assignment later ends.
create or replace function public.hlc_validate_job_appointment()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_job_workspace uuid;
  v_job_lead bigint;
  v_contractor_workspace uuid;
begin
  select j.workspace_id, j.lead_id
    into v_job_workspace, v_job_lead
  from public.crm_jobs j
  where j.id = new.job_id;

  if not found then
    raise exception 'CRM job is not available';
  end if;

  select c.workspace_id into v_contractor_workspace
  from public.contractors c
  where c.id = new.contractor_id;

  if not found then
    raise exception 'Contractor is not available';
  end if;

  if new.workspace_id is distinct from v_job_workspace
     or new.workspace_id is distinct from v_contractor_workspace then
    raise exception 'Appointment job and contractor must belong to the same workspace';
  end if;

  if new.lead_id is not null and new.lead_id is distinct from v_job_lead then
    raise exception 'Appointment lead must match the CRM job lead';
  end if;

  if tg_op = 'INSERT' and not exists (
      select 1 from public.job_assignments ja
      where ja.job_id = new.job_id
        and ja.contractor_id = new.contractor_id
        and ja.workspace_id = new.workspace_id
        and ja.status = 'accepted'
    ) then
      raise exception 'A job appointment requires an accepted contractor assignment';
  end if;

  if tg_op = 'UPDATE' and (
    new.workspace_id is distinct from old.workspace_id
    or new.job_id is distinct from old.job_id
    or new.contractor_id is distinct from old.contractor_id
    or new.lead_id is distinct from old.lead_id
    or new.appointment_date is distinct from old.appointment_date
    or new.created_by is distinct from old.created_by
    or new.created_at is distinct from old.created_at
  ) then
    raise exception 'Appointment identity and schedule are immutable; cancel and create a replacement';
  end if;

  if tg_op = 'UPDATE' and new.status is distinct from old.status and not (
    old.status = 'scheduled'
    and new.status in ('completed', 'cancelled', 'no_show')
  ) then
    raise exception 'Invalid appointment status transition from % to %', old.status, new.status;
  end if;

  return new;
end;
$$;
