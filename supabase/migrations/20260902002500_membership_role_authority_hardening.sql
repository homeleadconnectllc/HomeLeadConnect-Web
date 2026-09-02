-- Launch-stabilization hardening: workspace membership role is the authorization source.
-- profiles.workspace_id remains only the selected-workspace pointer; profiles.role is not trusted for authority.

create or replace function public.current_workspace_id()
returns uuid
language sql
stable
set search_path to ''
as $function$
  select p.workspace_id
  from public.profiles p
  join public.workspace_members wm
    on wm.workspace_id = p.workspace_id
   and wm.user_id = p.user_id
  where p.user_id = auth.uid()
  limit 1
$function$;

create or replace function public.current_workspace_role()
returns text
language sql
stable
set search_path to ''
as $function$
  select lower(coalesce(wm.role, ''))
  from public.profiles p
  join public.workspace_members wm
    on wm.workspace_id = p.workspace_id
   and wm.user_id = p.user_id
  where p.user_id = auth.uid()
  limit 1
$function$;

create or replace function public.hlc_is_workspace_owner(p_workspace_id uuid)
returns boolean
language sql
stable
set search_path to ''
as $function$
  select auth.uid() is not null
     and exists (
       select 1
       from public.workspace_members wm
       where wm.workspace_id = p_workspace_id
         and wm.user_id = auth.uid()
         and lower(coalesce(wm.role, '')) = 'owner'
     )
$function$;

create or replace function public.create_lead_if_under_limit(
  p_workspace_id uuid,
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_pipeline_stage_id uuid
)
returns table(
  id uuid,
  workspace_id uuid,
  user_id uuid,
  full_name text,
  email text,
  pipeline_stage_id uuid,
  created_at timestamptz
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_limit int;
  v_count int;
begin
  if (select auth.role()) <> 'service_role' and not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = (select auth.uid())
      and lower(coalesce(wm.role, '')) in ('owner', 'manager', 'technician')
  ) then
    raise exception 'Internal workspace access is required.' using errcode='42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_workspace_id::text));

  select wps.lead_limit into v_limit
  from public.workspace_plan_status wps
  where wps.workspace_id = p_workspace_id and wps.is_active = true;

  if v_limit is null then raise exception 'ENTITLEMENT_NOT_FOUND_OR_INACTIVE'; end if;

  select count(*) into v_count
  from public.leads_new ln
  where ln.workspace_id = p_workspace_id and ln.archived = false;

  if v_count >= v_limit then raise exception 'LEAD_LIMIT_REACHED'; end if;

  return query
  insert into public.leads_new (
    workspace_id,user_id,full_name,email,pipeline_stage_id,archived,stage_updated_at,updated_at
  ) values (
    p_workspace_id,p_user_id,p_full_name,p_email,p_pipeline_stage_id,false,now(),now()
  )
  returning leads_new.id,leads_new.workspace_id,leads_new.user_id,leads_new.full_name,
            leads_new.email,leads_new.pipeline_stage_id,leads_new.created_at;
end;
$function$;

