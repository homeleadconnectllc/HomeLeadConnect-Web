-- Add a controlled browser-facing RPC for staff-created CRM leads while preserving
-- public.leads as a server-only INSERT surface.
--
-- This wrapper derives workspace identity from the authenticated profile, requires
-- canonical workspace membership and an internal role, enforces the active plan
-- lead limit, validates basic contact fields, and delegates the write to the
-- existing canonical causal single-writer function.

create or replace function public.create_workspace_lead(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_notes text default null,
  p_source text default 'manual_crm'
)
returns bigint
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_workspace_id uuid;
  v_role text;
  v_phone text;
  v_lead_id bigint;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select p.workspace_id, lower(coalesce(p.role, ''))
    into v_workspace_id, v_role
  from public.profiles p
  where p.user_id = v_user_id;

  if v_workspace_id is null or not exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = v_workspace_id
      and wm.user_id = v_user_id
  ) then
    raise exception 'Workspace membership is required.' using errcode = '42501';
  end if;

  if v_role not in ('owner', 'manager', 'technician') then
    raise exception 'Internal workspace access is required.' using errcode = '42501';
  end if;

  if not public.can_insert_lead(v_workspace_id) then
    raise exception 'LEAD_LIMIT_REACHED' using errcode = 'P0001';
  end if;

  if char_length(btrim(coalesce(p_full_name, ''))) < 2 then
    raise exception 'Enter a lead name.' using errcode = '22023';
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

  if char_length(coalesce(p_notes, '')) > 4000 then
    raise exception 'Lead notes may contain up to 4,000 characters.' using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_source, 'manual_crm'))) > 120 then
    raise exception 'Lead source is too long.' using errcode = '22023';
  end if;

  v_lead_id := causal.ingest_lead(
    p_workspace_id => v_workspace_id,
    p_phone => v_phone,
    p_full_name => btrim(p_full_name),
    p_email => nullif(lower(btrim(coalesce(p_email, ''))), ''),
    p_status => 'new',
    p_notes => nullif(btrim(coalesce(p_notes, '')), ''),
    p_source => coalesce(nullif(btrim(p_source), ''), 'manual_crm'),
    p_priority => 'medium',
    p_archived => false,
    p_event_type => 'internal_manual_lead',
    p_request_payload => jsonb_build_object(
      'created_by', v_user_id,
      'source', coalesce(nullif(btrim(p_source), ''), 'manual_crm')
    )
  );

  return v_lead_id;
end;
$function$;

revoke all on function public.create_workspace_lead(text, text, text, text, text)
from public, anon;

grant execute on function public.create_workspace_lead(text, text, text, text, text)
to authenticated;
