-- These legacy automation entry points accept caller-supplied identity or tenant
-- values without fully validating them against auth.uid(). They are not used by
-- the canonical V1 client and remain available only to trusted server workers.
revoke all on function public.create_lead_if_under_limit(uuid, uuid, text, text, uuid)
from public, anon, authenticated;

grant execute on function public.create_lead_if_under_limit(uuid, uuid, text, text, uuid)
to service_role;

revoke all on function public.claim_next_lead_balanced(uuid, uuid)
from public, anon, authenticated;

grant execute on function public.claim_next_lead_balanced(uuid, uuid)
to service_role;
