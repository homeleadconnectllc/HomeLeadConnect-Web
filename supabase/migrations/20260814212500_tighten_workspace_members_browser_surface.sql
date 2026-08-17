revoke select on table public.workspace_members from anon;

drop policy if exists workspace_members_insert_management on public.workspace_members;
drop policy if exists workspace_members_delete_management on public.workspace_members;
