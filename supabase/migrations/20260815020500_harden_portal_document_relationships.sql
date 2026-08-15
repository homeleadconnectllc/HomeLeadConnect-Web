drop policy if exists documents_workspace_select on public.documents;
create policy documents_workspace_select
on public.documents
for select
to authenticated
using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = documents.workspace_id
      and wm.user_id = (select auth.uid())
  )
  or (
    documents.sharing_scope = 'homeowner'
    and exists (
      select 1
      from public.homeowner_portal_links h
      where h.user_id = (select auth.uid())
        and h.workspace_id = documents.workspace_id
        and h.revoked_at is null
        and (
          (documents.entity_type in ('lead','homeowner') and h.lead_id::text = documents.entity_id)
          or (documents.entity_type = 'estimate' and exists (
            select 1 from public.estimates e
            where e.id::text = documents.entity_id
              and e.lead_id = h.lead_id
              and e.workspace_id = documents.workspace_id
          ))
          or (documents.entity_type = 'job' and exists (
            select 1 from public.crm_jobs j
            where j.id::text = documents.entity_id
              and j.lead_id = h.lead_id
              and j.workspace_id = documents.workspace_id
          ))
          or (documents.entity_type = 'appointment' and exists (
            select 1 from public.appointments a
            where a.id::text = documents.entity_id
              and a.lead_id = h.lead_id
              and a.workspace_id = documents.workspace_id
          ))
        )
    )
  )
  or (
    documents.sharing_scope = 'contractor'
    and exists (
      select 1
      from public.contractor_portal_links c
      where c.user_id = (select auth.uid())
        and c.workspace_id = documents.workspace_id
        and c.revoked_at is null
        and (
          (documents.entity_type = 'contractor' and c.contractor_id::text = documents.entity_id)
          or (documents.entity_type = 'job' and exists (
            select 1 from public.job_assignments ja
            join public.crm_jobs j on j.id = ja.job_id
            where ja.job_id::text = documents.entity_id
              and ja.contractor_id = c.contractor_id
              and ja.workspace_id = documents.workspace_id
              and ja.status = 'accepted'
              and j.workspace_id = documents.workspace_id
          ))
          or (documents.entity_type = 'appointment' and exists (
            select 1
            from public.appointments a
            join public.job_assignments ja
              on ja.job_id = a.job_id
             and ja.contractor_id = c.contractor_id
             and ja.status = 'accepted'
             and ja.workspace_id = documents.workspace_id
            where a.id::text = documents.entity_id
              and a.workspace_id = documents.workspace_id
          ))
        )
    )
  )
);
