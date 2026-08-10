alter function public.set_queue_jobs_updated_at() set search_path = pg_catalog, public, extensions;
alter function public.calculate_next_dial_window(integer) set search_path = pg_catalog, public, extensions;
alter function public.retry_policies_set_updated_at() set search_path = pg_catalog, public, extensions;
alter function public.compute_queue_priority(bigint) set search_path = pg_catalog, public, extensions;
alter function public.recompute_dirty_workspaces(integer) set search_path = pg_catalog, public, extensions;
alter function public.ingest_lead_drift_event(uuid, bigint, text, text, text, text, text, uuid)
  set search_path = pg_catalog, public, extensions;
alter function public.ingest_lead_drift_event(uuid, bigint, text, text, text, text, text, uuid, uuid)
  set search_path = pg_catalog, public, extensions;
alter function public.enqueue_lead_job() set search_path = pg_catalog, public, extensions;
alter function public.move_lead_to_stage_event(bigint, uuid, uuid) set search_path = pg_catalog, public, extensions;
alter function public.move_lead_to_stage_event(bigint, uuid, uuid, text) set search_path = pg_catalog, public, extensions;
alter function public.move_lead_to_stage_event(uuid, uuid, uuid, text, uuid) set search_path = pg_catalog, public, extensions;
alter function public.claim_next_job_global(uuid, integer) set search_path = pg_catalog, public, extensions;
alter function public.mark_workspace_dirty_on_call_logs() set search_path = pg_catalog, public, extensions;
alter function public.claim_next_automation_job(integer) set search_path = pg_catalog, public, extensions;
alter function public.set_automation_job_success(uuid) set search_path = pg_catalog, public, extensions;
alter function public.set_automation_job_failed(uuid, text) set search_path = pg_catalog, public, extensions;
