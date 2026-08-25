-- PENDING POST-LAUNCH DDL CANDIDATE. NOT IN THE CANONICAL PRODUCTION MIGRATION CHAIN.
-- Promote into supabase/migrations only after processor choice, test-environment application,
-- RLS/security review, migration-plan update, and explicit production release approval.
--
-- This foundation stores proposed OCR/extraction output only. It does not install an OCR provider,
-- auto-post financial data, or mutate source documents.

create table public.document_processing_jobs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  processing_kind text not null check (processing_kind in ('ocr','invoice','receipt','generic_extraction')),
  status text not null default 'queued' check (status in ('queued','processing','review_required','approved','rejected','failed','cancelled')),
  processor text,
  processor_job_id text,
  error_message text,
  requested_by uuid not null references auth.users(id),
  reviewed_by uuid references auth.users(id),
  requested_at timestamptz not null default now(),
  processing_started_at timestamptz,
  processing_finished_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id)
);

create index document_processing_jobs_workspace_status_idx
  on public.document_processing_jobs(workspace_id,status,created_at desc);
create index document_processing_jobs_document_idx
  on public.document_processing_jobs(document_id,created_at desc);

create table public.document_extraction_fields (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  processing_job_id uuid not null,
  document_id uuid not null references public.documents(id) on delete cascade,
  field_key text not null check (char_length(field_key) between 1 and 120),
  proposed_value jsonb not null,
  confidence numeric(5,4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  source_page integer check (source_page is null or source_page >= 1),
  source_hint text,
  review_state text not null default 'pending' check (review_state in ('pending','approved','corrected','rejected')),
  reviewed_value jsonb,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint document_extraction_fields_processing_job_fk
    foreign key (processing_job_id,workspace_id)
    references public.document_processing_jobs(id,workspace_id)
    on delete cascade
);

create index document_extraction_fields_job_idx
  on public.document_extraction_fields(processing_job_id,review_state,field_key);
create index document_extraction_fields_document_idx
  on public.document_extraction_fields(document_id,created_at desc);

alter table public.document_processing_jobs enable row level security;
alter table public.document_extraction_fields enable row level security;

create policy document_processing_jobs_workspace_select
on public.document_processing_jobs
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = document_processing_jobs.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create policy document_extraction_fields_workspace_select
on public.document_extraction_fields
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = document_extraction_fields.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

grant select on public.document_processing_jobs to authenticated;
grant select on public.document_extraction_fields to authenticated;
grant all on public.document_processing_jobs to service_role;
grant all on public.document_extraction_fields to service_role;

create or replace function public.request_document_processing(
  p_document_id uuid,
  p_processing_kind text
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_document public.documents%rowtype;
  v_job_id uuid;
  v_kind text := lower(btrim(coalesce(p_processing_kind,'')));
begin
  if auth.uid() is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  select * into v_document from public.documents d where d.id = p_document_id;
  if not found then raise exception 'Document not found.' using errcode='P0002'; end if;

  if not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = v_document.workspace_id and wm.user_id = auth.uid()
  ) then
    raise exception 'Workspace membership is required.' using errcode='42501';
  end if;

  if v_kind not in ('ocr','invoice','receipt','generic_extraction') then
    raise exception 'Unsupported document processing kind.' using errcode='22023';
  end if;

  insert into public.document_processing_jobs(workspace_id,document_id,processing_kind,status,requested_by)
  values(v_document.workspace_id,v_document.id,v_kind,'queued',auth.uid())
  returning id into v_job_id;

  insert into public.document_events(workspace_id,document_id,actor_user_id,action,details)
  values(v_document.workspace_id,v_document.id,auth.uid(),'processing_requested',
    jsonb_build_object('processing_job_id',v_job_id,'processing_kind',v_kind));

  return v_job_id;
end $$;

create or replace function public.review_document_extraction_field(
  p_field_id uuid,
  p_review_state text,
  p_reviewed_value jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_field public.document_extraction_fields%rowtype;
  v_state text := lower(btrim(coalesce(p_review_state,'')));
begin
  if auth.uid() is null then raise exception 'Authentication is required.' using errcode='42501'; end if;

  select * into v_field from public.document_extraction_fields f where f.id = p_field_id;
  if not found then raise exception 'Extraction field not found.' using errcode='P0002'; end if;

  if not exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = v_field.workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner','manager','technician')
  ) then
    raise exception 'Workspace review permission is required.' using errcode='42501';
  end if;

  if v_state not in ('approved','corrected','rejected') then
    raise exception 'Invalid extraction review state.' using errcode='22023';
  end if;
  if v_state = 'corrected' and p_reviewed_value is null then
    raise exception 'Corrected fields require a reviewed value.' using errcode='22023';
  end if;

  update public.document_extraction_fields
  set review_state=v_state,
      reviewed_value=case when v_state='corrected' then p_reviewed_value else reviewed_value end,
      reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now()
  where id=v_field.id;

  insert into public.document_events(workspace_id,document_id,actor_user_id,action,details)
  values(v_field.workspace_id,v_field.document_id,auth.uid(),'extraction_reviewed',
    jsonb_build_object('field_id',v_field.id,'review_state',v_state));

  return v_field.id;
end $$;

revoke all on function public.request_document_processing(uuid,text) from public,anon;
grant execute on function public.request_document_processing(uuid,text) to authenticated,service_role;
revoke all on function public.review_document_extraction_field(uuid,text,jsonb) from public,anon;
grant execute on function public.review_document_extraction_field(uuid,text,jsonb) to authenticated,service_role;

-- When promoted into the canonical chain, extend public.document_events action vocabulary to include:
-- processing_requested, processing_completed, processing_failed, extraction_reviewed.
