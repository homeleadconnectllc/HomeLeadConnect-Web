-- Reconcile the selected-workspace helper execution surface to the proven production authority.
-- Browser users need current_workspace_id() for signed-in workspace context, while anonymous
-- callers must remain denied. current_workspace_role() stays service-only under the separate
-- role-helper hardening migration.

revoke all on function public.current_workspace_id() from public, anon, authenticated, service_role;
grant execute on function public.current_workspace_id() to authenticated, service_role;
