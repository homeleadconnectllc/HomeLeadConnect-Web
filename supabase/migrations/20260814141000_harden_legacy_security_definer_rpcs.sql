-- Launch-day authorization hardening for legacy SECURITY DEFINER functions.
-- Browser callers must never gain cross-workspace access merely by being Supabase `authenticated`.

CREATE OR REPLACE FUNCTION public.can_create_pipeline(p_workspace_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_limit int;
  v_count int;
BEGIN
  IF (SELECT auth.role()) <> 'service_role' AND NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = (SELECT auth.uid())
  ) THEN
    RETURN false;
  END IF;

  SELECT wps.pipeline_limit INTO v_limit
  FROM public.workspace_plan_status wps
  WHERE wps.workspace_id = p_workspace_id
    AND wps.is_active = true
  LIMIT 1;

  IF v_limit IS NULL THEN RETURN false; END IF;

  SELECT count(*) INTO v_count
  FROM public.pipelines p
  WHERE p.workspace_id = p_workspace_id;

  RETURN v_count < v_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.can_insert_lead(p_workspace_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_limit int;
  v_count int;
BEGIN
  IF (SELECT auth.role()) <> 'service_role' AND NOT EXISTS (
    SELECT 1 FROM public.workspace_members wm
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = (SELECT auth.uid())
  ) THEN
    RETURN false;
  END IF;

  SELECT wps.lead_limit INTO v_limit
  FROM public.workspace_plan_status wps
  WHERE wps.workspace_id = p_workspace_id
    AND wps.is_active = true
  LIMIT 1;

  IF v_limit IS NULL THEN RETURN false; END IF;

  SELECT count(*) INTO v_count
  FROM public.leads l
  WHERE l.workspace_id = p_workspace_id
    AND l.archived = false;

  RETURN v_count < v_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_billing_pressure(p_workspace_id uuid)
RETURNS SETOF public.workspace_billing_pressure
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF (SELECT auth.role()) <> 'service_role' AND NOT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.profiles p
      ON p.user_id = wm.user_id
     AND p.workspace_id = wm.workspace_id
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = (SELECT auth.uid())
      AND lower(coalesce(p.role, '')) IN ('owner','manager')
  ) THEN
    RAISE EXCEPTION 'Billing access requires an owner or manager role.' USING errcode='42501';
  END IF;

  RETURN QUERY
  SELECT * FROM public.workspace_billing_pressure wbp
  WHERE wbp.workspace_id = p_workspace_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_upgrade_signal(p_workspace_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_result jsonb;
BEGIN
  IF (SELECT auth.role()) <> 'service_role' AND NOT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.profiles p
      ON p.user_id = wm.user_id
     AND p.workspace_id = wm.workspace_id
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = (SELECT auth.uid())
      AND lower(coalesce(p.role, '')) IN ('owner','manager')
  ) THEN
    RAISE EXCEPTION 'Billing access requires an owner or manager role.' USING errcode='42501';
  END IF;

  SELECT jsonb_build_object(
    'workspace_id', workspace_id,
    'upgrade_needed', upgrade_needed,
    'leads', jsonb_build_object(
      'limit_reached', leads_limit_reached,
      'remaining', leads_remaining,
      'limit', lead_limit,
      'used', active_leads
    ),
    'pipelines', jsonb_build_object(
      'limit_reached', pipelines_limit_reached,
      'remaining', pipelines_remaining,
      'limit', pipeline_limit,
      'used', pipeline_count
    )
  ) INTO v_result
  FROM public.workspace_billing_pressure
  WHERE workspace_id = p_workspace_id
  LIMIT 1;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_lead_if_under_limit(
  p_workspace_id uuid,
  p_user_id uuid,
  p_full_name text,
  p_email text,
  p_pipeline_stage_id uuid
)
RETURNS TABLE(id uuid, workspace_id uuid, user_id uuid, full_name text, email text, pipeline_stage_id uuid, created_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_limit int;
  v_count int;
BEGIN
  IF (SELECT auth.role()) <> 'service_role' AND NOT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.profiles p
      ON p.user_id = wm.user_id
     AND p.workspace_id = wm.workspace_id
    WHERE wm.workspace_id = p_workspace_id
      AND wm.user_id = (SELECT auth.uid())
      AND lower(coalesce(p.role, '')) IN ('owner','manager','technician')
  ) THEN
    RAISE EXCEPTION 'Internal workspace access is required.' USING errcode='42501';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_workspace_id::text));

  SELECT wps.lead_limit INTO v_limit
  FROM public.workspace_plan_status wps
  WHERE wps.workspace_id = p_workspace_id
    AND wps.is_active = true;

  IF v_limit IS NULL THEN
    RAISE EXCEPTION 'ENTITLEMENT_NOT_FOUND_OR_INACTIVE';
  END IF;

  SELECT count(*) INTO v_count
  FROM public.leads_new ln
  WHERE ln.workspace_id = p_workspace_id
    AND ln.archived = false;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION 'LEAD_LIMIT_REACHED';
  END IF;

  RETURN QUERY
  INSERT INTO public.leads_new (
    workspace_id, user_id, full_name, email, pipeline_stage_id,
    archived, stage_updated_at, updated_at
  ) VALUES (
    p_workspace_id, p_user_id, p_full_name, p_email, p_pipeline_stage_id,
    false, now(), now()
  )
  RETURNING leads_new.id, leads_new.workspace_id, leads_new.user_id,
            leads_new.full_name, leads_new.email, leads_new.pipeline_stage_id,
            leads_new.created_at;
