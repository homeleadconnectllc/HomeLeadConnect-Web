drop policy if exists pipelines_insert_workspace on public.pipelines;

alter policy pipelines_insert_plan_limit on public.pipelines
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pipelines.workspace_id
        and wm.user_id = (select auth.uid())
    )
    and public.can_create_pipeline(workspace_id)
  );

alter policy pipelines_select_workspace on public.pipelines
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pipelines.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );

alter policy pipelines_update_workspace on public.pipelines
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pipelines.workspace_id
        and wm.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pipelines.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );

alter policy pipelines_delete_workspace on public.pipelines
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = pipelines.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );

alter policy "call_logs: select by workspace member" on public.call_logs
  using (workspace_id in (select wm.workspace_id from public.workspace_members wm where wm.user_id = (select auth.uid())));
alter policy "call_logs: insert by workspace member" on public.call_logs
  with check (workspace_id in (select wm.workspace_id from public.workspace_members wm where wm.user_id = (select auth.uid())));
alter policy "call_logs: update by workspace member" on public.call_logs
  using (workspace_id in (select wm.workspace_id from public.workspace_members wm where wm.user_id = (select auth.uid())))
  with check (workspace_id in (select wm.workspace_id from public.workspace_members wm where wm.user_id = (select auth.uid())));
alter policy "call_logs: delete by workspace member" on public.call_logs
  using (workspace_id in (select wm.workspace_id from public.workspace_members wm where wm.user_id = (select auth.uid())));

alter policy "Org members: read for member" on public.org_members
  using (organization_id in (select om2.organization_id from public.org_members om2 where om2.user_id = (select auth.uid())));
alter policy "Org members: insert by admin" on public.org_members
  with check (exists (select 1 from public.org_members om where om.organization_id = org_members.organization_id and om.user_id = (select auth.uid()) and om.role = any(array['owner'::text,'admin'::text])));
alter policy "Org members: update by admin" on public.org_members
  using (exists (select 1 from public.org_members om where om.organization_id = org_members.organization_id and om.user_id = (select auth.uid()) and om.role = any(array['owner'::text,'admin'::text])))
  with check (exists (select 1 from public.org_members om where om.organization_id = org_members.organization_id and om.user_id = (select auth.uid()) and om.role = any(array['owner'::text,'admin'::text])));
alter policy "Org members: delete by admin" on public.org_members
  using (exists (select 1 from public.org_members om where om.organization_id = org_members.organization_id and om.user_id = (select auth.uid()) and om.role = any(array['owner'::text,'admin'::text])));

alter policy workspace_plan_status_select_own on public.workspace_plan_status
  using (workspace_id in (select p.workspace_id from public.profiles p where p.user_id = (select auth.uid())));
