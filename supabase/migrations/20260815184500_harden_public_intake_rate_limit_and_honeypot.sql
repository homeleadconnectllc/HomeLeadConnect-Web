create table if not exists public.public_intake_attempts (
  id bigint generated always as identity primary key,
  form_slug text not null,
  request_id uuid not null,
  fingerprint text not null,
  accepted boolean not null default false,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (form_slug, request_id)
);

alter table public.public_intake_attempts enable row level security;
revoke all on table public.public_intake_attempts from anon, authenticated;

create index if not exists public_intake_attempts_fingerprint_created_idx
  on public.public_intake_attempts (fingerprint, created_at desc);

create or replace function public.enforce_public_intake_guard(
  p_form_slug text,
  p_request_id uuid,
  p_phone text,
  p_email text,
  p_honeypot text default ''
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_slug text := btrim(coalesce(p_form_slug, ''));
  v_fingerprint text;
  v_prior boolean;
  v_recent integer;
begin
  if p_request_id is null or v_slug = '' then return false; end if;

  select a.accepted into v_prior
  from public.public_intake_attempts a
  where a.form_slug = v_slug and a.request_id = p_request_id;
  if found then return v_prior; end if;

  v_fingerprint := md5(
    lower(v_slug) || '|' ||
    regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g') || '|' ||
    lower(btrim(coalesce(p_email, '')))
  );

  if btrim(coalesce(p_honeypot, '')) <> '' then
    insert into public.public_intake_attempts(form_slug, request_id, fingerprint, accepted, reason)
    values (v_slug, p_request_id, v_fingerprint, false, 'honeypot');
    return false;
  end if;

  select count(*)::integer into v_recent
  from public.public_intake_attempts a
  where a.fingerprint = v_fingerprint
    and a.created_at >= now() - interval '15 minutes';

  if v_recent >= 5 then
    insert into public.public_intake_attempts(form_slug, request_id, fingerprint, accepted, reason)
    values (v_slug, p_request_id, v_fingerprint, false, 'rate_limited');
    return false;
  end if;

  insert into public.public_intake_attempts(form_slug, request_id, fingerprint, accepted, reason)
  values (v_slug, p_request_id, v_fingerprint, true, 'allowed');
  return true;
end;
$function$;

revoke all on function public.enforce_public_intake_guard(text,uuid,text,text,text) from public;
grant execute on function public.enforce_public_intake_guard(text,uuid,text,text,text) to anon,authenticated;

drop function if exists public.submit_public_service_request(text,uuid,text,text,text,text);
create function public.submit_public_service_request(
  p_form_slug text,
  p_request_id uuid,
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_project_details text default null,
  p_honeypot text default ''
)
returns table(lead_id bigint, accepted boolean)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_form public.public_forms%rowtype;
  v_lead_id bigint;
begin
  if p_request_id is null then raise exception 'A request identifier is required.' using errcode='22023'; end if;
  select * into v_form from public.public_forms where form_slug=btrim(p_form_slug) and enabled=true;
  if not found then raise exception 'This request form is unavailable.' using errcode='22023'; end if;
  if not public.enforce_public_intake_guard(p_form_slug,p_request_id,p_phone,p_email,p_honeypot) then return query select null::bigint,false; return; end if;

  if char_length(btrim(coalesce(p_full_name,'')))<2 then raise exception 'Enter your name.' using errcode='22023'; end if;
  if char_length(regexp_replace(coalesce(p_phone,''),'[^0-9]','','g'))<10 then raise exception 'Enter a valid phone number.' using errcode='22023'; end if;
  if p_email is not null and btrim(p_email)<>'' and p_email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Enter a valid email address.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_project_details,'')))<10 then raise exception 'Tell us briefly what service you need.' using errcode='22023'; end if;

  select l.id into v_lead_id from public.leads l where l.workspace_id=v_form.workspace_id and l.request_id=p_request_id;
  if v_lead_id is null then
    v_lead_id := causal._ingest_lead_impl(
      v_form.workspace_id,p_phone,btrim(p_full_name),nullif(btrim(coalesce(p_email,'')),''),'new',btrim(p_project_details),null,v_form.source,'public_service_request',jsonb_build_object('form_slug',v_form.form_slug,'request_id',p_request_id)
    );
    update public.leads set request_id=coalesce(request_id,p_request_id) where id=v_lead_id;
  end if;
  return query select v_lead_id,true;
end;
$function$;

revoke all on function public.submit_public_service_request(text,uuid,text,text,text,text,text) from public;
grant execute on function public.submit_public_service_request(text,uuid,text,text,text,text,text) to anon,authenticated;

drop function if exists public.submit_professional_application(text,uuid,text,text,text,text,text,text,text,boolean);
create function public.submit_professional_application(
  p_form_slug text,
  p_request_id uuid,
  p_organization_name text,
  p_contact_name text,
  p_email text,
  p_phone text,
  p_trade_categories text,
  p_service_territory text,
  p_experience_summary text,
  p_communication_consent boolean,
  p_honeypot text default ''
)
returns table(application_id uuid, accepted boolean)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_form public.public_forms%rowtype;
  v_application_id uuid;
begin
  if p_request_id is null then raise exception 'A request identifier is required.' using errcode='22023'; end if;
  select * into v_form from public.public_forms where form_slug=btrim(p_form_slug) and enabled=true;
  if not found then raise exception 'Professional applications are unavailable.' using errcode='22023'; end if;
  if not public.enforce_public_intake_guard(p_form_slug,p_request_id,p_phone,p_email,p_honeypot) then return query select null::uuid,false; return; end if;

  if char_length(btrim(coalesce(p_organization_name,'')))<2 then raise exception 'Enter the organization name.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_contact_name,'')))<2 then raise exception 'Enter the primary contact name.' using errcode='22023'; end if;
  if coalesce(p_email,'') !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then raise exception 'Enter a valid email address.' using errcode='22023'; end if;
  if char_length(regexp_replace(coalesce(p_phone,''),'[^0-9]','','g'))<10 then raise exception 'Enter a valid phone number.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_trade_categories,'')))<2 then raise exception 'Enter at least one trade or service.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_service_territory,'')))<2 then raise exception 'Enter the service territory.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_experience_summary,'')))<10 then raise exception 'Tell us about your experience.' using errcode='22023'; end if;
  if p_communication_consent is not true then raise exception 'Consent to application-related communication is required.' using errcode='22023'; end if;

  insert into public.professional_applications(
    workspace_id,request_id,organization_name,contact_name,email,phone,
    trade_categories,service_territory,experience_summary,communication_consent
  ) values(
    v_form.workspace_id,p_request_id,btrim(p_organization_name),btrim(p_contact_name),
    lower(btrim(p_email)),btrim(p_phone),btrim(p_trade_categories),
    btrim(p_service_territory),btrim(p_experience_summary),true
  )
  on conflict(workspace_id,request_id) do update set request_id=excluded.request_id
  returning id into v_application_id;
  return query select v_application_id,true;
end;
$function$;

revoke all on function public.submit_professional_application(text,uuid,text,text,text,text,text,text,text,boolean,text) from public;
grant execute on function public.submit_professional_application(text,uuid,text,text,text,text,text,text,text,boolean,text) to anon,authenticated;
