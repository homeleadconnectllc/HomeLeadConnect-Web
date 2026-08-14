-- Align direct RPC authorization with the browser role policy.
-- Existing implementations are retained as private/internal functions behind guarded wrappers.

ALTER FUNCTION public.get_hlc_analytics_summary(integer) RENAME TO get_hlc_analytics_summary_internal;
ALTER FUNCTION public.get_hlc_business_kpis(integer) RENAME TO get_hlc_business_kpis_internal;
ALTER FUNCTION public.configure_google_voice_manual_channel(text) RENAME TO configure_google_voice_manual_channel_internal;
ALTER FUNCTION public.revoke_portal_invitation(uuid) RENAME TO revoke_portal_invitation_internal;

REVOKE ALL ON FUNCTION public.get_hlc_analytics_summary_internal(integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_hlc_business_kpis_internal(integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.configure_google_voice_manual_channel_internal(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_portal_invitation_internal(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_hlc_analytics_summary(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_workspace_id uuid;
  v_role text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING errcode='42501';
  END IF;

  SELECT p.workspace_id, lower(coalesce(p.role,''))
    INTO v_workspace_id, v_role
  FROM public.profiles p
  WHERE p.user_id=(SELECT auth.uid());

  IF v_workspace_id IS NULL OR v_role NOT IN ('owner','manager') OR NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id=v_workspace_id AND wm.user_id=(SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Analytics access requires an owner or manager role.' USING errcode='42501';
  END IF;

  RETURN public.get_hlc_analytics_summary_internal(p_days);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_hlc_business_kpis(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_workspace_id uuid;
  v_role text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING errcode='42501';
  END IF;

  SELECT p.workspace_id, lower(coalesce(p.role,''))
    INTO v_workspace_id, v_role
  FROM public.profiles p
  WHERE p.user_id=(SELECT auth.uid());

  IF v_workspace_id IS NULL OR v_role NOT IN ('owner','manager') OR NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id=v_workspace_id AND wm.user_id=(SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'KPI access requires an owner or manager role.' USING errcode='42501';
  END IF;

  RETURN public.get_hlc_business_kpis_internal(p_days);
END;
$function$;

CREATE OR REPLACE FUNCTION public.configure_google_voice_manual_channel(p_sender_identity text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_workspace_id uuid;
  v_role text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING errcode='42501';
  END IF;

  SELECT p.workspace_id, lower(coalesce(p.role,''))
    INTO v_workspace_id, v_role
  FROM public.profiles p
  WHERE p.user_id=(SELECT auth.uid());

  IF v_workspace_id IS NULL OR v_role NOT IN ('owner','manager') OR NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id=v_workspace_id AND wm.user_id=(SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Communications configuration requires an owner or manager role.' USING errcode='42501';
  END IF;

  PERFORM public.configure_google_voice_manual_channel_internal(p_sender_identity);
END;
$function$;

CREATE OR REPLACE FUNCTION public.revoke_portal_invitation(p_invitation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_workspace_id uuid;
  v_role text;
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING errcode='42501';
  END IF;

  SELECT pi.workspace_id INTO v_workspace_id
  FROM public.portal_invitations pi
  WHERE pi.id=p_invitation_id;

  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Invitation not found.' USING errcode='P0002';
  END IF;

  SELECT lower(coalesce(p.role,'')) INTO v_role
  FROM public.profiles p
  WHERE p.user_id=(SELECT auth.uid()) AND p.workspace_id=v_workspace_id;

  IF v_role NOT IN ('owner','manager') OR NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id=v_workspace_id AND wm.user_id=(SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'Portal administration requires an owner or manager role.' USING errcode='42501';
  END IF;

  PERFORM public.revoke_portal_invitation_internal(p_invitation_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.get_hlc_analytics_summary(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_hlc_business_kpis(integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.configure_google_voice_manual_channel(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.revoke_portal_invitation(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_hlc_analytics_summary(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_hlc_business_kpis(integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.configure_google_voice_manual_channel(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.revoke_portal_invitation(uuid) TO authenticated, service_role;
