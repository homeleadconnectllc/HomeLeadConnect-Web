-- Harden provider-network records so every referenced contractor belongs to the same workspace.
-- Existing upsert conflict targets remain intact; this adds a tenant-consistency invariant.

alter table public.contractors
  add constraint contractors_workspace_id_id_key unique (workspace_id, id);

alter table public.provider_availability
  add constraint provider_availability_workspace_contractor_fkey
    foreign key (workspace_id, contractor_id)
    references public.contractors (workspace_id, id)
    on delete cascade;

alter table public.provider_service_areas
  add constraint provider_service_areas_workspace_contractor_fkey
    foreign key (workspace_id, contractor_id)
    references public.contractors (workspace_id, id)
    on delete cascade;

alter table public.provider_services
  add constraint provider_services_workspace_contractor_fkey
    foreign key (workspace_id, contractor_id)
    references public.contractors (workspace_id, id)
    on delete cascade;

alter table public.saved_providers
  add constraint saved_providers_workspace_contractor_fkey
    foreign key (workspace_id, contractor_id)
    references public.contractors (workspace_id, id)
    on delete cascade;
