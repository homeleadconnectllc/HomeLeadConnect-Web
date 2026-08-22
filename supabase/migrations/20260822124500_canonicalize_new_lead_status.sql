-- Canonicalize only the historical uppercase NEW lead status variant.
--
-- Current canonical writers and the public.leads column default already use
-- lowercase `new`. Historical uppercase `NEW` rows can be skipped by current
-- lowercase-only queue and metrics readers. This migration intentionally does
-- not lowercase every lead status because legacy terminal-state contracts still
-- contain uppercase values and require separate reconciliation.

update public.leads
set status = 'new',
    updated_at = now()
where status = 'NEW';

alter table public.leads
  drop constraint if exists leads_status_no_uppercase_new;

alter table public.leads
  add constraint leads_status_no_uppercase_new
  check (status is null or status <> 'NEW');
