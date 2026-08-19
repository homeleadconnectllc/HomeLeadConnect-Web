-- Launch certification found that the legacy SECURITY DEFINER helper
-- public.create_lead_if_under_limit(...) still allowed authenticated internal
-- users to create records in public.leads_new, bypassing the canonical
-- public.leads -> causal ingestion path.
--
-- The browser has no legitimate consumer for this RPC. Preserve service_role
-- compatibility for any internal migration/maintenance dependency, but remove
-- the authenticated parallel-write surface.

revoke execute on function public.create_lead_if_under_limit(
  uuid, uuid, text, text, uuid
) from authenticated;

grant execute on function public.create_lead_if_under_limit(
  uuid, uuid, text, text, uuid
) to service_role;
