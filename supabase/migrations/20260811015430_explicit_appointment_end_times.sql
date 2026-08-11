alter table public.appointments add column if not exists appointment_end_at timestamptz;

alter table public.appointments drop constraint if exists appointments_scheduled_end_check;
alter table public.appointments add constraint appointments_scheduled_end_check check (
  status <> 'scheduled' or (appointment_end_at is not null and appointment_end_at > appointment_date)
) not valid;
alter table public.appointments validate constraint appointments_scheduled_end_check;

create index if not exists appointments_time_range_idx on public.appointments(workspace_id,appointment_date,appointment_end_at);

create or replace function public.hlc_validate_job_appointment()
returns trigger language plpgsql set search_path='' as $$
declare v_job_workspace uuid; v_job_lead bigint; v_contractor_workspace uuid;
begin
  select j.workspace_id,j.lead_id into v_job_workspace,v_job_lead from public.crm_jobs j where j.id=new.job_id;
  if not found then raise exception 'CRM job is not available'; end if;
  select c.workspace_id into v_contractor_workspace from public.contractors c where c.id=new.contractor_id;
  if not found then raise exception 'Contractor is not available'; end if;
  if new.workspace_id is distinct from v_job_workspace or new.workspace_id is distinct from v_contractor_workspace then raise exception 'Appointment job and contractor must belong to the same workspace'; end if;
  if new.lead_id is not null and new.lead_id is distinct from v_job_lead then raise exception 'Appointment lead must match the CRM job lead'; end if;
  if new.status='scheduled' and new.appointment_end_at is null then raise exception 'Scheduled appointment end time is required'; end if;
  if new.appointment_end_at is not null and new.appointment_end_at<=new.appointment_date then raise exception 'Appointment end time must be after the start time'; end if;
  if tg_op='INSERT' and not exists(select 1 from public.job_assignments ja where ja.job_id=new.job_id and ja.contractor_id=new.contractor_id and ja.workspace_id=new.workspace_id and ja.status='accepted') then raise exception 'A job appointment requires an accepted contractor assignment'; end if;
  if tg_op='UPDATE' and (new.workspace_id is distinct from old.workspace_id or new.job_id is distinct from old.job_id or new.contractor_id is distinct from old.contractor_id or new.lead_id is distinct from old.lead_id or new.appointment_date is distinct from old.appointment_date or new.appointment_end_at is distinct from old.appointment_end_at or new.created_by is distinct from old.created_by or new.created_at is distinct from old.created_at) then raise exception 'Appointment identity and schedule are immutable; cancel and create a replacement'; end if;
  if tg_op='UPDATE' and new.status is distinct from old.status and not(old.status='scheduled' and new.status in('completed','cancelled','no_show')) then raise exception 'Invalid appointment status transition from % to %',old.status,new.status; end if;
  return new;
end $$;

drop function if exists public.reschedule_job_appointment(bigint,timestamptz,text);
create function public.reschedule_job_appointment(p_appointment_id bigint,p_appointment_date timestamptz,p_appointment_end_at timestamptz,p_notes text default null)
returns public.appointments language plpgsql security invoker set search_path='' as $$
declare v_existing public.appointments%rowtype; v_replacement public.appointments%rowtype;
begin
  if p_appointment_date is null or p_appointment_end_at is null then raise exception 'Replacement appointment start and end are required'; end if;
  if p_appointment_end_at<=p_appointment_date then raise exception 'Replacement appointment end must be after its start'; end if;
  select * into v_existing from public.appointments a where a.id=p_appointment_id and a.status='scheduled' for update;
  if not found then raise exception 'Scheduled appointment is not available'; end if;
  update public.appointments set status='cancelled' where id=v_existing.id;
  insert into public.appointments(workspace_id,job_id,lead_id,contractor_id,organization_id,appointment_date,appointment_end_at,status,notes,created_by)
  values(v_existing.workspace_id,v_existing.job_id,v_existing.lead_id,v_existing.contractor_id,v_existing.organization_id,p_appointment_date,p_appointment_end_at,'scheduled',coalesce(p_notes,v_existing.notes),(select auth.uid())) returning * into v_replacement;
  return v_replacement;
end $$;
revoke all on function public.reschedule_job_appointment(bigint,timestamptz,timestamptz,text) from public,anon;
grant execute on function public.reschedule_job_appointment(bigint,timestamptz,timestamptz,text) to authenticated,service_role;
