create table public.documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  entity_type text not null check(entity_type in ('lead','estimate','job','appointment','homeowner','contractor','conversation')),
  entity_id text not null,
  filename text not null check(char_length(filename) between 1 and 255),
  storage_path text not null unique,
  mime_type text not null,
  byte_size bigint not null check(byte_size between 1 and 26214400),
  sharing_scope text not null default 'workspace' check(sharing_scope in ('workspace','homeowner','contractor')),
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
create index documents_entity_idx on public.documents(workspace_id,entity_type,entity_id,created_at desc);
create table public.document_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade, actor_user_id uuid not null references auth.users(id),
  action text not null check(action in ('uploaded','shared','viewed','deleted')), details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.documents enable row level security;
alter table public.document_events enable row level security;
create policy documents_workspace_select on public.documents for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=documents.workspace_id and wm.user_id=(select auth.uid()))
  or (sharing_scope='homeowner' and exists(select 1 from public.homeowner_portal_links h where h.user_id=(select auth.uid()) and h.workspace_id=documents.workspace_id and h.revoked_at is null and (
    (entity_type in ('lead','homeowner') and h.lead_id::text=entity_id)
    or (entity_type='estimate' and exists(select 1 from public.estimates e where e.id::text=entity_id and e.lead_id=h.lead_id))
    or (entity_type='job' and exists(select 1 from public.crm_jobs j where j.id::text=entity_id and j.lead_id=h.lead_id))
    or (entity_type='appointment' and exists(select 1 from public.appointments a where a.id::text=entity_id and a.lead_id=h.lead_id)))))
  or (sharing_scope='contractor' and exists(select 1 from public.contractor_portal_links c where c.user_id=(select auth.uid()) and c.workspace_id=documents.workspace_id and c.revoked_at is null and (
    (entity_type='contractor' and c.contractor_id::text=entity_id)
    or (entity_type='job' and exists(select 1 from public.job_assignments a where a.job_id::text=entity_id and a.contractor_id=c.contractor_id and a.status='accepted'))
    or (entity_type='appointment' and exists(select 1 from public.appointments a join public.job_assignments ja on ja.job_id=a.job_id and ja.contractor_id=c.contractor_id and ja.status='accepted' where a.id::text=entity_id)))))
);
grant select on public.documents to authenticated;
create policy document_events_workspace_select on public.document_events for select to authenticated using(exists(select 1 from public.workspace_members wm where wm.workspace_id=document_events.workspace_id and wm.user_id=(select auth.uid())));
grant select on public.document_events to authenticated;
grant all on public.documents to service_role;
grant all on public.document_events to service_role;

create or replace function public.register_document(p_entity_type text,p_entity_id text,p_filename text,p_storage_path text,p_mime_type text,p_byte_size bigint,p_sharing_scope text default 'workspace')
returns uuid language plpgsql security definer set search_path='' as $$
declare v_workspace uuid; v_id uuid;
begin
  select p.workspace_id into v_workspace from public.profiles p where p.user_id=auth.uid();
  if v_workspace is null or not exists(select 1 from public.workspace_members wm where wm.workspace_id=v_workspace and wm.user_id=auth.uid()) then raise exception 'Workspace membership is required.' using errcode='42501'; end if;
  if p_storage_path not like v_workspace::text||'/%' then raise exception 'Document path is outside the authorized workspace.' using errcode='42501'; end if;
  if lower(p_entity_type) in ('lead','homeowner') and not exists(select 1 from public.leads l where l.workspace_id=v_workspace and l.id::text=p_entity_id) then raise exception 'Lead is not in the workspace.' using errcode='42501';
  elsif lower(p_entity_type)='estimate' and not exists(select 1 from public.estimates e where e.workspace_id=v_workspace and e.id::text=p_entity_id) then raise exception 'Estimate is not in the workspace.' using errcode='42501';
  elsif lower(p_entity_type)='job' and not exists(select 1 from public.crm_jobs j where j.workspace_id=v_workspace and j.id::text=p_entity_id) then raise exception 'Job is not in the workspace.' using errcode='42501';
  elsif lower(p_entity_type)='appointment' and not exists(select 1 from public.appointments a where a.workspace_id=v_workspace and a.id::text=p_entity_id) then raise exception 'Appointment is not in the workspace.' using errcode='42501';
  elsif lower(p_entity_type)='contractor' and not exists(select 1 from public.contractors c where c.workspace_id=v_workspace and c.id::text=p_entity_id) then raise exception 'Contractor is not in the workspace.' using errcode='42501';
  elsif lower(p_entity_type)='conversation' and not exists(select 1 from public.conversations c where c.workspace_id=v_workspace and c.id::text=p_entity_id) then raise exception 'Conversation is not in the workspace.' using errcode='42501'; end if;
  insert into public.documents(workspace_id,entity_type,entity_id,filename,storage_path,mime_type,byte_size,sharing_scope,uploaded_by)
  values(v_workspace,lower(p_entity_type),p_entity_id,btrim(p_filename),p_storage_path,lower(p_mime_type),p_byte_size,lower(p_sharing_scope),auth.uid()) returning id into v_id;
  insert into public.document_events(workspace_id,document_id,actor_user_id,action,details)
  values(v_workspace,v_id,auth.uid(),'uploaded',jsonb_build_object('related_entity_type',lower(p_entity_type),'related_entity_id',p_entity_id,'sharing_scope',lower(p_sharing_scope)));
  return v_id;
