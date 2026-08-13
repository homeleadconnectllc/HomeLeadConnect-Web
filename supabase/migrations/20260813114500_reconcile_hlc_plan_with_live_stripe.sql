-- Reconcile the published HLC plan with the approved live Stripe Pro price.
-- Repository migration only; do not apply to production without the normal production migration gate.

update public.plans
set
  name = 'Pro',
  price_cents = 4999,
  currency = 'usd',
  interval = 'month',
  stripe_price_id = 'price_1Tdo5cLE7v3WdqBuj7Jgt3T1',
  is_active = true,
  updated_at = now()
where key = 'hlc_v1';

-- Fail migration verification if the canonical plan row is unexpectedly missing.
do $$
begin
  if not exists (
    select 1
    from public.plans
    where key = 'hlc_v1'
      and name = 'Pro'
      and price_cents = 4999
      and currency = 'usd'
      and interval = 'month'
      and stripe_price_id = 'price_1Tdo5cLE7v3WdqBuj7Jgt3T1'
      and is_active = true
  ) then
    raise exception 'HLC Pro billing plan reconciliation failed';
  end if;
end $$;
