create table public.billing_enrollment_consents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  disclosure_version text not null,
  trial_days integer not null check(trial_days=14),
  recurring_amount_cents integer not null check(recurring_amount_cents=9900),
  currency text not null check(currency='usd'),
  billing_interval text not null check(billing_interval='month'),
  cancellation_method text not null check(cancellation_method='stripe_billing_portal'),
  client_request_id uuid not null,
  accepted_at timestamptz not null default now(),
  unique(workspace_id,client_request_id)
);
create index billing_enrollment_consents_user_idx on public.billing_enrollment_consents(user_id,accepted_at desc);

create table public.billing_notice_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  stripe_subscription_id text,
  source_stripe_event_id text not null,
  notice_type text not null check(notice_type in ('trial_ending','payment_failed')),
  delivery_status text not null default 'pending' check(delivery_status in ('pending','email_not_connected','sent','failed')),
  occurred_at timestamptz not null default now(),
  delivered_at timestamptz,
  unique(source_stripe_event_id,notice_type)
);
create index billing_notice_events_workspace_idx on public.billing_notice_events(workspace_id,occurred_at desc);

alter table public.billing_enrollment_consents enable row level security;
alter table public.billing_notice_events enable row level security;
create policy billing_consents_member_select on public.billing_enrollment_consents for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=billing_enrollment_consents.workspace_id and wm.user_id=(select auth.uid()))
);
create policy billing_notices_member_select on public.billing_notice_events for select to authenticated using (
  exists(select 1 from public.workspace_members wm where wm.workspace_id=billing_notice_events.workspace_id and wm.user_id=(select auth.uid()))
);
grant select on public.billing_enrollment_consents,public.billing_notice_events to authenticated;
grant all on public.billing_enrollment_consents,public.billing_notice_events to service_role;
