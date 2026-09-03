begin;

-- Client roles must never receive table-administration privileges that bypass
-- row-level security or are unnecessary for normal application access.
revoke truncate, trigger, references on table public.community_connections from authenticated;
revoke truncate, trigger, references on table public.community_private_messages from authenticated;
revoke truncate, trigger, references on table public.hlc_calendar_events from authenticated;
revoke truncate, trigger, references on table public.portal_identity_profiles from authenticated;

-- Regression guard: fail the migration if any forbidden authenticated grant
-- remains on the protected client-facing tables.
do $$
declare
  v_count integer;
begin
  select count(*)
    into v_count
  from information_schema.role_table_grants g
  where g.grantee = 'authenticated'
    and g.table_schema = 'public'
    and g.table_name in (
      'community_connections',
      'community_private_messages',
      'hlc_calendar_events',
      'portal_identity_profiles'
    )
    and g.privilege_type in ('TRUNCATE', 'TRIGGER', 'REFERENCES');

  if v_count <> 0 then
    raise exception 'Forbidden authenticated table-administration grants remain: %', v_count;
  end if;
end
$$;

commit;
