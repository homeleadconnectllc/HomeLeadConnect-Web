-- Launch-day workflow automation: hourly deterministic monitoring only.
-- This scheduler never sends customer communications, assigns providers, changes appointments,
-- changes billing, or mutates lead/job workflow state. It persists operational evidence only.

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.run_hlc_scheduled_workflow_scan()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_workspace record;
  v_result jsonb;
  v_job_id uuid;
  v_created integer := 0;
BEGIN
  FOR v_workspace IN
    SELECT DISTINCT wm.workspace_id
    FROM public.workspace_members wm
    JOIN public.profiles p
      ON p.user_id = wm.user_id
     AND p.workspace_id = wm.workspace_id
    WHERE lower(coalesce(p.role, '')) IN ('owner', 'manager')
  LOOP
    -- Avoid duplicates if the scheduler is retried or manually invoked near the scheduled run.
    IF EXISTS (
      SELECT 1
      FROM public.automation_jobs j
      WHERE j.workspace_id = v_workspace.workspace_id
        AND j.job_type = 'workflow_automation_scan'
        AND j.created_at >= now() - interval '50 minutes'
        AND j.status = 'success'
    ) THEN
      CONTINUE;
    END IF;

    SELECT jsonb_build_object(
      'observed_at', now(),
      'source', 'pg_cron',
      'workflow_health', jsonb_build_object(
        'open_leads', (SELECT count(*) FROM public.leads l WHERE l.workspace_id=v_workspace.workspace_id AND NOT l.archived),
        'open_jobs', (SELECT count(*) FROM public.crm_jobs j WHERE j.workspace_id=v_workspace.workspace_id AND j.status NOT IN ('completed','cancelled')),
        'offered_assignments', (SELECT count(*) FROM public.job_assignments a WHERE a.workspace_id=v_workspace.workspace_id AND a.status='offered'),
        'accepted_assignments', (SELECT count(*) FROM public.job_assignments a WHERE a.workspace_id=v_workspace.workspace_id AND a.status='accepted'),
        'scheduled_appointments', (SELECT count(*) FROM public.appointments a WHERE a.workspace_id=v_workspace.workspace_id AND a.status='scheduled')
      ),
      'followups', jsonb_build_object(
        'overdue', (
          SELECT count(*)
          FROM public.follow_ups f
          JOIN public.leads l ON l.id_uuid=f.lead_id
          WHERE l.workspace_id=v_workspace.workspace_id
            AND f.status='pending'
            AND f.scheduled_for < now()
        ),
        'next_7_days', (
          SELECT count(*)
          FROM public.follow_ups f
          JOIN public.leads l ON l.id_uuid=f.lead_id
          WHERE l.workspace_id=v_workspace.workspace_id
            AND f.status='pending'
            AND f.scheduled_for >= now()
            AND f.scheduled_for <= now()+interval '7 days'
        )
      ),
      'owner_attention', jsonb_build_object(
        'open_handoffs', (SELECT count(*) FROM public.ai_agent_handoffs h WHERE h.workspace_id=v_workspace.workspace_id AND h.destination_agent='kendrell' AND h.status='open'),
        'open_attention_items', (SELECT count(*) FROM public.ai_owner_attention_items i WHERE i.workspace_id=v_workspace.workspace_id AND i.status='open')
      )
    ) INTO v_result;

    INSERT INTO public.automation_jobs(
      workspace_id,
      job_type,
      status,
      retry_count,
      max_attempts,
      payload,
      result,
      run_at,
      completed_at,
      created_by
    ) VALUES (
      v_workspace.workspace_id,
      'workflow_automation_scan',
      'success',
      0,
      1,
      jsonb_build_object('source','pg_cron','mode','automatic','read_only',true),
      v_result,
      now(),
      now(),
      null
    ) RETURNING id INTO v_job_id;

    INSERT INTO public.activity_log(workspace_id,entity_type,entity_id,event_type,payload)
    VALUES(
      v_workspace.workspace_id,
      'automation',
      v_job_id,
      'automation.scheduled_workflow_scan_succeeded',
      jsonb_build_object('job_type','workflow_automation_scan','result',v_result)
    );

    v_created := v_created + 1;
  END LOOP;

  RETURN v_created;
END;
$function$;

REVOKE ALL ON FUNCTION public.run_hlc_scheduled_workflow_scan() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.run_hlc_scheduled_workflow_scan() FROM anon;
REVOKE ALL ON FUNCTION public.run_hlc_scheduled_workflow_scan() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.run_hlc_scheduled_workflow_scan() TO service_role;

DO $block$
DECLARE
  v_job_id bigint;
BEGIN
  SELECT jobid INTO v_job_id FROM cron.job WHERE jobname = 'hlc-workflow-automation-hourly' LIMIT 1;
  IF v_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(v_job_id);
  END IF;
END;
$block$;

SELECT cron.schedule(
  'hlc-workflow-automation-hourly',
  '7 * * * *',
  'select public.run_hlc_scheduled_workflow_scan();'
);
