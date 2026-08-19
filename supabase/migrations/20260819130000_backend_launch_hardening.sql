-- Backend launch hardening: preserve authorization semantics while removing
-- avoidable per-row auth evaluation and adding indexes for launch-critical FKs.

create index if not exists appointments_contractor_id_idx
  on public.appointments (contractor_id);
create index if not exists appointments_job_id_idx
  on public.appointments (job_id);
create index if not exists appointments_lead_id_idx
  on public.appointments (lead_id);

create index if not exists crm_jobs_lead_id_idx
  on public.crm_jobs (lead_id);
create index if not exists crm_jobs_workspace_id_idx
  on public.crm_jobs (workspace_id);

create index if not exists estimates_lead_id_idx
  on public.estimates (lead_id);
create index if not exists estimates_workspace_id_idx
  on public.estimates (workspace_id);

create index if not exists workspace_members_user_id_idx
  on public.workspace_members (user_id);

create index if not exists messages_sender_user_id_idx
  on public.messages (sender_user_id);

create index if not exists communication_transmissions_compliance_check_id_idx
  on public.communication_transmissions (compliance_check_id);
create index if not exists communication_transmissions_message_id_idx
  on public.communication_transmissions (message_id);
create index if not exists communication_transmissions_created_by_idx
  on public.communication_transmissions (created_by);

drop policy if exists "Organizations: members can view" on public.organizations;
create policy "Organizations: members can view"
  on public.organizations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.org_members om
      where om.organization_id = organizations.id
        and om.user_id = (select auth.uid())
    )
  );

drop policy if exists "Organizations: members can insert" on public.organizations;
create policy "Organizations: members can insert"
  on public.organizations
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

drop policy if exists "Organizations: members can update" on public.organizations;
create policy "Organizations: members can update"
  on public.organizations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.org_members om
      where om.organization_id = organizations.id
        and om.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.org_members om
      where om.organization_id = organizations.id
        and om.user_id = (select auth.uid())
    )
  );

drop policy if exists "Organizations: members can delete" on public.organizations;
create policy "Organizations: members can delete"
  on public.organizations
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.org_members om
      where om.organization_id = organizations.id
        and om.user_id = (select auth.uid())
        and om.role = any (array['owner'::text, 'admin'::text])
    )
  );
