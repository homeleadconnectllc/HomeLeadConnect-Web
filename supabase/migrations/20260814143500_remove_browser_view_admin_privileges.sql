-- Complete browser ACL normalization for public views.
-- SELECT remains unchanged; administration-like ACLs are not application capabilities.
DO $block$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname, c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('v','m')
  LOOP
    BEGIN
      EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE %I.%I FROM anon, authenticated', r.nspname, r.relname);
    EXCEPTION WHEN wrong_object_type OR invalid_grant_operation THEN
      -- Some relation kinds do not support every table privilege. Remove individually when supported.
      BEGIN EXECUTE format('REVOKE REFERENCES ON TABLE %I.%I FROM anon, authenticated', r.nspname, r.relname); EXCEPTION WHEN OTHERS THEN NULL; END;
      BEGIN EXECUTE format('REVOKE TRIGGER ON TABLE %I.%I FROM anon, authenticated', r.nspname, r.relname); EXCEPTION WHEN OTHERS THEN NULL; END;
      BEGIN EXECUTE format('REVOKE TRUNCATE ON TABLE %I.%I FROM anon, authenticated', r.nspname, r.relname); EXCEPTION WHEN OTHERS THEN NULL; END;
    END;
  END LOOP;
END;
$block$;
