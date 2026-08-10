create or replace function public.reschedule_job_appointment(
  p_appointment_id bigint,
  p_appointment_date timestamptz,
  p_notes text default null
)
returns public.appointments
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_existing public.appointments%rowtype;
  v_replacement public.appointments%rowtype;
begin
  if p_appointment_date is null then
    raise exception 'Replacement appointment date is required';
  end if;

  select * into v_existing
  from public.appointments a
  where a.id = p_appointment_id
    and a.status = 'scheduled'
  for update;

  if not found then
    raise exception 'Scheduled appointment is not available';
  end if;

  update public.appointments
  set status = 'cancelled'
  where id = v_existing.id;

  insert into public.appointments (
    workspace_id,
    job_id,
    lead_id,
    contractor_id,
    organization_id,
    appointment_date,
    status,
    notes,
    created_by
  ) values (
    v_existing.workspace_id,
    v_existing.job_id,
    v_existing.lead_id,
    v_existing.contractor_id,
    v_existing.organization_id,
    p_appointment_date,
    'scheduled',
    coalesce(p_notes, v_existing.notes),
    (select auth.uid())
  )
  returning * into v_replacement;

  return v_replacement;
end;
$$;

revoke all on function public.reschedule_job_appointment(bigint, timestamptz, text)
from public, anon;

grant execute on function public.reschedule_job_appointment(bigint, timestamptz, text)
to authenticated, service_role;
