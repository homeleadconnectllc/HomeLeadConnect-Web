alter function causal.ingest_public_lead(text, text, text, text, text)
  set search_path = pg_catalog, causal, public, extensions;

alter function causal._ingest_lead_impl(uuid, text, text, text, text, text, uuid, text, text, jsonb)
  set search_path = pg_catalog, causal, public, extensions;

alter function causal._ingest_lead_impl(uuid, text, text, text, text, text, text, jsonb)
  set search_path = pg_catalog, causal, public, extensions;

revoke all on function causal._ingest_lead_impl(uuid, text, text, text, text, text, uuid, text, text, jsonb)
  from public, anon, authenticated;
revoke all on function causal._ingest_lead_impl(uuid, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;

revoke all on function public.claim_next_automation_job(integer) from public, anon, authenticated;
revoke all on function public.set_automation_job_success(uuid) from public, anon, authenticated;
revoke all on function public.set_automation_job_failed(uuid, text) from public, anon, authenticated;
grant execute on function public.claim_next_automation_job(integer) to service_role;
grant execute on function public.set_automation_job_success(uuid) to service_role;
grant execute on function public.set_automation_job_failed(uuid, text) to service_role;

create or replace function public.submit_public_service_request(
  p_form_slug text,
  p_request_id uuid,
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_project_details text default null
)
returns table (lead_id bigint, accepted boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_form public.public_forms%rowtype;
  v_lead_id bigint;
begin
  if p_request_id is null then
    raise exception 'A request identifier is required.' using errcode = '22023';
  end if;

  select * into v_form
  from public.public_forms
  where form_slug = btrim(p_form_slug)
    and enabled = true;

  if not found then
    raise exception 'This request form is unavailable.' using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Enter your name.' using errcode = '22023';
  end if;
  if char_length(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')) < 10 then
    raise exception 'Enter a valid phone number.' using errcode = '22023';
  end if;
  if p_email is not null and btrim(p_email) <> '' and p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;
  if char_length(btrim(coalesce(p_project_details, ''))) < 10 then
    raise exception 'Tell us briefly what service you need.' using errcode = '22023';
  end if;

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
