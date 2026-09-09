-- Narrow Resident journey repair.
-- activity_log.entity_id is uuid; use the canonical leads.id_uuid for provider-match events.

create or replace function public.create_resident_provider_match(
  p_lead_id bigint,
  p_contractor_id bigint,
  p_rationale text default null::text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_role text;
  v_id uuid;
  v_lead_uuid uuid;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  v_workspace := public.current_workspace_id();
  v_role := public.current_workspace_role();
  if v_workspace is null or v_role not in ('owner','manager','admin') then
    raise exception 'Management access is required.' using errcode='42501';
  end if;

  select l.id_uuid into v_lead_uuid
  from public.leads l
  where l.id=p_lead_id and l.workspace_id=v_workspace;
  if v_lead_uuid is null then
    raise exception 'Lead is not in the current workspace.' using errcode='42501';
  end if;

  if not exists(select 1 from public.contractors c where c.id=p_contractor_id and c.workspace_id=v_workspace) then
    raise exception 'Provider is not in the current workspace.' using errcode='42501';
  end if;

  insert into public.resident_provider_matches(workspace_id,lead_id,contractor_id,rationale,created_by)
  values(v_workspace,p_lead_id,p_contractor_id,nullif(btrim(coalesce(p_rationale,'')),''),auth.uid())
  on conflict(workspace_id,lead_id,contractor_id) do update
    set status='proposed', rationale=excluded.rationale, updated_at=now(), resident_decided_by=null, resident_decided_at=null
  returning id into v_id;

  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_workspace,'lead',v_lead_uuid,'resident.match.proposed',jsonb_build_object('match_id',v_id,'contractor_id',p_contractor_id));
  return v_id;
end;
$function$;

create or replace function public.homeowner_decide_provider_match(
  p_match_id uuid,
  p_decision text
)
returns text
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_match public.resident_provider_matches%rowtype;
  v_lead_uuid uuid;
begin
  if lower(p_decision) not in ('accepted','declined') then raise exception 'Invalid match decision.' using errcode='22023'; end if;
  select m.* into v_match from public.resident_provider_matches m where m.id=p_match_id for update;
  if not found then raise exception 'Provider match not found.' using errcode='P0002'; end if;
  if not exists(select 1 from public.homeowner_portal_links h where h.user_id=auth.uid() and h.workspace_id=v_match.workspace_id and h.lead_id=v_match.lead_id and h.revoked_at is null) then
    raise exception 'Provider match is not authorized for this resident account.' using errcode='42501';
  end if;
  if v_match.status <> 'proposed' then raise exception 'Only a proposed provider match can be accepted or declined.' using errcode='22023'; end if;

  select l.id_uuid into v_lead_uuid
  from public.leads l
  where l.id=v_match.lead_id and l.workspace_id=v_match.workspace_id;
  if v_lead_uuid is null then raise exception 'Lead is not available.' using errcode='P0002'; end if;

  update public.resident_provider_matches
  set status=lower(p_decision), resident_decided_by=auth.uid(), resident_decided_at=now(), updated_at=now()
  where id=p_match_id;

  insert into public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  values(v_match.workspace_id,'lead',v_lead_uuid,'resident.match.'||lower(p_decision),jsonb_build_object('match_id',p_match_id,'contractor_id',v_match.contractor_id));
  return lower(p_decision);
end;
$function$;
