create table public.ai_capability_registry (
  capability_id text primary key,
  agent_id text not null check(agent_id in ('kendrell','dion','diamond')),
  level text not null check(level in ('READ','SUGGEST','EXECUTE','ESCALATE')),
  domain text not null,
  required_role text not null check(required_role in ('member','owner')),
  readiness_requirement text not null,
  approval_required boolean not null default false,
  audit_required boolean not null default true,
  idempotency_required boolean not null default true,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.ai_capability_registry(capability_id,agent_id,level,domain,required_role,readiness_requirement,approval_required) values
('executive_workspace_summary','kendrell','READ','executive','owner','canonical_workspace_data',false),
('launch_readiness_summary','kendrell','READ','launch','owner','canonical_readiness_data',false),
('create_owner_attention_item','kendrell','ESCALATE','executive','owner','agent_handoffs',false),
('operational_summary','dion','READ','operations','member','canonical_operations_data',false),
('followups_due','dion','READ','follow_ups','member','follow_ups',false),
('create_followup','dion','EXECUTE','follow_ups','member','follow_ups',false),
('customer_context','diamond','READ','customer_experience','member','authorized_lead_context',false),
('draft_customer_reply','diamond','SUGGEST','communications','member','authorized_lead_context',false),
('send_customer_communication','diamond','EXECUTE','communications','member','provider_and_compliance',true);

create table public.ai_agent_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  agent_id text not null check(agent_id in ('kendrell','dion','diamond')),
  capability_id text not null references public.ai_capability_registry(capability_id),
  mode text not null check(mode in ('READ','SUGGEST','EXECUTE','ESCALATE')),
  route_context text,
  related_entity_type text,
  related_entity_id text,
  request_summary jsonb not null default '{}'::jsonb,
  result_summary jsonb,
  status text not null check(status in ('running','succeeded','failed','blocked')),
  error_code text,
  error_summary text,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(workspace_id,auth_user_id,capability_id,idempotency_key)
);
create index ai_agent_runs_user_idx on public.ai_agent_runs(auth_user_id,created_at desc);
create index ai_agent_runs_workspace_agent_idx on public.ai_agent_runs(workspace_id,agent_id,created_at desc);

create table public.ai_agent_action_audit (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  run_id uuid not null references public.ai_agent_runs(id) on delete cascade,
  agent_id text not null,
  capability_id text not null,
  target_domain text not null,
  target_entity_type text,
  target_entity_id text,
  action text not null,
  input_summary jsonb not null default '{}'::jsonb,
  result_summary jsonb,
  status text not null check(status in ('succeeded','failed','blocked')),
  approval_required boolean not null,
  approved_by uuid references auth.users(id),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz not null default now()
);
create index ai_agent_action_audit_workspace_idx on public.ai_agent_action_audit(workspace_id,created_at desc);

create table public.ai_agent_handoffs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  source_agent text not null check(source_agent in ('kendrell','dion','diamond')),
  destination_agent text not null check(destination_agent in ('kendrell','dion','diamond')),
  related_entity_type text,
  related_entity_id text,
  reason text not null check(char_length(btrim(reason)) between 3 and 500),
  status text not null default 'open' check(status in ('open','resolved')),
  resolution text,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  unique(workspace_id,created_by,idempotency_key),
  check(source_agent<>destination_agent),
  check((status='resolved')=(resolved_at is not null))
);
create index ai_agent_handoffs_destination_idx on public.ai_agent_handoffs(workspace_id,destination_agent,status,created_at desc);

create table public.ai_owner_attention_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  agent_id text not null default 'kendrell' check(agent_id='kendrell'),
  related_entity_type text,
  related_entity_id text,
  reason text not null check(char_length(btrim(reason)) between 3 and 500),
  status text not null default 'open' check(status in ('open','resolved')),
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  unique(workspace_id,created_by,idempotency_key)
);
create index ai_owner_attention_workspace_idx on public.ai_owner_attention_items(workspace_id,status,created_at desc);

