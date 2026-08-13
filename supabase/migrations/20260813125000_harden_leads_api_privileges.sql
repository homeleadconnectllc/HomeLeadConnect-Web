-- Defense-in-depth hardening for the canonical lead boundary.
-- Browser clients may read workspace-scoped leads through RLS, but lead mutation
-- remains server-authoritative. Revoke table-level mutation capability so an
-- accidental future RLS policy cannot silently re-open browser writes.

revoke insert, update, delete, truncate, references, trigger
on table public.leads
from anon, authenticated;

revoke select
on table public.leads
from anon;

grant select
on table public.leads
to authenticated;
