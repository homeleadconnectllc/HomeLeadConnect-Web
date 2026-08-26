alter table public.documents drop constraint if exists documents_entity_type_check;
alter table public.documents add constraint documents_entity_type_check check (
  entity_type = any (array[
    'workspace'::text,
    'lead'::text,
    'estimate'::text,
    'job'::text,
    'appointment'::text,
    'homeowner'::text,
    'contractor'::text,
    'conversation'::text
  ])
);

create or replace function public.register_document(
  p_entity_type text,
  p_entity_id text,
  p_filename text,
  p_storage_path text,
  p_mime_type text,
  p_byte_size bigint,
  p_sharing_scope text default 'workspace'::text
) returns uuid
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace uuid;
  v_id uuid;
  v_entity_type text := lower(btrim(coalesce(p_entity_type,'')));
  v_entity_id text := btrim(coalesce(p_entity_id,''));
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  select p.workspace_id into v_workspace
  from public.profiles p
  where p.user_id=auth.uid();

  if v_workspace is null or not exists(
    select 1 from public.workspace_members wm
    where wm.workspace_id=v_workspace and wm.user_id=auth.uid()
  ) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  if p_storage_path not like v_workspace::text||'/%' then
    raise exception 'Document path is outside the authorized workspace.' using errcode='42501';
  end if;

  if v_entity_type='workspace' then
    if v_entity_id <> v_workspace::text then
      raise exception 'Workspace document must use the active workspace id.' using errcode='42501';
    end if;
  elsif v_entity_type in ('lead','homeowner') and not exists(
    select 1 from public.leads l where l.workspace_id=v_workspace and l.id::text=v_entity_id
  ) then
    raise exception 'Lead is not in the workspace.' using errcode='42501';
  elsif v_entity_type='estimate' and not exists(
    select 1 from public.estimates e where e.workspace_id=v_workspace and e.id::text=v_entity_id
  ) then
    raise exception 'Estimate is not in the workspace.' using errcode='42501';
  elsif v_entity_type='job' and not exists(
    select 1 from public.crm_jobs j where j.workspace_id=v_workspace and j.id::text=v_entity_id
  ) then
    raise exception 'Job is not in the workspace.' using errcode='42501';
  elsif v_entity_type='appointment' and not exists(
    select 1 from public.appointments a where a.workspace_id=v_workspace and a.id::text=v_entity_id
  ) then
    raise exception 'Appointment is not in the workspace.' using errcode='42501';
  elsif v_entity_type='contractor' and not exists(
    select 1 from public.contractors c where c.workspace_id=v_workspace and c.id::text=v_entity_id
  ) then
    raise exception 'Contractor is not in the workspace.' using errcode='42501';
  elsif v_entity_type='conversation' and not exists(
    select 1 from public.conversations c where c.workspace_id=v_workspace and c.id::text=v_entity_id
  ) then
    raise exception 'Conversation is not in the workspace.' using errcode='42501';
  elsif v_entity_type not in ('workspace','lead','homeowner','estimate','job','appointment','contractor','conversation') then
    raise exception 'Unsupported document relation type.' using errcode='22023';
  end if;

  insert into public.documents(
    workspace_id,entity_type,entity_id,filename,storage_path,mime_type,
    byte_size,sharing_scope,uploaded_by
  ) values(
    v_workspace,v_entity_type,v_entity_id,btrim(p_filename),p_storage_path,
    lower(p_mime_type),p_byte_size,lower(p_sharing_scope),auth.uid()
  ) returning id into v_id;

  insert into public.document_events(
    workspace_id,document_id,actor_user_id,action,details
  ) values(
    v_workspace,v_id,auth.uid(),'uploaded',
    jsonb_build_object(
      'related_entity_type',v_entity_type,
      'related_entity_id',v_entity_id,
      'sharing_scope',lower(p_sharing_scope)
    )
  );

  return v_id;
end
$function$;
