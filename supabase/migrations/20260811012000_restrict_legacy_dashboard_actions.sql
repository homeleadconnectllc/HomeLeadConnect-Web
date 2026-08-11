-- Legacy dashboard actions are invoked by trusted worker functions with the
-- service role. The function accepts arbitrary actor and lead identifiers and
-- does not enforce workspace membership, so it must not be client-executable.
revoke all on function public.perform_dashboard_action(bigint, text, uuid, uuid)
from public, anon, authenticated;

grant execute on function public.perform_dashboard_action(bigint, text, uuid, uuid)
to service_role;