end $$;
revoke all on function public.register_document(text,text,text,text,text,bigint,text) from public,anon;
grant execute on function public.register_document(text,text,text,text,text,bigint,text) to authenticated,service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('hlc-documents','hlc-documents',false,26214400,array['application/pdf','image/jpeg','image/png','image/webp','text/plain','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id) do nothing;
create policy document_objects_insert on storage.objects for insert to authenticated with check (
  bucket_id='hlc-documents' and exists(select 1 from public.workspace_members wm where wm.workspace_id=(storage.foldername(name))[1]::uuid and wm.user_id=(select auth.uid()))
);
create policy document_objects_select on storage.objects for select to authenticated using (
  bucket_id='hlc-documents' and exists(select 1 from public.documents d where d.storage_path=name)
);
create policy document_objects_delete_failed_upload on storage.objects for delete to authenticated using (
  bucket_id='hlc-documents' and exists(select 1 from public.workspace_members wm where wm.workspace_id=(storage.foldername(name))[1]::uuid and wm.user_id=(select auth.uid())) and owner_id=(select auth.uid()::text)
);

create table public.calendar_event_mappings (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  appointment_id bigint not null references public.appointments(id) on delete cascade,
  provider text not null default 'google_calendar' check(provider='google_calendar'), calendar_id text not null,
  provider_event_id text, sync_state text not null default 'pending' check(sync_state in ('pending','synced','failed','deleted')),
  last_synced_at timestamptz, failure_message text, idempotency_key uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider,appointment_id), unique(provider,idempotency_key)
);
alter table public.calendar_event_mappings enable row level security;
create policy calendar_mappings_workspace_select on public.calendar_event_mappings for select to authenticated using(exists(select 1 from public.workspace_members wm where wm.workspace_id=calendar_event_mappings.workspace_id and wm.user_id=(select auth.uid())));
grant select on public.calendar_event_mappings to authenticated; grant all on public.calendar_event_mappings to service_role;

create table public.crm_import_batches (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  source_filename text not null, status text not null default 'preview' check(status in ('preview','validated','imported','failed')),
  row_count integer not null default 0, valid_count integer not null default 0, duplicate_count integer not null default 0,
  error_count integer not null default 0, field_mapping jsonb not null default '{}'::jsonb, created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(), imported_at timestamptz
);
alter table public.crm_import_batches enable row level security;
create policy crm_import_batches_workspace_select on public.crm_import_batches for select to authenticated using(exists(select 1 from public.workspace_members wm where wm.workspace_id=crm_import_batches.workspace_id and wm.user_id=(select auth.uid())));
grant select on public.crm_import_batches to authenticated; grant all on public.crm_import_batches to service_role;
