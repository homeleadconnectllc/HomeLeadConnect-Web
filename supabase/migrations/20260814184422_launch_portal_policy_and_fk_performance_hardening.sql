drop policy if exists contractor_links_self_select on public.contractor_portal_links;
drop policy if exists contractor_links_workspace_select on public.contractor_portal_links;
create policy contractor_links_select_authenticated
on public.contractor_portal_links
for select
to authenticated
using (
  ((user_id = (select auth.uid())) and revoked_at is null)
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = contractor_portal_links.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists homeowner_links_self_select on public.homeowner_portal_links;
drop policy if exists homeowner_links_workspace_select on public.homeowner_portal_links;
create policy homeowner_links_select_authenticated
on public.homeowner_portal_links
for select
to authenticated
using (
  ((user_id = (select auth.uid())) and revoked_at is null)
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = homeowner_portal_links.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

drop policy if exists portal_events_actor_select on public.portal_access_events;
drop policy if exists portal_events_workspace_select on public.portal_access_events;
create policy portal_events_select_authenticated
on public.portal_access_events
for select
to authenticated
using (
  actor_user_id = (select auth.uid())
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = portal_access_events.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

create index if not exists professional_applications_reviewed_by_idx
  on public.professional_applications(reviewed_by)
  where reviewed_by is not null;

create index if not exists provider_availability_workspace_id_idx
  on public.provider_availability(workspace_id);

create index if not exists provider_service_areas_workspace_id_idx
  on public.provider_service_areas(workspace_id);

create index if not exists public_forms_workspace_id_idx
  on public.public_forms(workspace_id);
