-- Restore the canonical authenticated causal lead writer after production
-- reconciliation found the wrapper absent from the live app database while
-- public.create_workspace_lead(...) still depends on it.
--
-- This is a forward-only repair. It preserves the canonical single-writer
-- contract, workspace membership enforcement, phone normalization, causal state
-- evidence, and keeps browser roles from executing the internal writer directly.

create or replace function causal.ingest_lead(
  p_workspace_id uuid,
  p_phone text,
  p_full_name text default null,
  p_email text default null,
  p_status text default null,
  p_notes text default null,
  p_assigned_to uuid default null,
  p_source text default null,
  p_last_contacted_at timestamptz default null,
  p_next_follow_up_at timestamptz default null,
  p_appointment_at timestamptz default null,
  p_appointment_status text default null,
  p_assigned_until timestamptz default null,
  p_priority text default null,
  p_priority_score numeric default null,
  p_pipeline_stage_id uuid default null,
  p_pipeline_id uuid default null,
  p_organization_id uuid default null,
  p_first_name text default null,
  p_last_name text default null,
  p_score integer default null,
  p_archived boolean default null,
  p_event_type text default 'lead_upsert',
  p_request_payload jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_phone text;
  v_state_hash text;
  v_lead_id bigint;
begin
  v_phone := regexp_replace(coalesce(p_phone, ''), '\D+', '', 'g');
  if v_phone = '' then
    raise exception 'phone is required';
  end if;

  if auth.uid() is null then
    raise exception 'unauthenticated';
  end if;

  if not exists (
    select 1
    from public.workspace_members wm
    where wm.user_id = auth.uid()
      and wm.workspace_id = p_workspace_id
  ) then
    raise exception 'forbidden';
  end if;

  insert into public.leads (
    workspace_id,
    phone,
    full_name,
    email,
    status,
    notes,
    assigned_to,
    source,
    last_contacted_at,
    next_follow_up_at,
    appointment_at,
    appointment_status,
    assigned_until,
    priority,
    priority_score,
    pipeline_stage_id,
    pipeline_id,
    organization_id,
    first_name,
    last_name,
    score,
    archived
  )
  values (
    p_workspace_id,
    v_phone,
    p_full_name,
    p_email,
    p_status,
    p_notes,
    p_assigned_to,
    p_source,
    p_last_contacted_at,
    p_next_follow_up_at,
    p_appointment_at,
    p_appointment_status,
    p_assigned_until,
    p_priority,
    p_priority_score,
    p_pipeline_stage_id,
    p_pipeline_id,
    p_organization_id,
    p_first_name,
    p_last_name,
    p_score,
    p_archived
  )
  on conflict (workspace_id, phone)
  do update set
    full_name = coalesce(excluded.full_name, public.leads.full_name),
    email = coalesce(excluded.email, public.leads.email),
    status = coalesce(excluded.status, public.leads.status),
    updated_at = clock_timestamp();

  select l.id
    into v_lead_id
  from public.leads l
  where l.workspace_id = p_workspace_id
    and l.phone = v_phone;

  v_state_hash := encode(
    extensions.digest(
      jsonb_strip_nulls(
        jsonb_build_object(
          'payload', p_request_payload,
          'event_type', coalesce(p_event_type, 'lead_upsert'),
          'workspace_id', p_workspace_id,
          'phone', v_phone
        )
      )::text,
      'sha256'
    ),
    'hex'
  );

  insert into causal.leads_state (
    workspace_id,
    state_hash,
    status,
    data
  )
  values (
    p_workspace_id,
    v_state_hash,
    p_status,
    jsonb_build_object(
      'event_type', p_event_type,
      'lead_id', v_lead_id,
      'request', p_request_payload
    )
  )
  on conflict (state_hash) do nothing;

  return v_lead_id;
end;
$function$;

revoke all on function causal.ingest_lead(
  uuid, text, text, text, text, text, uuid, text,
  timestamptz, timestamptz, timestamptz, text, timestamptz,
  text, numeric, uuid, uuid, uuid, text, text, integer, boolean, text, jsonb
) from public, anon, authenticated;