END;
$function$;

CREATE OR REPLACE FUNCTION public.perform_dashboard_action(
  p_lead_id bigint,
  p_action text,
  p_actor_id uuid,
  p_request_id uuid DEFAULT gen_random_uuid()
)
RETURNS TABLE(id bigint, full_name text, phone text, last_call_outcome text, next_follow_up_at timestamptz, priority_score numeric, queue_bucket text, next_best_action text, archived boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO '', 'pg_temp'
AS $function$
DECLARE
  v_lead public.leads%rowtype;
  v_has_request boolean;
BEGIN
  SELECT l.* INTO v_lead
  FROM public.leads l
  WHERE l.id = p_lead_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found';
  END IF;

  IF (SELECT auth.role()) <> 'service_role' THEN
    IF (SELECT auth.uid()) IS NULL OR p_actor_id IS DISTINCT FROM (SELECT auth.uid()) THEN
      RAISE EXCEPTION 'Authenticated actor mismatch.' USING errcode='42501';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.workspace_members wm
      JOIN public.profiles p
        ON p.user_id = wm.user_id
       AND p.workspace_id = wm.workspace_id
      WHERE wm.workspace_id = v_lead.workspace_id
        AND wm.user_id = (SELECT auth.uid())
        AND lower(coalesce(p.role, '')) IN ('owner','manager','technician')
    ) THEN
      RAISE EXCEPTION 'Internal workspace access is required.' USING errcode='42501';
    END IF;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.call_logs cl WHERE cl.request_id = p_request_id
  ) INTO v_has_request;

  IF v_has_request THEN
    RETURN QUERY SELECT * FROM public.compute_lead_dashboard_row(p_lead_id);
    RETURN;
  END IF;

  IF v_lead.archived THEN
    RAISE EXCEPTION 'Action not allowed: lead is archived';
  END IF;

  p_action := lower(btrim(p_action));

  IF p_action = 'call'
     AND v_lead.next_follow_up_at IS NOT NULL
     AND v_lead.next_follow_up_at > now() THEN
    RAISE EXCEPTION 'Action not allowed: lead is snoozed';
  END IF;

  IF p_action = 'call' THEN
    INSERT INTO public.call_logs (lead_id,outcome,created_at,workspace_id,request_id)
    VALUES (p_lead_id,'call_attempted',now(),v_lead.workspace_id,p_request_id);
    UPDATE public.leads SET last_contacted_at=now() WHERE id=p_lead_id;
  ELSIF p_action = 'snooze' THEN
    UPDATE public.leads SET next_follow_up_at=now()+interval '60 minutes' WHERE id=p_lead_id;
  ELSIF p_action = 'complete' THEN
    UPDATE public.leads SET archived=true WHERE id=p_lead_id;
  ELSIF p_action = 'sms' THEN
    -- Legacy hook point remains intentionally no-op until canonical communications owns SMS.
    NULL;
  ELSE
    RAISE EXCEPTION 'Invalid action: %', p_action;
  END IF;

  RETURN QUERY SELECT * FROM public.compute_lead_dashboard_row(p_lead_id);
END;
$function$;

-- Keep browser/API access explicit. Function bodies above are the authorization boundary.
REVOKE ALL ON FUNCTION public.can_create_pipeline(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_insert_lead(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_billing_pressure(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_upgrade_signal(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_lead_if_under_limit(uuid,uuid,text,text,uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.perform_dashboard_action(bigint,text,uuid,uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_create_pipeline(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_insert_lead(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_billing_pressure(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_upgrade_signal(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_lead_if_under_limit(uuid,uuid,text,text,uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.perform_dashboard_action(bigint,text,uuid,uuid) TO authenticated, service_role;
