-- HCX Connected Core: durable automation execution truth and retry evidence.
--
-- A trigger or RPC response is not completion proof. Every attempt is recorded,
-- failures survive the caught exception, retries reuse the canonical job, and
-- only owner/manager workspace members may inspect or invoke this control plane.

alter table public.automation_jobs drop constraint if exists automation_jobs_status_check;
alter table public.automation_jobs
  add constraint automation_jobs_status_check
  check (status in ('queued','processing','success','failed','retry_wait','blocked'));

create table if not exists public.automation_job_attempts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  automation_job_id uuid not null references public.automation_jobs(id) on delete cascade,
  attempt_number integer not null check (attempt_number between 1 and 10),
  status text not null check (status in ('processing','success','failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  result jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  unique (automation_job_id, attempt_number),
  check (
    (status='processing' and completed_at is null)
    or (status='success' and completed_at is not null and result is not null and error_message is null)
    or (status='failed' and completed_at is not null and error_message is not null)
  )
);

create index if not exists automation_job_attempts_workspace_created_idx
  on public.automation_job_attempts(workspace_id, created_at desc);
create index if not exists automation_job_attempts_job_idx
  on public.automation_job_attempts(automation_job_id, attempt_number);

alter table public.automation_job_attempts enable row level security;
revoke all on table public.automation_job_attempts from public, anon, authenticated;
grant select on table public.automation_job_attempts to authenticated;
grant all on table public.automation_job_attempts to service_role;

drop policy if exists automation_job_attempts_select_internal_management on public.automation_job_attempts;
create policy automation_job_attempts_select_internal_management
on public.automation_job_attempts
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id=automation_job_attempts.workspace_id
      and wm.user_id=(select auth.uid())
      and lower(coalesce(wm.role,'')) in ('owner','manager')
  )
);

-- Remove legacy broad-member policies. Browser writes remain RPC-only and the
-- single management SELECT policy is the canonical history boundary.
drop policy if exists "automation_jobs insert workspace members" on public.automation_jobs;
drop policy if exists "automation_jobs select workspace members" on public.automation_jobs;
drop policy if exists "automation_jobs update workspace members" on public.automation_jobs;
drop policy if exists automation_jobs_select_workspace on public.automation_jobs;
drop policy if exists automation_jobs_select_internal_management on public.automation_jobs;

create policy automation_jobs_select_internal_management
on public.automation_jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id=automation_jobs.workspace_id
      and wm.user_id=(select auth.uid())
      and lower(coalesce(wm.role,'')) in ('owner','manager')
  )
);

revoke all on table public.automation_jobs from public, anon, authenticated;
grant select on table public.automation_jobs to authenticated;
grant all on table public.automation_jobs to service_role;

create or replace function internal.compute_hlc_automation_result(
  p_workspace_id uuid,
  p_job_type text
)
returns jsonb
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  v_result jsonb;
begin
  if p_job_type='workflow_health_check' then
    select jsonb_build_object(
      'open_leads',(select count(*) from public.leads l where l.workspace_id=p_workspace_id and not l.archived),
      'open_jobs',(select count(*) from public.crm_jobs j where j.workspace_id=p_workspace_id and j.status not in ('completed','cancelled')),
      'offered_assignments',(select count(*) from public.job_assignments a where a.workspace_id=p_workspace_id and a.status='offered'),
      'accepted_assignments',(select count(*) from public.job_assignments a where a.workspace_id=p_workspace_id and a.status='accepted'),
      'scheduled_appointments',(select count(*) from public.appointments a where a.workspace_id=p_workspace_id and a.status='scheduled')
    ) into v_result;
  elsif p_job_type='followup_scan' then
    select jsonb_build_object(
      'overdue',(select count(*) from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=p_workspace_id and f.status='pending' and f.scheduled_for<now()),
      'next_7_days',(select count(*) from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=p_workspace_id and f.status='pending' and f.scheduled_for>=now() and f.scheduled_for<=now()+interval '7 days')
    ) into v_result;
  elsif p_job_type='owner_attention_scan' then
    select jsonb_build_object(
      'open_handoffs',(select count(*) from public.ai_agent_handoffs h where h.workspace_id=p_workspace_id and h.destination_agent='kendrell' and h.status='open'),
      'open_attention_items',(select count(*) from public.ai_owner_attention_items i where i.workspace_id=p_workspace_id and i.status='open')
    ) into v_result;
  else
    raise exception 'Unsupported automation job type.' using errcode='22023';
  end if;
  return v_result;
end;
$function$;

