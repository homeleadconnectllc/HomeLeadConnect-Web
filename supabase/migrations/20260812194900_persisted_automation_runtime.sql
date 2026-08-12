alter table public.automation_jobs
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists run_at timestamptz not null default now(),
  add column if not exists completed_at timestamptz,
  add column if not exists last_error text,
  add column if not exists result jsonb,
  add column if not exists idempotency_key uuid not null default gen_random_uuid();

create unique index if not exists automation_jobs_workspace_idempotency_uidx
  on public.automation_jobs(workspace_id, idempotency_key);
create index if not exists automation_jobs_workspace_created_idx
  on public.automation_jobs(workspace_id, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'automation_jobs_status_check'
      and conrelid = 'public.automation_jobs'::regclass
  ) then
    alter table public.automation_jobs
      add constraint automation_jobs_status_check
      check (status in ('queued','running','succeeded','failed','blocked'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'automation_jobs_attempts_check'
      and conrelid = 'public.automation_jobs'::regclass
  ) then
    alter table public.automation_jobs
      add constraint automation_jobs_attempts_check
      check (retry_count >= 0 and max_attempts between 1 and 10);
  end if;
end $$;

revoke all on table public.automation_jobs from anon, authenticated;
grant select on table public.automation_jobs to authenticated;

alter table public.automation_jobs enable row level security;
drop policy if exists automation_jobs_select_workspace on public.automation_jobs;
create policy automation_jobs_select_workspace
on public.automation_jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = automation_jobs.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create or replace function public.run_hlc_automation(
  p_job_type text,
  p_payload jsonb default '{}'::jsonb,
  p_idempotency_key uuid default gen_random_uuid()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_workspace_id uuid;
  v_job_id uuid;
  v_result jsonb := '{}'::jsonb;
  v_existing public.automation_jobs%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  select p.workspace_id into v_workspace_id
  from public.profiles p
  where p.user_id = auth.uid();

  if v_workspace_id is null or not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = v_workspace_id and wm.user_id = auth.uid()
  ) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  p_job_type := lower(btrim(p_job_type));
  if p_job_type not in ('workflow_health_check','followup_scan','owner_attention_scan') then
    raise exception 'Unsupported automation job type.' using errcode='22023';
  end if;

  select * into v_existing
  from public.automation_jobs j
  where j.workspace_id = v_workspace_id
    and j.idempotency_key = p_idempotency_key;

  if found then
    return jsonb_build_object(
      'id', v_existing.id,
      'status', v_existing.status,
      'job_type', v_existing.job_type,
      'result', v_existing.result,
      'duplicate', true
    );
  end if;

  insert into public.automation_jobs(
    workspace_id, job_type, status, retry_count, max_attempts,
    payload, created_by, run_at, idempotency_key
  ) values (
    v_workspace_id, p_job_type, 'running', 0, 1,
    coalesce(p_payload, '{}'::jsonb), auth.uid(), now(), p_idempotency_key
  ) returning id into v_job_id;

  if p_job_type = 'workflow_health_check' then
    select jsonb_build_object(
      'open_leads', (select count(*) from public.leads l where l.workspace_id=v_workspace_id and not l.archived),
      'open_jobs', (select count(*) from public.crm_jobs j where j.workspace_id=v_workspace_id and j.status not in ('completed','cancelled')),
      'offered_assignments', (select count(*) from public.job_assignments a where a.workspace_id=v_workspace_id and a.status='offered'),
      'accepted_assignments', (select count(*) from public.job_assignments a where a.workspace_id=v_workspace_id and a.status='accepted'),
      'scheduled_appointments', (select count(*) from public.appointments a where a.workspace_id=v_workspace_id and a.status='scheduled')
    ) into v_result;
  elsif p_job_type = 'followup_scan' then
    select jsonb_build_object(
      'overdue', (
        select count(*) from public.follow_ups f
        join public.leads l on l.id_uuid=f.lead_id
        where l.workspace_id=v_workspace_id and f.status='pending' and f.scheduled_for < now()
      ),
      'next_7_days', (
        select count(*) from public.follow_ups f
        join public.leads l on l.id_uuid=f.lead_id
        where l.workspace_id=v_workspace_id and f.status='pending'
          and f.scheduled_for >= now() and f.scheduled_for <= now()+interval '7 days'
      )
    ) into v_result;
  elsif p_job_type = 'owner_attention_scan' then
    select jsonb_build_object(
      'open_handoffs', (select count(*) from public.ai_agent_handoffs h where h.workspace_id=v_workspace_id and h.destination_agent='kendrell' and h.status='open'),
      'open_attention_items', (select count(*) from public.ai_owner_attention_items i where i.workspace_id=v_workspace_id and i.status='open')
    ) into v_result;
  end if;

  update public.automation_jobs
  set status='succeeded', result=v_result, completed_at=now(), updated_at=now()
  where id=v_job_id;

  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_workspace_id,'automation',v_job_id,'automation.succeeded',jsonb_build_object('job_type',p_job_type,'result',v_result));

  return jsonb_build_object('id',v_job_id,'status','succeeded','job_type',p_job_type,'result',v_result,'duplicate',false);
exception when others then
  if v_job_id is not null then
    update public.automation_jobs
    set status='failed', last_error=left(sqlerrm,500), completed_at=now(), updated_at=now()
    where id=v_job_id;
  end if;
  raise;
end;
$$;

revoke all on function public.run_hlc_automation(text,jsonb,uuid) from public;
grant execute on function public.run_hlc_automation(text,jsonb,uuid) to authenticated;