alter table public.ai_capability_registry enable row level security;
alter table public.ai_agent_runs enable row level security;
alter table public.ai_agent_action_audit enable row level security;
alter table public.ai_agent_handoffs enable row level security;
alter table public.ai_owner_attention_items enable row level security;

create policy ai_capabilities_authenticated_read on public.ai_capability_registry for select to authenticated using (enabled);
create policy ai_runs_own_read on public.ai_agent_runs for select to authenticated using (
  auth_user_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.workspace_id=ai_agent_runs.workspace_id)
  and exists(select 1 from public.workspace_members wm where wm.workspace_id=ai_agent_runs.workspace_id and wm.user_id=(select auth.uid()))
);
create policy ai_audit_own_or_owner_read on public.ai_agent_action_audit for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=ai_agent_action_audit.workspace_id and wm.user_id=(select auth.uid()))
  and exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.workspace_id=ai_agent_action_audit.workspace_id)
  and (auth_user_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.workspace_id=ai_agent_action_audit.workspace_id and lower(p.role)='owner'))
);
create policy ai_handoffs_workspace_read on public.ai_agent_handoffs for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=ai_agent_handoffs.workspace_id and wm.user_id=(select auth.uid()))
  and exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.workspace_id=ai_agent_handoffs.workspace_id)
);
create policy ai_owner_attention_owner_read on public.ai_owner_attention_items for select to authenticated using (
  exists(select 1 from public.profiles p where p.user_id=(select auth.uid()) and p.workspace_id=ai_owner_attention_items.workspace_id and lower(p.role)='owner')
  and exists(select 1 from public.workspace_members wm where wm.workspace_id=ai_owner_attention_items.workspace_id and wm.user_id=(select auth.uid()))
);

grant select on public.ai_capability_registry,public.ai_agent_runs,public.ai_agent_action_audit,public.ai_agent_handoffs to authenticated;
grant select on public.ai_owner_attention_items to authenticated;
grant all on public.ai_capability_registry,public.ai_agent_runs,public.ai_agent_action_audit,public.ai_agent_handoffs to service_role;
grant all on public.ai_owner_attention_items to service_role;

