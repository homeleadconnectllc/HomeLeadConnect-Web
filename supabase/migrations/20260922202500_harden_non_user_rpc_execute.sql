-- HCX non-production security hardening rehearsal.
-- Remove inherited PUBLIC execution from server/internal functions that are not
-- intended as anonymous Data API RPCs. Keep authenticated billing access and
-- preserve the DDL event trigger itself.

revoke execute on function public.resolve_billing_workspace_access() from public, anon;
grant execute on function public.resolve_billing_workspace_access() to authenticated;
grant execute on function public.resolve_billing_workspace_access() to service_role;