create or replace function internal.execute_hlc_automation_attempt(p_job_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_job public.automation_jobs%rowtype;
  v_attempt_id uuid;
  v_attempt_number integer;
  v_result jsonb;
  v_error text;
  v_exhausted boolean;
begin
  select * into v_job
  from public.automation_jobs j
  where j.id=p_job_id
  for update;

  if not found then
    raise exception 'Automation job was not found.' using errcode='P0002';
  end if;
  if v_job.status not in ('queued','retry_wait') then
    return jsonb_build_object(
      'id',v_job.id,'job_type',v_job.job_type,'status',v_job.status,
      'result',v_job.result,'duplicate',true,'attempt_count',v_job.retry_count,
      'max_attempts',v_job.max_attempts,'exhausted',v_job.status='failed'
    );
  end if;
  if v_job.retry_count>=v_job.max_attempts then
    update public.automation_jobs
    set status='failed',completed_at=coalesce(completed_at,now()),updated_at=now()
    where id=v_job.id;
    return jsonb_build_object(
      'id',v_job.id,'job_type',v_job.job_type,'status','failed',
      'result',v_job.result,'duplicate',true,'attempt_count',v_job.retry_count,
      'max_attempts',v_job.max_attempts,'exhausted',true
    );
  end if;

  v_attempt_number := v_job.retry_count + 1;
  update public.automation_jobs
  set status='processing',retry_count=v_attempt_number,locked_at=now(),locked_by=auth.uid(),
      failed_at=null,error_message=null,last_error=null,completed_at=null,updated_at=now()
  where id=v_job.id;

  insert into public.automation_job_attempts(
    workspace_id,automation_job_id,attempt_number,status
  ) values (
    v_job.workspace_id,v_job.id,v_attempt_number,'processing'
  ) returning id into v_attempt_id;

  begin
    v_result := internal.compute_hlc_automation_result(v_job.workspace_id,v_job.job_type);

    update public.automation_job_attempts
    set status='success',result=v_result,completed_at=now()
    where id=v_attempt_id;

    update public.automation_jobs
    set status='success',result=v_result,completed_at=now(),failed_at=null,
        error_message=null,last_error=null,locked_at=null,locked_by=null,updated_at=now()
    where id=v_job.id;

    insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
    values(v_job.workspace_id,'automation',v_job.id,'automation.succeeded',
      jsonb_build_object('job_type',v_job.job_type,'result',v_result,'attempt_number',v_attempt_number));

    return jsonb_build_object(
      'id',v_job.id,'job_type',v_job.job_type,'status','success','result',v_result,
      'duplicate',false,'attempt_count',v_attempt_number,'max_attempts',v_job.max_attempts,'exhausted',false
    );
  exception when others then
    v_error := left(sqlerrm,500);
    v_exhausted := v_attempt_number>=v_job.max_attempts;

    update public.automation_job_attempts
    set status='failed',error_message=v_error,completed_at=now()
    where id=v_attempt_id;

    update public.automation_jobs
    set status=case when v_exhausted then 'failed' else 'retry_wait' end,
        failed_at=now(),completed_at=case when v_exhausted then now() else null end,
        error_message=v_error,last_error=v_error,result=null,run_at=now(),
        locked_at=null,locked_by=null,updated_at=now()
    where id=v_job.id;

    insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
    values(v_job.workspace_id,'automation',v_job.id,
      case when v_exhausted then 'automation.retry_exhausted' else 'automation.attempt_failed' end,
      jsonb_build_object(
        'job_type',v_job.job_type,'attempt_number',v_attempt_number,
        'max_attempts',v_job.max_attempts,'retryable',not v_exhausted
      ));

    return jsonb_build_object(
      'id',v_job.id,'job_type',v_job.job_type,
      'status',case when v_exhausted then 'failed' else 'retry_wait' end,
      'result',null,'duplicate',false,'attempt_count',v_attempt_number,
      'max_attempts',v_job.max_attempts,'exhausted',v_exhausted,
      'error','Automation attempt failed.'
    );
  end;
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
  v_job public.automation_jobs%rowtype;
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

  select * into v_job
  from public.automation_jobs j
  where j.workspace_id=v_workspace_id and j.idempotency_key=p_idempotency_key;
  if found then
    return jsonb_build_object(
      'id',v_job.id,'job_type',v_job.job_type,'status',v_job.status,
      'result',v_job.result,'duplicate',true,'attempt_count',v_job.retry_count,
      'max_attempts',v_job.max_attempts,'exhausted',v_job.status='failed'
    );
  end if;

  insert into public.automation_jobs(
    workspace_id,job_type,status,retry_count,max_attempts,payload,created_by,run_at,idempotency_key
  ) values (
    v_workspace_id,p_job_type,'queued',0,3,coalesce(p_payload,'{}'::jsonb),auth.uid(),now(),p_idempotency_key
  ) returning * into v_job;

  return internal.execute_hlc_automation_attempt(v_job.id);
end;
$function$;

create or replace function public.retry_hlc_automation(p_job_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_role text;
  v_job public.automation_jobs%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  v_workspace_id := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace_id is null then raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  if v_role not in ('owner','manager') then raise exception 'Automation control requires an owner or manager role.' using errcode='42501'; end if;

  select * into v_job
  from public.automation_jobs j
  where j.id=p_job_id and j.workspace_id=v_workspace_id;
  if not found then raise exception 'Automation job was not found.' using errcode='P0002'; end if;
  if v_job.status<>'retry_wait' then
    return jsonb_build_object(
      'id',v_job.id,'job_type',v_job.job_type,'status',v_job.status,
      'result',v_job.result,'duplicate',true,'attempt_count',v_job.retry_count,
      'max_attempts',v_job.max_attempts,'exhausted',v_job.status='failed'
    );
  end if;

  return internal.execute_hlc_automation_attempt(v_job.id);
end;
$function$;

revoke all on function internal.compute_hlc_automation_result(uuid,text) from public,anon,authenticated,service_role;
revoke all on function internal.execute_hlc_automation_attempt(uuid) from public,anon,authenticated,service_role;
revoke all on function public.run_hlc_automation(text,jsonb,uuid) from public,anon;
grant execute on function public.run_hlc_automation(text,jsonb,uuid) to authenticated,service_role;
revoke all on function public.retry_hlc_automation(uuid) from public,anon;
grant execute on function public.retry_hlc_automation(uuid) to authenticated,service_role;
