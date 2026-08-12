alter table public.leads
  drop constraint if exists leads_workspace_id_fkey;

alter table public.leads
  add constraint leads_workspace_id_fkey
  foreign key (workspace_id)
  references public.workspaces(id)
  on delete cascade;
