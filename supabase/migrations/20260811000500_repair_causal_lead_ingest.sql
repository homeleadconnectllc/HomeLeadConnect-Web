create or replace function causal._ingest_lead_impl(
  p_workspace_id uuid,
  p_phone text,
  p_full_name text,
  p_email text,
  p_status text,
  p_notes text,
  p_assigned_to uuid,
  p_source text,
  p_event_type text,
  p_request_payload jsonb
)
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, causal, public, extensions
as $$
declare
  v_phone text;
  v_lead_id bigint;
  v_state_hash text;
begin
  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if v_phone = '' then
    raise exception 'phone required';
  end if;

  insert into public.leads (
    workspace_id, phone, full_name, email, status, notes, assigned_to, source
  ) values (
    p_workspace_id, v_phone, p_full_name, p_email, coalesce(p_status, 'new'),
    p_notes, p_assigned_to, p_source
  )
  on conflict (workspace_id, phone)
  do update set
    full_name = coalesce(excluded.full_name, public.leads.full_name),
    email = coalesce(excluded.email, public.leads.email),
    status = coalesce(excluded.status, public.leads.status),
    notes = coalesce(excluded.notes, public.leads.notes),
    assigned_to = coalesce(excluded.assigned_to, public.leads.assigned_to),
    source = coalesce(excluded.source, public.leads.source),
    updated_at = now()
  returning id into v_lead_id;

  v_state_hash := encode(
    extensions.digest(
      jsonb_strip_nulls(
        jsonb_build_object(
          'workspace_id', p_workspace_id,
          'phone', v_phone,
          'event_type', coalesce(p_event_type, 'lead_upsert'),
          'payload', p_request_payload
        )
      )::text,
      'sha256'
    ),
    'hex'
  );

  insert into causal.leads_state (workspace_id, state_hash, status, data)
  values (
    p_workspace_id,
    v_state_hash,
    p_status,
    jsonb_build_object(
      'lead_id', v_lead_id,
      'event_type', p_event_type,
      'request', p_request_payload
    )
  )
  on conflict (state_hash) do nothing;

  return v_lead_id;
end;
$$;

revoke all on function causal._ingest_lead_impl(uuid, text, text, text, text, text, uuid, text, text, jsonb)
  from public, anon, authenticated;
