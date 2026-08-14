-- Browser roles should receive application DML only. RLS does not protect TRUNCATE.
-- Remove inherited administration-like privileges across public base/partitioned tables.
DO $block$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT n.nspname, c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relkind IN ('r','p')
  LOOP
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE %I.%I FROM anon, authenticated', r.nspname, r.relname);
  END LOOP;
END;
$block$;

-- A signed-in user may edit presentation/onboarding fields on their own profile,
-- but authority fields are server-controlled. Column grants provide a second boundary
-- in addition to RLS and prevent self-promotion by direct PostgREST updates.
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
GRANT UPDATE(full_name, avatar_url, onboarding_completed, onboarding_step, updated_at)
ON TABLE public.profiles TO authenticated;

-- Team membership administration is management-only if DML is ever explicitly granted.
DROP POLICY IF EXISTS workspace_members_insert ON public.workspace_members;
DROP POLICY IF EXISTS workspace_members_delete ON public.workspace_members;

CREATE POLICY workspace_members_insert_management
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.workspace_members existing
    JOIN public.profiles p
      ON p.user_id=existing.user_id
     AND p.workspace_id=existing.workspace_id
    WHERE existing.workspace_id=workspace_members.workspace_id
      AND existing.user_id=(SELECT auth.uid())
      AND lower(coalesce(p.role,'')) IN ('owner','manager')
  )
);

CREATE POLICY workspace_members_delete_management
ON public.workspace_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_members existing
    JOIN public.profiles p
      ON p.user_id=existing.user_id
     AND p.workspace_id=existing.workspace_id
    WHERE existing.workspace_id=workspace_members.workspace_id
      AND existing.user_id=(SELECT auth.uid())
      AND lower(coalesce(p.role,'')) IN ('owner','manager')
  )
);

-- Business identity/settings mutation is management-only; operational staff retain read access.
DROP POLICY IF EXISTS "workspace members can create business profile" ON public.business_profile;
DROP POLICY IF EXISTS "workspace members can update business profile" ON public.business_profile;

CREATE POLICY business_profile_insert_management
ON public.business_profile
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.profiles p ON p.user_id=wm.user_id AND p.workspace_id=wm.workspace_id
    WHERE wm.workspace_id=business_profile.workspace_id
      AND wm.user_id=(SELECT auth.uid())
      AND lower(coalesce(p.role,'')) IN ('owner','manager')
  )
);

CREATE POLICY business_profile_update_management
ON public.business_profile
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.profiles p ON p.user_id=wm.user_id AND p.workspace_id=wm.workspace_id
    WHERE wm.workspace_id=business_profile.workspace_id
      AND wm.user_id=(SELECT auth.uid())
      AND lower(coalesce(p.role,'')) IN ('owner','manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.profiles p ON p.user_id=wm.user_id AND p.workspace_id=wm.workspace_id
    WHERE wm.workspace_id=business_profile.workspace_id
      AND wm.user_id=(SELECT auth.uid())
      AND lower(coalesce(p.role,'')) IN ('owner','manager')
  )
);

-- Invitation inventory contains access-management metadata and is management-only.
DROP POLICY IF EXISTS portal_invitations_workspace_select ON public.portal_invitations;
CREATE POLICY portal_invitations_management_select
ON public.portal_invitations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.profiles p ON p.user_id=wm.user_id AND p.workspace_id=wm.workspace_id
    WHERE wm.workspace_id=portal_invitations.workspace_id
      AND wm.user_id=(SELECT auth.uid())
      AND lower(coalesce(p.role,'')) IN ('owner','manager')
  )
);
