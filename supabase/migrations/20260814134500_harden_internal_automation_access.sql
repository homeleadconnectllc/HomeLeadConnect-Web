-- Launch hardening: workflow automation is an internal control-plane capability.
-- Customers, providers, technicians, anonymous users, and unrecognized roles must not invoke it.

DROP POLICY IF EXISTS automation_jobs_select_workspace ON public.automation_jobs;
CREATE POLICY automation_jobs_select_internal_management
ON public.automation_jobs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    JOIN public.profiles p
      ON p.user_id = wm.user_id
     AND p.workspace_id = wm.workspace_id
    WHERE wm.workspace_id = automation_jobs.workspace_id
      AND wm.user_id = (SELECT auth.uid())
      AND lower(coalesce(p.role, '')) IN ('owner', 'manager')
  )
);

CREATE OR REPLACE FUNCTION public.run_hlc_automation(
  p_job_type text,
  p_payload jsonb DEFAULT '{}'::jsonb,
  p_idempotency_key uuid DEFAULT gen_random_uuid()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_workspace_id uuid;
  v_role text;
  v_job_id uuid;
  v_result jsonb := '{}'::jsonb;
  v_existing public.automation_jobs%rowtype;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication is required.' USING errcode='42501';
  END IF;

  SELECT p.workspace_id, lower(coalesce(p.role, ''))
    INTO v_workspace_id, v_role
  FROM public.profiles p
  WHERE p.user_id = auth.uid();

  IF v_workspace_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = v_workspace_id
      AND wm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Workspace membership is required.' USING errcode='42501';
  END IF;

  IF v_role NOT IN ('owner', 'manager') THEN
    RAISE EXCEPTION 'Automation control requires an owner or manager role.' USING errcode='42501';
  END IF;

  p_job_type := lower(btrim(p_job_type));
  IF p_job_type NOT IN ('workflow_health_check','followup_scan','owner_attention_scan') THEN
    RAISE EXCEPTION 'Unsupported automation job type.' USING errcode='22023';
  END IF;

  SELECT * INTO v_existing
  FROM public.automation_jobs j
  WHERE j.workspace_id = v_workspace_id
    AND j.idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'id', v_existing.id,
      'status', v_existing.status,
      'job_type', v_existing.job_type,
      'result', v_existing.result,
      'duplicate', true
    );
  END IF;

  INSERT INTO public.automation_jobs(
    workspace_id, job_type, status, retry_count, max_attempts,
    payload, created_by, run_at, idempotency_key
  ) VALUES (
    v_workspace_id, p_job_type, 'processing', 0, 1,
    coalesce(p_payload, '{}'::jsonb), auth.uid(), now(), p_idempotency_key
  ) RETURNING id INTO v_job_id;

  IF p_job_type = 'workflow_health_check' THEN
    SELECT jsonb_build_object(
      'open_leads', (SELECT count(*) FROM public.leads l WHERE l.workspace_id=v_workspace_id AND NOT l.archived),
      'open_jobs', (SELECT count(*) FROM public.crm_jobs j WHERE j.workspace_id=v_workspace_id AND j.status NOT IN ('completed','cancelled')),
      'offered_assignments', (SELECT count(*) FROM public.job_assignments a WHERE a.workspace_id=v_workspace_id AND a.status='offered'),
      'accepted_assignments', (SELECT count(*) FROM public.job_assignments a WHERE a.workspace_id=v_workspace_id AND a.status='accepted'),
      'scheduled_appointments', (SELECT count(*) FROM public.appointments a WHERE a.workspace_id=v_workspace_id AND a.status='scheduled')
    ) INTO v_result;
  ELSIF p_job_type = 'followup_scan' THEN
    SELECT jsonb_build_object(
      'overdue', (
        SELECT count(*)
        FROM public.follow_ups f
        JOIN public.leads l ON l.id_uuid=f.lead_id
        WHERE l.workspace_id=v_workspace_id
          AND f.status='pending'
          AND f.scheduled_for < now()
      ),
      'next_7_days', (
        SELECT count(*)
        FROM public.follow_ups f
        JOIN public.leads l ON l.id_uuid=f.lead_id
        WHERE l.workspace_id=v_workspace_id
          AND f.status='pending'
          AND f.scheduled_for >= now()
          AND f.scheduled_for <= now()+interval '7 days'
      )
    ) INTO v_result;
  ELSIF p_job_type = 'owner_attention_scan' THEN
    SELECT jsonb_build_object(
      'open_handoffs', (SELECT count(*) FROM public.ai_agent_handoffs h WHERE h.workspace_id=v_workspace_id AND h.destination_agent='kendrell' AND h.status='open'),
      'open_attention_items', (SELECT count(*) FROM public.ai_owner_attention_items i WHERE i.workspace_id=v_workspace_id AND i.status='open')
    ) INTO v_result;
  END IF;

  UPDATE public.automation_jobs
  SET status='success', result=v_result, completed_at=now(), updated_at=now()
  WHERE id=v_job_id;

  INSERT INTO public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
  VALUES(v_workspace_id,'automation',v_job_id,'automation.succeeded',jsonb_build_object('job_type',p_job_type,'result',v_result));

  RETURN jsonb_build_object('id',v_job_id,'status','success','job_type',p_job_type,'result',v_result,'duplicate',false);
EXCEPTION WHEN OTHERS THEN
  IF v_job_id IS NOT NULL THEN
    UPDATE public.automation_jobs
    SET status='failed', last_error=left(sqlerrm,500), completed_at=now(), updated_at=now()
    WHERE id=v_job_id;
  END IF;
  RAISE;
END;
$function$;

REVOKE ALL ON FUNCTION public.run_hlc_automation(text,jsonb,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.run_hlc_automation(text,jsonb,uuid) TO authenticated;
