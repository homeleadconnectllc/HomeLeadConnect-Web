create or replace function public.contractor_record_job_progress(
  p_assignment_id uuid,
  p_status text,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_assignment public.job_assignments%rowtype;
  v_id uuid;
begin
  if p_status not in ('started','in_progress','blocked','completed') then
    raise exception 'Unsupported provider progress status.' using errcode='22023';
  end if;

  select ja.* into v_assignment
  from public.job_assignments ja
  where ja.id=p_assignment_id;
  if not found then
    raise exception 'Assignment not found.' using errcode='P0002';
  end if;

  if v_assignment.status <> 'accepted' then
    raise exception 'Only an accepted assignment can report service progress.' using errcode='22023';
  end if;

  if not exists(
    select 1
    from public.contractor_portal_links cpl
    where cpl.user_id=auth.uid()
      and cpl.workspace_id=v_assignment.workspace_id
      and cpl.contractor_id=v_assignment.contractor_id
      and cpl.revoked_at is null
  ) then
    raise exception 'Assignment is not authorized for this contractor account.' using errcode='42501';
  end if;

  insert into public.provider_job_progress(
    workspace_id, assignment_id, job_id, contractor_id, progress_status, note, created_by
  )
  values(
    v_assignment.workspace_id,
    v_assignment.id,
    v_assignment.job_id,
    v_assignment.contractor_id,
    p_status,
    nullif(btrim(coalesce(p_note,'')),''),
    auth.uid()
  )
  returning id into v_id;

  insert into public.activity_log(
    workspace_id, entity_type, entity_id, event_type, payload
  )
  values(
    v_assignment.workspace_id,
    'job',
    v_assignment.job_id,
    'provider.progress.'||p_status,
    jsonb_build_object(
      'assignment_id',v_assignment.id,
      'progress_id',v_id,
      'contractor_id',v_assignment.contractor_id
    )
  );

  return v_id;
end;
$function$;

revoke all on function public.contractor_record_job_progress(uuid,text,text) from public;
grant execute on function public.contractor_record_job_progress(uuid,text,text) to authenticated;
