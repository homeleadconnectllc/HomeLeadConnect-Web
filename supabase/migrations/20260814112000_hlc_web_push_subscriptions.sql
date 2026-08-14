create extension if not exists pg_net with schema extensions;

create table if not exists public.web_push_config (
  id boolean primary key default true check (id),
  public_key text not null,
  private_key text not null,
  dispatch_token text not null,
  edge_url text not null,
  contact text not null default 'mailto:info@homeleadconnect.org',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.web_push_config enable row level security;
revoke all on public.web_push_config from anon,authenticated;
grant select,insert,update,delete on public.web_push_config to service_role;

create table if not exists public.web_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  failure_count integer not null default 0 check(failure_count>=0)
);
alter table public.web_push_subscriptions enable row level security;
revoke all on public.web_push_subscriptions from anon,authenticated;
grant select,insert,update,delete on public.web_push_subscriptions to service_role;
create index if not exists web_push_subscriptions_user_enabled_idx on public.web_push_subscriptions(user_id,enabled);

create or replace function public.get_hlc_web_push_public_key() returns text language plpgsql security definer set search_path=pg_catalog,public as $$
declare v text; begin if auth.uid() is null then raise exception 'authentication required' using errcode='42501'; end if; select public_key into v from public.web_push_config where id=true; return v; end $$;
revoke all on function public.get_hlc_web_push_public_key() from public;
grant execute on function public.get_hlc_web_push_public_key() to authenticated;

create or replace function public.register_hlc_web_push_subscription(p_endpoint text,p_p256dh text,p_auth text) returns uuid language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_user uuid:=auth.uid(); v_id uuid; begin
if v_user is null then raise exception 'authentication required' using errcode='42501'; end if;
if p_endpoint is null or length(p_endpoint) not between 20 and 2048 or p_endpoint !~ '^https://' then raise exception 'invalid push endpoint'; end if;
if p_p256dh is null or length(p_p256dh) not between 20 and 512 then raise exception 'invalid p256dh key'; end if;
if p_auth is null or length(p_auth) not between 8 and 256 then raise exception 'invalid auth key'; end if;
insert into public.web_push_subscriptions(user_id,endpoint,p256dh,auth,enabled,updated_at) values(v_user,p_endpoint,p_p256dh,p_auth,true,now())
on conflict(endpoint) do update set user_id=excluded.user_id,p256dh=excluded.p256dh,auth=excluded.auth,enabled=true,updated_at=now(),failure_count=0 returning id into v_id;
return v_id; end $$;
revoke all on function public.register_hlc_web_push_subscription(text,text,text) from public;
grant execute on function public.register_hlc_web_push_subscription(text,text,text) to authenticated;

create or replace function public.disable_hlc_web_push_subscription(p_endpoint text) returns boolean language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_user uuid:=auth.uid(); v_count integer; begin if v_user is null then raise exception 'authentication required' using errcode='42501'; end if; update public.web_push_subscriptions set enabled=false,updated_at=now() where user_id=v_user and endpoint=p_endpoint; get diagnostics v_count=row_count; return v_count>0; end $$;
revoke all on function public.disable_hlc_web_push_subscription(text) from public;
grant execute on function public.disable_hlc_web_push_subscription(text) to authenticated;

create or replace function public.hlc_queue_web_push() returns trigger language plpgsql security definer set search_path=pg_catalog,public,extensions as $$
declare cfg public.web_push_config%rowtype; begin
select * into cfg from public.web_push_config where id=true;
if cfg.id is null then return new; end if;
perform net.http_post(url:=cfg.edge_url,headers:=jsonb_build_object('Content-Type','application/json'),body:=jsonb_build_object('notification_id',new.id,'dispatch_token',cfg.dispatch_token),timeout_milliseconds:=5000);
return new;
exception when others then raise warning 'HLC push dispatch enqueue failed: %',sqlerrm; return new; end $$;
revoke all on function public.hlc_queue_web_push() from public,anon,authenticated;
drop trigger if exists notifications_queue_web_push on public.notifications;
create trigger notifications_queue_web_push after insert on public.notifications for each row execute function public.hlc_queue_web_push();

-- Per-environment VAPID keys, dispatch token, and edge_url are intentionally provisioned outside source control.
