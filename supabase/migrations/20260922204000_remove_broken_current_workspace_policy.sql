-- HCX consolidation rehearsal: remove a legacy RLS policy that calls a
-- service-role-only helper from authenticated queries.
--
-- Authenticated workspace visibility remains enforced by the canonical
-- membership-backed workspace_select policy using get_user_workspace_ids().

drop policy if exists workspaces_select_own on public.workspaces;
