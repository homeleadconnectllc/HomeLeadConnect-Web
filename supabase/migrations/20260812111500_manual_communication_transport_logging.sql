-- Generalize manual communication history so device-native and Google Voice
-- handoffs share the same compliance-bound audit trail.

create or replace function public.log_manual_communication_activity(
  p_subject_type text,p_subject_id text,p_channel text,p_direction text,p_purpose text,
  p_provider_name text,p_outcome text,p_notes text,p_client_request_id uuid,p_compliance_check_id uuid default null,
  p_conversation_id uuid default null
)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_workspace_id uuid; v_destination text; v_id uuid; v_lead_id bigint; v_provider_name text;
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;
  select p.workspace_id into v_workspace_id from public.profiles p where p.user_id=auth.uid();
  if not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace_id and wm.user_id=auth.uid()) then raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  v_provider_name:=lower(btrim(coalesce(p_provider_name,'')));
  if v_provider_name not in ('google_voice','device_native') then raise exception 'Unsupported manual communication transport.' using errcode='22023'; end if;
  if lower(p_channel) not in ('sms','call') or lower(p_direction) not in ('inbound','outbound') then raise exception 'Manual logging supports interactive calls and texts.' using errcode='22023'; end if;
  if char_length(btrim(coalesce(p_outcome,''))) not between 2 and 80 or char_length(coalesce(p_notes,''))>2000 then raise exception 'Enter a short outcome; notes may contain up to 2,000 characters.' using errcode='22023'; end if;
  if lower(p_subject_type)='lead' then
    select l.id,regexp_replace(l.phone,'[() .-]','','g') into v_lead_id,v_destination from public.leads l where l.id=p_subject_id::bigint and l.workspace_id=v_workspace_id;
    if not found then raise exception 'Lead is not in the current workspace.' using errcode='42501'; end if;
  elsif lower(p_subject_type)='contractor' then
    select regexp_replace(c.phone,'[() .-]','','g') into v_destination from public.contractors c where c.id=p_subject_id::bigint and c.workspace_id=v_workspace_id;
    if not found then raise exception 'Contractor is not in the current workspace.' using errcode='42501'; end if;
  else raise exception 'Invalid subject type.' using errcode='22023'; end if;
  if v_destination is null or v_destination='' then raise exception 'The selected contact has no phone number.' using errcode='22023'; end if;
  if p_conversation_id is not null and not exists(select 1 from public.conversations c where c.id=p_conversation_id and c.workspace_id=v_workspace_id) then raise exception 'Conversation is not in the current workspace.' using errcode='42501'; end if;
  if lower(p_direction)='outbound' and not exists(
    select 1 from public.communication_compliance_checks cc where cc.id=p_compliance_check_id and cc.workspace_id=v_workspace_id and cc.actor_user_id=auth.uid()
      and cc.subject_type=lower(p_subject_type) and cc.subject_id=p_subject_id and cc.channel=lower(p_channel)
      and cc.provider_name=v_provider_name and cc.purpose=lower(p_purpose) and cc.direction='outbound'
      and cc.decision='ALLOW' and cc.created_at>now()-interval '30 minutes'
  ) then raise exception 'A current ALLOW compliance check is required before logging an outbound manual action.' using errcode='42501'; end if;
  insert into public.communication_transmissions(workspace_id,conversation_id,compliance_check_id,subject_type,subject_id,channel,direction,purpose,destination,provider_name,client_request_id,status,evidence_source,manual_outcome,operator_notes,attempt_count,created_by)
  values(v_workspace_id,p_conversation_id,p_compliance_check_id,lower(p_subject_type),p_subject_id,lower(p_channel),lower(p_direction),lower(p_purpose),v_destination,v_provider_name,p_client_request_id,'manually_logged','operator_reported',btrim(p_outcome),nullif(btrim(coalesce(p_notes,'')),''),1,auth.uid())
  on conflict(workspace_id,channel,client_request_id) do update set client_request_id=public.communication_transmissions.client_request_id returning id into v_id;
  if v_lead_id is not null and not exists(select 1 from public.lead_activities la where la.workspace_id=v_workspace_id and la.request_id=p_client_request_id) then
    insert into public.lead_activities(workspace_id,lead_id,user_id,activity_type,outcome,notes,request_id)
    values(v_workspace_id,v_lead_id,auth.uid(),case when lower(p_channel)='call' then 'manual_call' else 'manual_text' end,btrim(p_outcome),nullif(btrim(coalesce(p_notes,'')),''),p_client_request_id);
  end if;
  if v_lead_id is not null and lower(p_channel)='call' and not exists(select 1 from public.call_logs cl where cl.workspace_id=v_workspace_id and cl.request_id=p_client_request_id) then
    insert into public.call_logs(workspace_id,lead_id,outcome,request_id) values(v_workspace_id,v_lead_id,btrim(p_outcome),p_client_request_id);
  end if;
  return v_id;
end; $$;

create or replace function public.log_google_voice_activity(
  p_subject_type text,p_subject_id text,p_channel text,p_direction text,p_purpose text,
  p_outcome text,p_notes text,p_client_request_id uuid,p_compliance_check_id uuid default null,p_conversation_id uuid default null
)
returns uuid language sql security definer set search_path='' as $$
  select public.log_manual_communication_activity(p_subject_type,p_subject_id,p_channel,p_direction,p_purpose,'google_voice',p_outcome,p_notes,p_client_request_id,p_compliance_check_id,p_conversation_id);
$$;

revoke all on function public.log_manual_communication_activity(text,text,text,text,text,text,text,text,uuid,uuid,uuid) from public,anon;
revoke all on function public.log_google_voice_activity(text,text,text,text,text,text,text,uuid,uuid,uuid) from public,anon;
grant execute on function public.log_manual_communication_activity(text,text,text,text,text,text,text,text,uuid,uuid,uuid) to authenticated,service_role;
grant execute on function public.log_google_voice_activity(text,text,text,text,text,text,text,uuid,uuid,uuid) to authenticated,service_role;