create or replace function public.run_hlc_agent_capability(
  p_agent_id text,p_capability_id text,p_input jsonb default '{}'::jsonb,p_idempotency_key uuid default gen_random_uuid(),p_route_context text default null
)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_workspace_id uuid; v_role text; v_cap public.ai_capability_registry%rowtype; v_run_id uuid; v_result jsonb:='{}'::jsonb;
  v_status text:='succeeded'; v_error_code text; v_error_summary text; v_related_type text; v_related_id text;
  v_lead_id bigint; v_lead_uuid uuid; v_followup_id bigint; v_due timestamptz; v_attention_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id,lower(p.role) into v_workspace_id,v_role from public.profiles p where p.user_id=auth.uid();
  if v_workspace_id is null or not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;
  select * into v_cap from public.ai_capability_registry c where c.capability_id=lower(p_capability_id) and c.enabled;
  if not found or v_cap.agent_id<>lower(p_agent_id) then raise exception 'Agent capability is not allowed.' using errcode='42501'; end if;
  if v_cap.required_role='owner' and v_role<>'owner' then raise exception 'Owner authorization is required.' using errcode='42501'; end if;
  if p_input ? 'workspace_id' then raise exception 'Workspace identity is server controlled.' using errcode='42501'; end if;

  v_related_type:=nullif(lower(btrim(p_input->>'related_entity_type')),'');
  v_related_id:=nullif(btrim(p_input->>'related_entity_id'),'');
  select r.id,r.status,r.result_summary,r.error_code,r.error_summary into v_run_id,v_status,v_result,v_error_code,v_error_summary
  from public.ai_agent_runs r where r.workspace_id=v_workspace_id and r.auth_user_id=auth.uid()
    and r.capability_id=v_cap.capability_id and r.idempotency_key=p_idempotency_key;
  if found then return jsonb_build_object('run_id',v_run_id,'status',v_status,'result',v_result,'error_code',v_error_code,'error',v_error_summary); end if;
  v_status:='succeeded';v_result:='{}'::jsonb;v_error_code:=null;v_error_summary:=null;

  insert into public.ai_agent_runs(workspace_id,auth_user_id,agent_id,capability_id,mode,route_context,related_entity_type,related_entity_id,
    request_summary,status,idempotency_key)
  values(v_workspace_id,auth.uid(),v_cap.agent_id,v_cap.capability_id,v_cap.level,left(p_route_context,160),v_related_type,v_related_id,
    jsonb_build_object('input_keys',coalesce((select jsonb_agg(k) from jsonb_object_keys(coalesce(p_input,'{}'::jsonb)) k),'[]'::jsonb)),
    'running',p_idempotency_key) returning id into v_run_id;

  if v_cap.capability_id='executive_workspace_summary' then
    select jsonb_build_object(
      'leads',(select count(*) from public.leads l where l.workspace_id=v_workspace_id and not l.archived),
      'jobs',(select count(*) from public.crm_jobs j where j.workspace_id=v_workspace_id),
      'open_followups',(select count(*) from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=v_workspace_id and f.status='pending'),
      'open_agent_escalations',(select count(*) from public.ai_agent_handoffs h where h.workspace_id=v_workspace_id and h.destination_agent='kendrell' and h.status='open'),
      'owner_attention_items',(select count(*) from public.ai_owner_attention_items i where i.workspace_id=v_workspace_id and i.status='open'),
      'subscription_status',coalesce((select s.status from public.subscriptions s where s.workspace_id=v_workspace_id order by s.updated_at desc limit 1),'not_configured'),
      'communications',jsonb_build_object('twilio',coalesce((select bool_or(pc.status='connected') from public.communication_provider_connections pc where pc.workspace_id=v_workspace_id and pc.provider_name='twilio'),false),'google_voice_manual',coalesce((select bool_or(pc.status='manual_available') from public.communication_provider_connections pc where pc.workspace_id=v_workspace_id and pc.provider_name='google_voice'),false),'email',coalesce((select bool_or(pc.status='connected') from public.communication_provider_connections pc where pc.workspace_id=v_workspace_id and pc.channel='email'),false))
    ) into v_result;
  elsif v_cap.capability_id='launch_readiness_summary' then
    select jsonb_build_object(
      'launch_go',false,
      'blocking_reasons',jsonb_strip_nulls(jsonb_build_object(
        'paid_subscription',case when exists(select 1 from public.workspace_plan_status s where s.workspace_id=v_workspace_id and s.is_active) then null else 'Webhook-derived paid/trial entitlement is not active.' end,
        'twilio',case when exists(select 1 from public.communication_provider_connections pc where pc.workspace_id=v_workspace_id and pc.provider_name='twilio' and pc.status='connected') then null else 'Twilio is not connected.' end,
        'email',case when exists(select 1 from public.communication_provider_connections pc where pc.workspace_id=v_workspace_id and pc.channel='email' and pc.status='connected') then null else 'Transactional email is not connected.' end,
        'production_acceptance','Production browser/mobile acceptance is not recorded by this runtime.'
      )),
      'statement','Kendrell will not declare launch GO while canonical blockers remain.'
    ) into v_result;
  elsif v_cap.capability_id='operational_summary' then
    select jsonb_build_object(
      'new_leads',(select count(*) from public.leads l where l.workspace_id=v_workspace_id and lower(coalesce(l.status,'new'))='new' and not l.archived),
      'pending_jobs',(select count(*) from public.crm_jobs j where j.workspace_id=v_workspace_id and j.status='pending'),
      'jobs_without_active_assignment',(select count(*) from public.crm_jobs j where j.workspace_id=v_workspace_id and j.status not in ('completed','cancelled') and not exists(select 1 from public.job_assignments a where a.job_id=j.id and a.status in ('offered','accepted'))),
      'offered_assignments',(select count(*) from public.job_assignments a where a.workspace_id=v_workspace_id and a.status='offered'),
      'overdue_followups',(select count(*) from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=v_workspace_id and f.status='pending' and f.scheduled_for<now()),
      'today_appointments',(select count(*) from public.appointments a where a.workspace_id=v_workspace_id and a.status='scheduled' and a.appointment_date::date=(now() at time zone 'America/New_York')::date)
    ) into v_result;
  elsif v_cap.capability_id='followups_due' then
    select coalesce(jsonb_agg(jsonb_build_object('id',q.id,'lead_id',q.lead_id,'scheduled_for',q.scheduled_for,'notes',q.notes) order by q.scheduled_for),'[]'::jsonb)
    into v_result from (select f.id,f.lead_id,f.scheduled_for,f.notes from public.follow_ups f join public.leads l on l.id_uuid=f.lead_id where l.workspace_id=v_workspace_id and f.status='pending' and f.scheduled_for<=now()+interval '7 days' order by f.scheduled_for limit 25) q;
  elsif v_cap.capability_id='create_followup' then
    v_lead_id:=(p_input->>'lead_id')::bigint; v_due:=(p_input->>'scheduled_for')::timestamptz;
    select l.id_uuid into v_lead_uuid from public.leads l where l.id=v_lead_id and l.workspace_id=v_workspace_id;
    if v_lead_uuid is null then v_status:='blocked';v_error_code:='ENTITY_NOT_AUTHORIZED';v_error_summary:='Lead is unavailable in the current workspace.';
    elsif v_due is null or v_due<=now() then v_status:='failed';v_error_code:='INVALID_DUE_DATE';v_error_summary:='Follow-up due date must be in the future.';
    else insert into public.follow_ups(lead_id,assigned_user_id,status,scheduled_for,notes,follow_up_type)
      values(v_lead_uuid,auth.uid(),'pending',v_due,nullif(left(btrim(p_input->>'notes'),2000),''),'call') returning id into v_followup_id;
      v_result:=jsonb_build_object('follow_up_id',v_followup_id,'status','pending','scheduled_for',v_due);
    end if;
  elsif v_cap.capability_id in ('customer_context','draft_customer_reply') then
    v_lead_id:=(p_input->>'lead_id')::bigint;
    if not exists(select 1 from public.leads l where l.id=v_lead_id and l.workspace_id=v_workspace_id) then
      v_status:='blocked';v_error_code:='ENTITY_NOT_AUTHORIZED';v_error_summary:='Customer context is unavailable in the current workspace.';
    elsif v_cap.capability_id='customer_context' then
      select jsonb_build_object('lead_id',l.id,'name',l.full_name,'status',l.status,
        'jobs',(select coalesce(jsonb_agg(jsonb_build_object('id',j.id,'name',j.name,'status',j.status)),'[]'::jsonb) from public.crm_jobs j where j.workspace_id=v_workspace_id and j.lead_id=l.id),
        'appointments',(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'date',a.appointment_date,'status',a.status)),'[]'::jsonb) from public.appointments a where a.workspace_id=v_workspace_id and a.lead_id=l.id))
      into v_result from public.leads l where l.id=v_lead_id and l.workspace_id=v_workspace_id;
    else
      select jsonb_build_object('draft',format('Hello %s, thank you for connecting with HomeLead Connect. We can help clarify the next step for your service request. Please reply with any questions.',coalesce(nullif(split_part(l.full_name,' ',1),''),'there')),'delivery_status','draft_only','provider_status','AI Provider Setup Required')
      into v_result from public.leads l where l.id=v_lead_id and l.workspace_id=v_workspace_id;
    end if;
  elsif v_cap.capability_id='send_customer_communication' then
    v_status:='blocked';v_error_code:='APPROVAL_AND_PROVIDER_REQUIRED';v_error_summary:='Diamond may draft, but sending requires human approval plus a connected canonical transport and compliance check.';
  elsif v_cap.capability_id='create_owner_attention_item' then
    insert into public.ai_owner_attention_items(workspace_id,created_by,related_entity_type,related_entity_id,reason,idempotency_key)
    values(v_workspace_id,auth.uid(),v_related_type,v_related_id,left(btrim(coalesce(p_input->>'reason','Owner attention requested.')),500),p_idempotency_key)
    returning id into v_attention_id; v_result:=jsonb_build_object('attention_item_id',v_attention_id,'status','open');
  else v_status:='blocked';v_error_code:='HANDLER_UNAVAILABLE';v_error_summary:='The deterministic capability handler is unavailable.'; end if;

  update public.ai_agent_runs set result_summary=case when v_status='succeeded' then v_result else null end,status=v_status,
    error_code=v_error_code,error_summary=v_error_summary,completed_at=now() where id=v_run_id;
  if v_cap.level in ('EXECUTE','ESCALATE') then
    insert into public.ai_agent_action_audit(workspace_id,auth_user_id,run_id,agent_id,capability_id,target_domain,target_entity_type,target_entity_id,
      action,input_summary,result_summary,status,approval_required,approved_by,idempotency_key)
    values(v_workspace_id,auth.uid(),v_run_id,v_cap.agent_id,v_cap.capability_id,v_cap.domain,v_related_type,v_related_id,v_cap.capability_id,
      jsonb_build_object('input_keys',coalesce((select jsonb_agg(k) from jsonb_object_keys(coalesce(p_input,'{}'::jsonb)) k),'[]'::jsonb)),v_result,v_status,v_cap.approval_required,
      case when not v_cap.approval_required and v_status='succeeded' then auth.uid() else null end,p_idempotency_key);
  end if;
  return jsonb_build_object('run_id',v_run_id,'status',v_status,'result',case when v_status='succeeded' then v_result else null end,'error_code',v_error_code,'error',v_error_summary);
