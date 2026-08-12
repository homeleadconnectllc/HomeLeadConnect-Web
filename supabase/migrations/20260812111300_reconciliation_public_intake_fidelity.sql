-- Restore the causal lead state and public request RPC required by /request-service.
-- This mirrors the established production intake contract while keeping direct causal writes private.

create schema if not exists causal;

create table if not exists causal.leads_state (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  state_hash text not null,
  status text,
  data jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists leads_state_hash_unique on causal.leads_state(state_hash);
alter table causal.leads_state enable row level security;
revoke all on causal.leads_state from public;
grant select on causal.leads_state to anon, authenticated;
grant insert, update on causal.leads_state to service_role;

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
  if v_phone = '' then raise exception 'phone required'; end if;

  insert into public.leads(workspace_id, phone, full_name, email, status, notes, assigned_to, source)
  values(p_workspace_id, v_phone, p_full_name, p_email, coalesce(p_status, 'new'), p_notes, p_assigned_to, p_source)
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
      jsonb_strip_nulls(jsonb_build_object(
        'workspace_id', p_workspace_id,
        'phone', v_phone,
        'event_type', coalesce(p_event_type, 'lead_upsert'),
        'payload', p_request_payload
      ))::text,
      'sha256'
    ),
    'hex'
  );

  insert into causal.leads_state(workspace_id, state_hash, status, data)
  values(
    p_workspace_id,
    v_state_hash,
    p_status,
    jsonb_build_object('lead_id', v_lead_id, 'event_type', p_event_type, 'request', p_request_payload)
  )
  on conflict(state_hash) do nothing;

  return v_lead_id;
end;
$$;

revoke all on function causal._ingest_lead_impl(uuid,text,text,text,text,text,uuid,text,text,jsonb)
  from public, anon, authenticated;

create or replace function public.submit_public_service_request(
  p_form_slug text,
  p_request_id uuid,
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_project_details text default null
)
returns table(lead_id bigint, accepted boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_form public.public_forms%rowtype;
  v_lead_id bigint;
begin
  if p_request_id is null then raise exception 'A request identifier is required.' using errcode='22023'; end if;

  select * into v_form
  from public.public_forms
  where form_slug = btrim(p_form_slug)
    and enabled = true;

  if not found then raise exception 'This request form is unavailable.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_full_name, ''))) < 2 then raise exception 'Enter your name.' using errcode='22023'; end if;
  if char_length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) < 10 then raise exception 'Enter a valid phone number.' using errcode='22023'; end if;
  if p_email is not null and btrim(p_email) <> '' and p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Enter a valid email address.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_project_details, ''))) < 10 then raise exception 'Tell us briefly what service you need.' using errcode='22023'; end if;

  select l.id into v_lead_id
  from public.leads l
  where l.workspace_id = v_form.workspace_id
    and l.request_id = p_request_id;

  if v_lead_id is null then
    v_lead_id := causal._ingest_lead_impl(
      v_form.workspace_id,
      p_phone,
      btrim(p_full_name),
      nullif(btrim(coalesce(p_email, '')), ''),
      'new',
      btrim(p_project_details),
      null,
      v_form.source,
      'public_service_request',
      jsonb_build_object('form_slug', v_form.form_slug, 'request_id', p_request_id)
    );

    update public.leads
    set request_id = coalesce(request_id, p_request_id)
    where id = v_lead_id;
  end if;

  return query select v_lead_id, true;
end;
$$;

revoke all on function public.submit_public_service_request(text,uuid,text,text,text,text) from public;
grant execute on function public.submit_public_service_request(text,uuid,text,text,text,text) to anon, authenticated, service_role;
