-- Repair the authenticated internal lead wrapper after rollback-only production E2E
-- showed that existing-phone upserts can fail before ON CONFLICT resolution when
-- NOT NULL insert columns receive NULL values.
--
-- Keep priority and archived non-null on every attempted INSERT. The canonical
-- causal writer's conflict path does not overwrite those fields, so existing lead
-- values remain preserved while the proposed row satisfies table constraints.

create or replace function public.create_workspace_lead(
  p_full_name text,
  p_phone text,
  p_email text default null,
  p_notes text default null
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
  v_existing_lead_id bigint;
  v_lead_id bigint;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select p.workspace_id
    into v_workspace_id
  from public.profiles p
  where p.user_id = v_user_id;

  if v_workspace_id is null then
    raise exception 'Workspace membership is required.' using errcode = '42501';
  end if;

  select lower(coalesce(wm.role, ''))
    into v_role
  from public.workspace_members wm
  where wm.workspace_id = v_workspace_id
    and wm.user_id = v_user_id;

  if v_role not in ('owner', 'manager', 'technician') then
    raise exception 'Internal workspace access is required.' using errcode = '42501';
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

  select l.id
    into v_existing_lead_id
  from public.leads l
  where l.workspace_id = v_workspace_id
    and l.phone = v_phone
  limit 1;

  if v_existing_lead_id is null and not public.can_insert_lead(v_workspace_id) then
    raise exception 'LEAD_LIMIT_REACHED' using errcode = 'P0001';
  end if;

  v_lead_id := causal.ingest_lead(
    p_workspace_id => v_workspace_id,
    p_phone => v_phone,
    p_full_name => btrim(p_full_name),
    p_email => nullif(lower(btrim(coalesce(p_email, ''))), ''),
    p_status => case when v_existing_lead_id is null then 'new' else null end,
    p_notes => nullif(btrim(coalesce(p_notes, '')), ''),
    p_source => 'manual_crm',
    p_priority => 'medium',
    p_archived => false,
    p_event_type => 'internal_manual_lead',
    p_request_payload => jsonb_build_object(
      'created_by', v_user_id,
      'source', 'manual_crm',
      'existing_lead', v_existing_lead_id is not null
    )
  );

  return v_lead_id;
end;
$function$;

revoke all on function public.create_workspace_lead(text, text, text, text)
from public, anon;

grant execute on function public.create_workspace_lead(text, text, text, text)
to authenticated;
