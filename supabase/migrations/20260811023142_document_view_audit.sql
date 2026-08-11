create or replace function public.record_document_view(p_document_id uuid)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  v_document public.documents%rowtype;
begin
  select * into v_document from public.documents d where d.id=p_document_id;
  if not found then raise exception 'Document not found.' using errcode='P0002'; end if;
  if not (
    exists(select 1 from public.workspace_members wm where wm.workspace_id=v_document.workspace_id and wm.user_id=auth.uid())
    or (v_document.sharing_scope='homeowner' and exists(
      select 1 from public.homeowner_portal_links h where h.user_id=auth.uid() and h.workspace_id=v_document.workspace_id and h.revoked_at is null and (
        (v_document.entity_type in ('lead','homeowner') and h.lead_id::text=v_document.entity_id)
        or (v_document.entity_type='estimate' and exists(select 1 from public.estimates e where e.id::text=v_document.entity_id and e.lead_id=h.lead_id))
        or (v_document.entity_type='job' and exists(select 1 from public.crm_jobs j where j.id::text=v_document.entity_id and j.lead_id=h.lead_id))
        or (v_document.entity_type='appointment' and exists(select 1 from public.appointments a where a.id::text=v_document.entity_id and a.lead_id=h.lead_id))
      )
    ))
    or (v_document.sharing_scope='contractor' and exists(
      select 1 from public.contractor_portal_links c where c.user_id=auth.uid() and c.workspace_id=v_document.workspace_id and c.revoked_at is null and (
        (v_document.entity_type='contractor' and c.contractor_id::text=v_document.entity_id)
        or (v_document.entity_type='job' and exists(select 1 from public.job_assignments a where a.job_id::text=v_document.entity_id and a.contractor_id=c.contractor_id and a.status='accepted'))
        or (v_document.entity_type='appointment' and exists(select 1 from public.appointments a join public.job_assignments ja on ja.job_id=a.job_id and ja.contractor_id=c.contractor_id and ja.status='accepted' where a.id::text=v_document.entity_id))
      )
    ))
  ) then raise exception 'Document access denied.' using errcode='42501'; end if;

  insert into public.document_events(workspace_id,document_id,actor_user_id,action,details)
  values(v_document.workspace_id,v_document.id,auth.uid(),'viewed',jsonb_build_object('sharing_scope',v_document.sharing_scope));
  return v_document.id;
end $$;

revoke all on function public.record_document_view(uuid) from public,anon;
grant execute on function public.record_document_view(uuid) to authenticated,service_role;
