insert into public.public_forms (form_slug, workspace_id, enabled, source)
select 'lead-vacuum', w.id, true, 'lead_vacuum'
from public.workspaces w
where w.name = 'HomeLead Connect'
  and not exists (
    select 1 from public.public_forms pf where pf.form_slug = 'lead-vacuum'
  );

create or replace function public.submit_public_lead_vacuum(
  p_request_id uuid,
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_intent text default null,
  p_service_area text default null,
  p_timeline text default null,
  p_preferred_contact_method text default null,
  p_notes text default null,
  p_consent_contact boolean default false,
  p_consent_timestamp timestamptz default null,
  p_source_platform text default 'direct',
  p_utm_source text default null,
  p_utm_medium text default null,
  p_utm_campaign text default null,
  p_utm_content text default null,
  p_utm_term text default null,
  p_landing_url text default null,
  p_referrer text default null
)
returns table (lead_id bigint, accepted boolean)
language plpgsql
security definer
set search_path = pg_catalog, public, causal, extensions
as $$
declare
  v_form public.public_forms%rowtype;
  v_lead_id bigint;
  v_phone text;
  v_source_platform text;
  v_preferred_contact_method text;
  v_payload jsonb;
begin
  if p_request_id is null then
    raise exception 'A request identifier is required.' using errcode = '22023';
  end if;

  select * into v_form
  from public.public_forms
  where form_slug = 'lead-vacuum'
    and enabled = true;

  if not found then
    raise exception 'Lead intake is unavailable.' using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Enter your name.' using errcode = '22023';
  end if;

  v_phone := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  if char_length(v_phone) < 10 then
    raise exception 'Enter a valid phone number.' using errcode = '22023';
  end if;

  if p_email is not null
    and btrim(p_email) <> ''
    and p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;

  if p_consent_contact is distinct from true then
    raise exception 'Contact consent is required.' using errcode = '22023';
  end if;

  if p_consent_timestamp is null then
    raise exception 'Consent timestamp is required.' using errcode = '22023';
  end if;

  v_source_platform := lower(btrim(coalesce(p_source_platform, 'direct')));
  if v_source_platform not in ('facebook', 'instagram', 'tiktok', 'direct', 'other') then
    v_source_platform := 'other';
  end if;

  v_preferred_contact_method := lower(nullif(btrim(coalesce(p_preferred_contact_method, '')), ''));
  if v_preferred_contact_method is not null
    and v_preferred_contact_method not in ('call', 'text', 'email') then
    raise exception 'Choose a valid preferred contact method.' using errcode = '22023';
  end if;

  select l.id into v_lead_id
  from public.leads l
  where l.workspace_id = v_form.workspace_id
    and l.request_id = p_request_id;

  if v_lead_id is not null then
    return query select v_lead_id, true;
    return;
  end if;

  v_payload := jsonb_strip_nulls(jsonb_build_object(
    'form_slug', 'lead-vacuum',
    'request_id', p_request_id,
    'intent', nullif(btrim(coalesce(p_intent, '')), ''),
    'service_area', nullif(btrim(coalesce(p_service_area, '')), ''),
    'timeline', nullif(btrim(coalesce(p_timeline, '')), ''),
    'preferred_contact_method', v_preferred_contact_method,
    'consent', jsonb_build_object(
      'contact', true,
      'timestamp', p_consent_timestamp
    ),
    'attribution', jsonb_strip_nulls(jsonb_build_object(
      'source_platform', v_source_platform,
      'utm_source', nullif(btrim(coalesce(p_utm_source, '')), ''),
      'utm_medium', nullif(btrim(coalesce(p_utm_medium, '')), ''),
      'utm_campaign', nullif(btrim(coalesce(p_utm_campaign, '')), ''),
      'utm_content', nullif(btrim(coalesce(p_utm_content, '')), ''),
      'utm_term', nullif(btrim(coalesce(p_utm_term, '')), ''),
      'landing_url', nullif(left(btrim(coalesce(p_landing_url, '')), 2048), ''),
      'referrer', nullif(left(btrim(coalesce(p_referrer, '')), 2048), '')
    ))
  ));

  v_lead_id := causal._ingest_lead_impl(
    v_form.workspace_id,
    v_phone,
    btrim(p_full_name),
    nullif(lower(btrim(coalesce(p_email, ''))), ''),
    'new',
    nullif(btrim(coalesce(p_notes, '')), ''),
    null,
    'lead_vacuum:' || v_source_platform,
    'lead_vacuum_submission',
    v_payload
  );

  update public.leads
  set request_id = coalesce(request_id, p_request_id)
  where id = v_lead_id;

  return query select v_lead_id, true;
end;
$$;

revoke all on function public.submit_public_lead_vacuum(
  uuid, text, text, text, text, text, text, text, text, boolean,
  timestamptz, text, text, text, text, text, text, text, text
) from public, anon, authenticated;

grant execute on function public.submit_public_lead_vacuum(
  uuid, text, text, text, text, text, text, text, text, boolean,
  timestamptz, text, text, text, text, text, text, text, text
) to service_role;
