revoke all on table public.plans from anon,authenticated;
grant select on table public.plans to anon,authenticated;

insert into public.plans(key,name,price_cents,currency,interval,lead_limit,pipeline_limit,is_active,stripe_price_id)
values('hlc_v1','HomeLead Connect V1',9900,'usd','month',0,0,true,null)
on conflict(key) do update set name=excluded.name,price_cents=excluded.price_cents,currency=excluded.currency,
  interval=excluded.interval,is_active=true,updated_at=now();

alter table public.subscriptions
  add column if not exists trial_start timestamptz,
  add column if not exists trial_end timestamptz,
  add column if not exists grace_period_end timestamptz,
  add column if not exists ended_at timestamptz,
  add column if not exists last_stripe_event_id text;

alter table public.workspace_plan_status
  add column if not exists trial_end timestamptz,
  add column if not exists grace_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists last_stripe_event_id text;

create unique index if not exists subscriptions_stripe_subscription_unique
  on public.subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;
create index if not exists subscriptions_stripe_customer_idx
  on public.subscriptions(stripe_customer_id) where stripe_customer_id is not null;

create table public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  api_version text,
  payload_sha256 text not null,
  status text not null check(status in ('processing','processed','failed')),
  attempt_count integer not null default 1,
  first_received_at timestamptz not null default now(),
  last_received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text
);
alter table public.stripe_webhook_events enable row level security;
grant all on public.stripe_webhook_events to service_role;

create or replace function public.increment_stripe_webhook_attempt(p_event_id text)
returns void language sql security invoker set search_path='' as $$
  update public.stripe_webhook_events set attempt_count=attempt_count+1,last_received_at=now() where event_id=p_event_id;
$$;
revoke all on function public.increment_stripe_webhook_attempt(text) from public,anon,authenticated;
grant execute on function public.increment_stripe_webhook_attempt(text) to service_role;

create or replace function public.hlc_workspace_has_paid_access(p_workspace_id uuid)
returns boolean language sql stable security invoker set search_path='' as $$
  select exists(
    select 1 from public.workspace_plan_status s
    where s.workspace_id=p_workspace_id and s.plan_key='hlc_v1' and (
      s.status in ('trialing','active')
      or (s.status='past_due' and s.grace_period_end>now())
    ) and s.is_active=true
  );
$$;

revoke all on function public.hlc_workspace_has_paid_access(uuid) from public,anon;
grant execute on function public.hlc_workspace_has_paid_access(uuid) to authenticated,service_role;
