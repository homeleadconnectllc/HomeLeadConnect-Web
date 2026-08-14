create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_site_sources_workspace_id_idx on public.analytics_site_sources(workspace_id);

create or replace function public.record_hlc_analytics_event(
  p_session_id uuid,
  p_event_name text,
  p_path text,
  p_hostname text default null,
  p_referrer_host text default null,
  p_metadata jsonb default '{}'::jsonb
) returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace uuid;
  v_id bigint;
  v_hostname text := lower(nullif(btrim(p_hostname),''));
begin
  if p_session_id is null then raise exception 'session id required'; end if;
  if p_event_name is null or p_event_name !~ '^[a-z][a-z0-9_]{1,63}$' then raise exception 'invalid analytics event'; end if;
  if p_path is null or left(p_path,1) <> '/' or length(p_path) > 500 or position('?' in p_path) > 0 or position('#' in p_path) > 0 then raise exception 'invalid analytics path'; end if;
  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' or pg_column_size(p_metadata) > 4096 then raise exception 'invalid analytics metadata'; end if;

  if v_user is not null then
    select p.workspace_id into v_workspace
    from public.profiles p
    where p.user_id = v_user and p.workspace_id is not null
    limit 1;
    if v_workspace is null then
      select wm.workspace_id into v_workspace
      from public.workspace_members wm
      where wm.user_id = v_user
      order by wm.created_at asc
      limit 1;
    end if;
  end if;

  if v_hostname is not null then
    select s.workspace_id into v_workspace
    from public.analytics_site_sources s
    where s.hostname = v_hostname
      and (v_user is null or v_workspace is null or s.workspace_id = v_workspace);
  end if;

  if v_workspace is null then return null; end if;

  if exists (
    select 1 from public.analytics_events e
    where e.session_id = p_session_id
      and e.event_name = p_event_name
      and e.path = p_path
      and e.created_at > now() - interval '2 seconds'
  ) then
    return null;
  end if;

  insert into public.analytics_events(workspace_id,user_id,session_id,event_name,path,hostname,referrer_host,metadata)
  values (v_workspace,v_user,p_session_id,p_event_name,p_path,v_hostname,left(nullif(btrim(p_referrer_host),''),255),p_metadata)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.record_hlc_analytics_event(uuid,text,text,text,text,jsonb) from public;
grant execute on function public.record_hlc_analytics_event(uuid,text,text,text,text,jsonb) to anon, authenticated;
