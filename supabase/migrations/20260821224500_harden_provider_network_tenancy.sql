-- Harden provider-network records so every referenced contractor belongs to the same workspace.
-- Also scope upsert uniqueness to the workspace boundary.

alter table public.contractors
  add constraint contractors_workspace_id_id_key unique (workspace_id, id);

alter table public.provider_availability
  drop constraint if exists provider_availability_contractor_id_key,
  add constraint provider_availability_workspace_contractor_key unique (workspace_id, contractor_id),
  add constraint provider_availability_workspace_contractor_fkey
    foreign key (workspace_id, contractor_id)
    references public.contractors (workspace_id, id)
    on delete cascade;

alter table public.provider_service_areas
  drop constraint if exists provider_service_areas_contractor_id_city_state_zip_key,
  add constraint provider_service_areas_workspace_contractor_location_key
    unique (workspace_id, contractor_id, city, state, zip),
  add constraint provider_service_areas_workspace_contractor_fkey
    foreign key (workspace_id, contractor_id)
    references public.contractors (workspace_id, id)
    on delete cascade;

alter table public.provider_services
  drop constraint if exists provider_services_contractor_id_service_name_key,
  add constraint provider_services_workspace_contractor_service_key
    unique (workspace_id, contractor_id, service_name),
  add constraint provider_services_workspace_contractor_fkey
    foreign key (workspace_id, contractor_id)
    references public.contractors (workspace_id, id)
    on delete cascade;

alter table public.saved_providers
  drop constraint if exists saved_providers_user_id_contractor_id_key,
  add constraint saved_providers_workspace_user_contractor_key
    unique (workspace_id, user_id, contractor_id),
  add constraint saved_providers_workspace_contractor_fkey
    foreign key (workspace_id, contractor_id)
    references public.contractors (workspace_id, id)
    on delete cascade;
