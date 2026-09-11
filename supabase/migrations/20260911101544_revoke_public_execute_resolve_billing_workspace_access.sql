-- HomeLead Connect security hardening: least-privilege billing RPC access.
-- Public/anonymous callers do not need this function. The function itself already
-- requires auth.uid(), so authenticated behavior is intentionally unchanged.

revoke execute on function public.resolve_billing_workspace_access() from anon;

grant execute on function public.resolve_billing_workspace_access() to authenticated;
