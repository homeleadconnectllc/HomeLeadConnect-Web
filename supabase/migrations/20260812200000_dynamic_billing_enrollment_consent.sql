alter table public.billing_enrollment_consents
  drop constraint if exists billing_enrollment_consents_recurring_amount_cents_check;

alter table public.billing_enrollment_consents
  add constraint billing_enrollment_consents_recurring_amount_cents_check
  check (recurring_amount_cents > 0);

alter table public.billing_enrollment_consents
  drop constraint if exists billing_enrollment_consents_billing_interval_check;

alter table public.billing_enrollment_consents
  add constraint billing_enrollment_consents_billing_interval_check
  check (billing_interval in ('month','year'));
