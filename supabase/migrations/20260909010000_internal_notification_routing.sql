create table if not exists public.internal_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  event_key text not null,
  workspace_id uuid null references public.workspaces(id) on delete set null,
  route text not null,
  destination_email text null,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed')),
  attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_reference text null,
  last_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz null,
  unique (event_type, event_key)
);

alter table public.internal_notification_deliveries enable row level security;
revoke all on table public.internal_notification_deliveries from anon, authenticated;
grant all on table public.internal_notification_deliveries to service_role;

create index if not exists internal_notification_deliveries_status_created_idx
  on public.internal_notification_deliveries (status, created_at);

comment on table public.internal_notification_deliveries is
  'Server-only idempotency and delivery audit for internal HomeLead Connect operational email alerts.';