create or replace function public.create_partner_source(
  p_display_name text,
  p_organization_name text,
  p_contact_email text,
  p_linked_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
  v_id uuid;
begin
  v_workspace := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace is null or v_role not in ('owner','manager','admin') then
    raise exception 'Management access is required.' using errcode='42501';
  end if;
  if length(btrim(coalesce(p_display_name,''))) < 2 then raise exception 'Partner display name is required.' using errcode='22023'; end if;
  if p_linked_user_id is null then raise exception 'A linked account user is required.' using errcode='22023'; end if;

  insert into public.partner_sources(workspace_id,display_name,organization_name,contact_email,linked_user_id,status,created_by)
  values(v_workspace,btrim(p_display_name),nullif(btrim(coalesce(p_organization_name,'')),''),nullif(lower(btrim(coalesce(p_contact_email,''))),''),p_linked_user_id,'active',auth.uid())
  on conflict(workspace_id,linked_user_id) do update
    set display_name=excluded.display_name,organization_name=excluded.organization_name,contact_email=excluded.contact_email,status='active',updated_at=now()
  returning id into v_id;
  return v_id;
end;
$function$;

create or replace function public.create_partner_source_by_email(
  p_display_name text,
  p_organization_name text,
  p_account_email text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
  v_user_id uuid;
  v_id uuid;
begin
  v_workspace := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  select u.id into v_user_id from auth.users u where lower(u.email)=lower(btrim(p_account_email)) limit 1;
  if v_user_id is null then raise exception 'No registered account matches that email.' using errcode='P0002'; end if;
  if length(btrim(coalesce(p_display_name,'')))<2 then raise exception 'Partner display name is required.' using errcode='22023'; end if;
  insert into public.partner_sources(workspace_id,display_name,organization_name,contact_email,linked_user_id,status,created_by)
  values(v_workspace,btrim(p_display_name),nullif(btrim(coalesce(p_organization_name,'')),''),lower(btrim(p_account_email)),v_user_id,'active',auth.uid())
  on conflict(workspace_id,linked_user_id) do update set display_name=excluded.display_name,organization_name=excluded.organization_name,contact_email=excluded.contact_email,status='active',updated_at=now()
  returning id into v_id;
  return v_id;
end;
$function$;

create or replace function public.create_resident_job_payment_request(p_job_id uuid, p_amount numeric)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
  v_id uuid;
begin
  if p_amount is null or p_amount <= 0 then raise exception 'Payment amount must be positive.' using errcode='22023'; end if;
  v_workspace := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  if not exists(select 1 from public.crm_jobs j where j.id=p_job_id and j.workspace_id=v_workspace) then raise exception 'Job is not in the current workspace.' using errcode='42501'; end if;

  insert into public.resident_job_payments(workspace_id,job_id,amount,created_by)
  values(v_workspace,p_job_id,p_amount,auth.uid())
  on conflict(workspace_id,job_id) do update set amount=excluded.amount,updated_at=now()
  returning id into v_id;
  return v_id;
end;
$function$;

create or replace function public.create_resident_provider_match(
  p_lead_id bigint,
  p_contractor_id bigint,
  p_rationale text default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
  v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  v_workspace := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace is null or v_role not in ('owner','manager','admin') then
    raise exception 'Management access is required.' using errcode='42501';
  end if;
  if not exists(select 1 from public.leads l where l.id=p_lead_id and l.workspace_id=v_workspace) then
    raise exception 'Lead is not in the current workspace.' using errcode='42501';
  end if;
  if not exists(select 1 from public.contractors c where c.id=p_contractor_id and c.workspace_id=v_workspace) then
    raise exception 'Provider is not in the current workspace.' using errcode='42501';
  end if;

  insert into public.resident_provider_matches(workspace_id,lead_id,contractor_id,rationale,created_by)
  values(v_workspace,p_lead_id,p_contractor_id,nullif(btrim(coalesce(p_rationale,'')),''),auth.uid())
  on conflict(workspace_id,lead_id,contractor_id) do update
    set status='proposed', rationale=excluded.rationale, updated_at=now(), resident_decided_by=null, resident_decided_at=null
  returning id into v_id;

  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_workspace,'lead',p_lead_id::text,'resident.match.proposed',jsonb_build_object('match_id',v_id,'contractor_id',p_contractor_id));
  return v_id;
end;
$function$;

create or replace function public.perform_dashboard_action(
  p_lead_id bigint,
  p_action text,
  p_actor_id uuid,
  p_request_id uuid default gen_random_uuid()
)
returns table(
  id bigint,
  full_name text,
  phone text,
  last_call_outcome text,
  next_follow_up_at timestamptz,
  priority_score numeric,
  queue_bucket text,
  next_best_action text,
  archived boolean
)
language plpgsql
security definer
set search_path to '', 'pg_temp'
as $function$
declare
  v_lead public.leads%rowtype;
  v_has_request boolean;
begin
  select l.* into v_lead from public.leads l where l.id=p_lead_id for update;
  if not found then raise exception 'Lead not found'; end if;
  if (select auth.role()) <> 'service_role' then
    if (select auth.uid()) is null or p_actor_id is distinct from (select auth.uid()) then
      raise exception 'Authenticated actor mismatch.' using errcode='42501';
    end if;
    if not exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id=v_lead.workspace_id
        and wm.user_id=(select auth.uid())
        and lower(coalesce(wm.role,'')) in ('owner','manager','technician')
    ) then raise exception 'Internal workspace access is required.' using errcode='42501'; end if;
  end if;
  select exists (select 1 from public.call_logs cl where cl.request_id=p_request_id) into v_has_request;
  if v_has_request then return query select * from public.compute_lead_dashboard_row(p_lead_id); return; end if;
  if v_lead.archived then raise exception 'Action not allowed: lead is archived'; end if;
  p_action := lower(btrim(p_action));
  if p_action='call' and v_lead.next_follow_up_at is not null and v_lead.next_follow_up_at>now() then raise exception 'Action not allowed: lead is snoozed'; end if;
  if p_action='call' then
    insert into public.call_logs (lead_id,outcome,created_at,workspace_id,request_id) values (p_lead_id,'call_attempted',now(),v_lead.workspace_id,p_request_id);
    update public.leads set last_contacted_at=now() where id=p_lead_id;
  elsif p_action='snooze' then update public.leads set next_follow_up_at=now()+interval '60 minutes' where id=p_lead_id;
  elsif p_action='complete' then update public.leads set archived=true where id=p_lead_id;
  elsif p_action='sms' then null;
  else raise exception 'Invalid action: %',p_action;
  end if;
  return query select * from public.compute_lead_dashboard_row(p_lead_id);
end;
$function$;

create or replace function public.record_operations_exception_disposition(
  p_source_type text,
  p_source_id text,
  p_disposition text,
  p_note text default null,
  p_affected_route text default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
  v_id uuid;
begin
  if p_disposition not in ('resolved','escalated','deferred') then raise exception 'Unsupported exception disposition.' using errcode='22023'; end if;
  if length(btrim(coalesce(p_source_type,''))) < 2 or length(btrim(coalesce(p_source_id,''))) < 1 then raise exception 'Exception source is required.' using errcode='22023'; end if;
  v_workspace := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Operations management access is required.' using errcode='42501'; end if;

  insert into public.operations_exception_dispositions(workspace_id,source_type,source_id,disposition,note,affected_route,created_by)
  values(v_workspace,lower(btrim(p_source_type)),btrim(p_source_id),p_disposition,nullif(btrim(coalesce(p_note,'')),''),nullif(btrim(coalesce(p_affected_route,'')),''),auth.uid())
  returning id into v_id;
  return v_id;
end;
$function$;

create or replace function public.run_hlc_automation(
  p_job_type text,
  p_payload jsonb default '{}'::jsonb,
  p_idempotency_key uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_role text;
  v_job_id uuid;
  v_result jsonb := '{}'::jsonb;
  v_existing public.automation_jobs%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  v_workspace_id := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace_id is null then raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  if v_role not in ('owner','manager') then raise exception 'Automation control requires an owner or manager role.' using errcode='42501'; end if;

  p_job_type := lower(btrim(p_job_type));
  if p_job_type not in ('workflow_health_check','followup_scan','owner_attention_scan') then
    raise exception 'Unsupported automation job type.' using errcode='22023';
  end if;

  select * into v_existing
  from public.automation_jobs j
  where j.workspace_id=v_workspace_id and j.idempotency_key=p_idempotency_key;
  if found then
    return jsonb_build_object('id',v_existing.id,'status',v_existing.status,'job_type',v_existing.job_type,'result',v_existing.result,'duplicate',true);
  end if;

  insert into public.automation_jobs(workspace_id,job_type,status,retry_count,max_attempts,payload,created_by,run_at,idempotency_key)
  values(v_workspace_id,p_job_type,'processing',0,1,coalesce(p_payload,'{}'::jsonb),auth.uid(),now(),p_idempotency_key)
  returning id into v_job_id;

  if p_job_type='workflow_health_check' then
    select jsonb_build_object(
      'open_leads',(select count(*) from public.leads l where l.workspace_id=v_workspace_id and not l.archived),
      'open_jobs',(select count(*) from public.crm_jobs j where j.workspace_id=v_workspace_id and j.status not in ('completed','cancelled')),
      'offered_assignments',(select count(*) from public.job_assignments a where a.workspace_id=v_workspace_id and a.status='offered'),
      'accepted_assignments',(select count(*) from public.job_assignments a where a.workspace_id=v_workspace_id and a.status='accepted'),
      'scheduled_appointments',(select count(*) from public.appointments a where a.workspace_id=v_workspace_id and a.status='scheduled')
    ) into v_result;
  elsif p_job_type='followup_scan' then
    select jsonb_build_object(
      'overdue',(select count(*) from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=v_workspace_id and f.status='pending' and f.scheduled_for<now()),
      'next_7_days',(select count(*) from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=v_workspace_id and f.status='pending' and f.scheduled_for>=now() and f.scheduled_for<=now()+interval '7 days')
    ) into v_result;
  elsif p_job_type='owner_attention_scan' then
    select jsonb_build_object(
      'open_handoffs',(select count(*) from public.ai_agent_handoffs h where h.workspace_id=v_workspace_id and h.destination_agent='kendrell' and h.status='open'),
      'open_attention_items',(select count(*) from public.ai_owner_attention_items i where i.workspace_id=v_workspace_id and i.status='open')
    ) into v_result;
  end if;

  update public.automation_jobs set status='success',result=v_result,completed_at=now(),updated_at=now() where id=v_job_id;
  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_workspace_id,'automation',v_job_id,'automation.succeeded',jsonb_build_object('job_type',p_job_type,'result',v_result));
  return jsonb_build_object('id',v_job_id,'status','success','job_type',p_job_type,'result',v_result,'duplicate',false);
exception when others then
  if v_job_id is not null then
    update public.automation_jobs set status='failed',last_error=left(sqlerrm,500),completed_at=now(),updated_at=now() where id=v_job_id;
  end if;
  raise;
end;
$function$;

create or replace function public.run_hlc_scheduled_workflow_scan()
returns integer
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace record;
  v_result jsonb;
  v_job_id uuid;
  v_created integer := 0;
begin
  for v_workspace in
    select distinct wm.workspace_id
    from public.workspace_members wm
    where lower(coalesce(wm.role,'')) in ('owner','manager')
  loop
    if exists (
      select 1 from public.automation_jobs j
      where j.workspace_id=v_workspace.workspace_id
        and j.job_type='workflow_automation_scan'
        and j.created_at>=now()-interval '50 minutes'
        and j.status='success'
    ) then continue; end if;

    select jsonb_build_object(
      'observed_at',now(),
      'source','pg_cron',
      'workflow_health',jsonb_build_object(
        'open_leads',(select count(*) from public.leads l where l.workspace_id=v_workspace.workspace_id and not l.archived),
        'open_jobs',(select count(*) from public.crm_jobs j where j.workspace_id=v_workspace.workspace_id and j.status not in ('completed','cancelled')),
        'offered_assignments',(select count(*) from public.job_assignments a where a.workspace_id=v_workspace.workspace_id and a.status='offered'),
        'accepted_assignments',(select count(*) from public.job_assignments a where a.workspace_id=v_workspace.workspace_id and a.status='accepted'),
        'scheduled_appointments',(select count(*) from public.appointments a where a.workspace_id=v_workspace.workspace_id and a.status='scheduled')
      ),
      'followups',jsonb_build_object(
        'overdue',(select count(*) from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=v_workspace.workspace_id and f.status='pending' and f.scheduled_for<now()),
        'next_7_days',(select count(*) from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=v_workspace.workspace_id and f.status='pending' and f.scheduled_for>=now() and f.scheduled_for<=now()+interval '7 days')
      ),
      'owner_attention',jsonb_build_object(
        'open_handoffs',(select count(*) from public.ai_agent_handoffs h where h.workspace_id=v_workspace.workspace_id and h.destination_agent='kendrell' and h.status='open'),
        'open_attention_items',(select count(*) from public.ai_owner_attention_items i where i.workspace_id=v_workspace.workspace_id and i.status='open')
      )
    ) into v_result;

    insert into public.automation_jobs(workspace_id,job_type,status,retry_count,max_attempts,payload,result,run_at,completed_at,created_by)
    values(v_workspace.workspace_id,'workflow_automation_scan','success',0,1,jsonb_build_object('source','pg_cron','mode','automatic','read_only',true),v_result,now(),now(),null)
    returning id into v_job_id;

    insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
    values(v_workspace.workspace_id,'automation',v_job_id,'automation.scheduled_workflow_scan_succeeded',jsonb_build_object('job_type','workflow_automation_scan','result',v_result));
    v_created := v_created + 1;
  end loop;
  return v_created;
end;
$function$;

create or replace function public.set_contractor_verification(
  p_contractor_id bigint,
  p_status text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
begin
  if p_status not in ('unverified','pending','verified','rejected','suspended') then raise exception 'Unsupported verification status.' using errcode='22023'; end if;
  v_workspace := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  update public.contractors
  set verification_status=p_status,
      verification_note=nullif(btrim(coalesce(p_note,'')),''),
      verified_at=case when p_status='verified' then now() else null end,
      verified_by=case when p_status='verified' then auth.uid() else null end,
      updated_at=now()
  where id=p_contractor_id and workspace_id=v_workspace;
  if not found then raise exception 'Provider is not in the current workspace.' using errcode='42501'; end if;
end;
$function$;

create or replace function public.set_partner_referral_status(p_referral_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  if p_status not in ('recorded','reviewing','qualified','converted','closed','declined') then raise exception 'Unsupported referral status.' using errcode='22023'; end if;
  v_workspace := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace is null or v_role not in ('owner','manager','admin') then raise exception 'Management access is required.' using errcode='42501'; end if;
  update public.partner_referrals set status=p_status,updated_at=now() where id=p_referral_id and workspace_id=v_workspace;
  if not found then raise exception 'Referral is not in the current workspace.' using errcode='42501'; end if;
end;
$function$;

create or replace function public.transition_crm_job(p_job_id uuid, p_status text)
returns public.crm_jobs
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_job public.crm_jobs%rowtype;
  v_role text;
begin
  if v_user_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if p_status not in ('active','completed','cancelled') then raise exception 'Unsupported job transition.' using errcode='22023'; end if;
  select * into v_job from public.crm_jobs j where j.id=p_job_id for update;
  if not found then raise exception 'Job not found.' using errcode='P0002'; end if;
  select lower(coalesce(wm.role,'')) into v_role
  from public.workspace_members wm
  where wm.user_id=v_user_id and wm.workspace_id=v_job.workspace_id;
  if v_role not in ('owner','manager') then raise exception 'Manager or owner authorization is required to change the canonical job lifecycle.' using errcode='42501'; end if;
  if v_job.status='pending' and p_status='active' then
    if not exists(
      select 1 from public.job_assignments ja
      join public.appointments a on a.workspace_id=ja.workspace_id and a.job_id=ja.job_id and a.contractor_id=ja.contractor_id
      where ja.workspace_id=v_job.workspace_id and ja.job_id=v_job.id and ja.status='accepted' and a.status in ('scheduled','completed')
    ) then raise exception 'An accepted provider assignment with scheduled work is required before activating a job.' using errcode='22023'; end if;
  elsif v_job.status='active' and p_status='completed' then
    if not exists(
      select 1 from public.job_assignments ja
      join public.appointments a on a.workspace_id=ja.workspace_id and a.job_id=ja.job_id and a.contractor_id=ja.contractor_id
      where ja.workspace_id=v_job.workspace_id and ja.job_id=v_job.id and ja.status='accepted' and a.status='completed'
    ) then raise exception 'A completed appointment for the accepted provider is required before completing a job.' using errcode='22023'; end if;
  elsif v_job.status in ('pending','active') and p_status='cancelled' then
    null;
  else
    raise exception 'Invalid job lifecycle transition from % to %.',v_job.status,p_status using errcode='22023';
  end if;
  update public.crm_jobs set status=p_status,updated_at=now() where id=v_job.id returning * into v_job;
  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_job.workspace_id,'job',v_job.id,'job.lifecycle.'||p_status,jsonb_build_object('actor_user_id',v_user_id,'actor_role',v_role,'new_status',p_status));
  return v_job;
end;
$function$;

-- Keep explicit execution surfaces unchanged; this migration changes authority derivation only.
