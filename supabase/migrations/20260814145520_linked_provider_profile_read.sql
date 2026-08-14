create or replace function public.get_linked_provider_profile(p_contractor_id bigint)
returns table(
  id bigint,
  company_name text,
  contact_name text,
  phone text,
  email text,
  website text,
  address text,
  city text,
  state text,
  zip text,
  specialty text,
  provider_type text
)
language sql
security definer
set search_path = public, pg_temp
as $$
  select c.id,c.company_name,c.contact_name,c.phone,c.email,c.website,c.address,c.city,c.state,c.zip,c.specialty,c.provider_type
  from public.contractors c
  where c.id = p_contractor_id
    and exists (
      select 1 from public.contractor_portal_links cpl
      where cpl.user_id = (select auth.uid())
        and cpl.contractor_id = c.id
        and cpl.revoked_at is null
    );
$$;

revoke all on function public.get_linked_provider_profile(bigint) from public, anon;
grant execute on function public.get_linked_provider_profile(bigint) to authenticated, service_role;
