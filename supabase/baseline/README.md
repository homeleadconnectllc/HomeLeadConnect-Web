# Production schema baseline

This directory holds schema-only release-candidate baselines recovered from the
linked HomeLead Connect production database. These files are not original
historical migrations and must not be moved into `supabase/migrations` or marked
as individual historical versions.

The baseline contains schema objects only. Production user, customer, business,
authentication, and operational row data are intentionally excluded.

Current recovered artifact:

- `homeconnect_production_schema_20260811.sql`
- SHA-256: `5e30bdf94150f4224aab4ef0d423b4d70681b7791b2a3a4d6e15cbd4a6514fce`

Release-candidate procedure:

1. Restore the schema baseline into an isolated local Supabase database.
2. Represent the recovered production migration versions as pre-existing
   baseline history.
3. Map only verified equivalent production versions as already present, then
   apply every genuinely absent launch migration from `supabase/migrations` in
   exact order.
4. Run transactional, RLS, cross-tenant, advisor, and rollback verification.

Never restore or reset this baseline against the linked production project.