exception when invalid_text_representation or datetime_field_overflow then
  update public.ai_agent_runs set status='failed',error_code='INVALID_INPUT',error_summary='Capability input is invalid.',completed_at=now() where id=v_run_id;
  return jsonb_build_object('run_id',v_run_id,'status','failed','error_code','INVALID_INPUT','error','Capability input is invalid.');
end; $$;

create or replace function public.create_hlc_agent_handoff(
  p_source_agent text,p_destination_agent text,p_reason text,p_related_entity_type text default null,p_related_entity_id text default null,p_idempotency_key uuid default gen_random_uuid()
)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_workspace_id uuid;v_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501';end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then raise exception 'Workspace membership is required.' using errcode='42501';end if;
  if not ((lower(p_source_agent)='diamond' and lower(p_destination_agent) in ('dion','kendrell')) or (lower(p_source_agent)='dion' and lower(p_destination_agent)='kendrell')) then
    raise exception 'This agent handoff is not allowed.' using errcode='42501';end if;
  if lower(coalesce(p_related_entity_type,''))='lead' and not exists(select 1 from public.leads l where l.id=p_related_entity_id::bigint and l.workspace_id=v_workspace_id) then
    raise exception 'Related lead is not in the current workspace.' using errcode='42501';end if;
  insert into public.ai_agent_handoffs(workspace_id,created_by,source_agent,destination_agent,related_entity_type,related_entity_id,reason,idempotency_key)
  values(v_workspace_id,auth.uid(),lower(p_source_agent),lower(p_destination_agent),nullif(lower(btrim(p_related_entity_type)),''),nullif(btrim(p_related_entity_id),''),btrim(p_reason),p_idempotency_key)
  on conflict(workspace_id,created_by,idempotency_key) do update set idempotency_key=public.ai_agent_handoffs.idempotency_key returning id into v_id;
  return v_id;
end; $$;

revoke all on function public.run_hlc_agent_capability(text,text,jsonb,uuid,text) from public,anon;
revoke all on function public.create_hlc_agent_handoff(text,text,text,text,text,uuid) from public,anon;
grant execute on function public.run_hlc_agent_capability(text,text,jsonb,uuid,text) to authenticated,service_role;
grant execute on function public.create_hlc_agent_handoff(text,text,text,text,text,uuid) to authenticated,service_role;
