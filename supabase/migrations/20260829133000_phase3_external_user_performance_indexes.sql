-- Phase 3 rehearsal performance closure.
-- Staged only; production promotion requires explicit approval.
-- Cover the foreign-key columns introduced by the external-user contracts so
-- delete/update checks and common portal joins do not require full scans.

create index if not exists resident_provider_matches_lead_id_idx
  on public.resident_provider_matches (lead_id);

create index if not exists resident_provider_matches_contractor_id_idx
  on public.resident_provider_matches (contractor_id);

create index if not exists resident_job_payments_job_id_idx
  on public.resident_job_payments (job_id);

create index if not exists provider_job_progress_job_id_idx
  on public.provider_job_progress (job_id);

create index if not exists provider_job_progress_contractor_id_idx
  on public.provider_job_progress (contractor_id);
