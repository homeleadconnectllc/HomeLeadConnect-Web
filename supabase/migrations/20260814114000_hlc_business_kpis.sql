create or replace function public.get_hlc_business_kpis(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace uuid;
  v_days integer := greatest(1, least(coalesce(p_days,30),365));
  v_since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days,30),365)));
  v_leads bigint := 0;
  v_estimates bigint := 0;
  v_accepted_estimates bigint := 0;
  v_converted_estimates bigint := 0;
  v_jobs bigint := 0;
  v_assignments bigint := 0;
  v_accepted_assignments bigint := 0;
  v_appointments bigint := 0;
  v_completed_appointments bigint := 0;
  v_pending_followups bigint := 0;
  v_overdue_followups bigint := 0;
  v_calls bigint := 0;
  v_missed_calls bigint := 0;
  v_voicemails bigint := 0;
  v_pipeline_value numeric := 0;
  v_job_value numeric := 0;
begin
  if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
  select p.workspace_id into v_workspace from public.profiles p where p.user_id=v_user and p.workspace_id is not null limit 1;
  if v_workspace is null then
    select wm.workspace_id into v_workspace from public.workspace_members wm where wm.user_id=v_user order by wm.created_at asc limit 1;
  end if;
  if v_workspace is null or not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace and wm.user_id=v_user) then
    raise exception 'workspace access denied' using errcode='42501';
  end if;

  select count(*) into v_leads from public.leads where workspace_id=v_workspace and created_at>=v_since and coalesce(archived,false)=false;
  select count(*), count(*) filter(where status='accepted'), count(*) filter(where status='converted'), coalesce(sum(total) filter(where status in ('sent','accepted')),0)
    into v_estimates,v_accepted_estimates,v_converted_estimates,v_pipeline_value
    from public.estimates where workspace_id=v_workspace and created_at>=v_since;
  select count(*), coalesce(sum(contract_value),0) into v_jobs,v_job_value from public.crm_jobs where workspace_id=v_workspace and created_at>=v_since;
  select count(*), count(*) filter(where status='accepted') into v_assignments,v_accepted_assignments from public.job_assignments where workspace_id=v_workspace and created_at>=v_since;
  select count(*), count(*) filter(where status='completed') into v_appointments,v_completed_appointments from public.appointments where workspace_id=v_workspace and created_at>=v_since;
  select count(*) filter(where f.status='pending'), count(*) filter(where f.status='pending' and f.scheduled_for < now())
    into v_pending_followups,v_overdue_followups
    from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=v_workspace and f.created_at>=v_since;
  select count(*), count(*) filter(where normalized_state='no_answer'), count(*) filter(where normalized_state='voicemail')
    into v_calls,v_missed_calls,v_voicemails from public.call_sessions where workspace_id=v_workspace and started_at>=v_since;

  return jsonb_build_object(
    'days',v_days,
    'leads',v_leads,
    'estimates',v_estimates,
    'accepted_estimates',v_accepted_estimates,
    'converted_estimates',v_converted_estimates,
    'lead_to_estimate_rate',case when v_leads>0 then round((v_estimates::numeric/v_leads::numeric)*100,1) else 0 end,
    'estimate_acceptance_rate',case when v_estimates>0 then round(((v_accepted_estimates+v_converted_estimates)::numeric/v_estimates::numeric)*100,1) else 0 end,
    'estimate_to_job_rate',case when v_estimates>0 then round((v_converted_estimates::numeric/v_estimates::numeric)*100,1) else 0 end,
    'jobs',v_jobs,
    'job_value',v_job_value,
    'open_estimate_value',v_pipeline_value,
    'assignments',v_assignments,
    'accepted_assignments',v_accepted_assignments,
    'assignment_acceptance_rate',case when v_assignments>0 then round((v_accepted_assignments::numeric/v_assignments::numeric)*100,1) else 0 end,
    'appointments',v_appointments,
    'completed_appointments',v_completed_appointments,
    'pending_followups',v_pending_followups,
    'overdue_followups',v_overdue_followups,
    'calls',v_calls,
    'missed_calls',v_missed_calls,
    'voicemails',v_voicemails
  );
end;
$$;
revoke all on function public.get_hlc_business_kpis(integer) from public;
grant execute on function public.get_hlc_business_kpis(integer) to authenticated;
