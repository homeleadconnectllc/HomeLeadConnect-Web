-- Align analytics authorization with the launch-stabilized workspace role authority.
-- workspace_members.role is authoritative; profiles.role is only a compatibility mirror.

create or replace function public.get_hlc_analytics_summary(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_role text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  v_workspace_id := public.current_workspace_id();
  v_role := public.current_workspace_role();

  if v_workspace_id is null or v_role not in ('owner','manager') then
    raise exception 'Analytics access requires an owner or manager role.' using errcode='42501';
  end if;

  return public.get_hlc_analytics_summary_internal(p_days);
end;
$function$;

revoke all on function public.get_hlc_analytics_summary(integer) from public, anon;
grant execute on function public.get_hlc_analytics_summary(integer) to authenticated, service_role;

create or replace function public.get_hlc_business_kpis(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_role text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  v_workspace_id := public.current_workspace_id();
  v_role := public.current_workspace_role();

  if v_workspace_id is null or v_role not in ('owner','manager') then
    raise exception 'KPI access requires an owner or manager role.' using errcode='42501';
  end if;

  return public.get_hlc_business_kpis_internal(p_days);
end;
$function$;

revoke all on function public.get_hlc_business_kpis(integer) from public, anon;
grant execute on function public.get_hlc_business_kpis(integer) to authenticated, service_role;

create or replace function public.get_hlc_growth_summary(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_role text;
  v_since timestamptz := now() - make_interval(days => greatest(1, least(coalesce(p_days, 30), 365)));
  v_total_leads integer := 0;
  v_unknown_leads integer := 0;
  v_referrals integer := 0;
  v_sources jsonb := '[]'::jsonb;
  v_referral_statuses jsonb := '[]'::jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication is required.' using errcode='42501';
  end if;

  v_workspace_id := public.current_workspace_id();
  v_role := public.current_workspace_role();

  if v_workspace_id is null or v_role not in ('owner','manager') then
    raise exception 'Growth analytics access requires an owner or manager role.' using errcode='42501';
  end if;

  select count(*)::int,
         count(*) filter (where nullif(btrim(coalesce(l.source,'')),'') is null or lower(btrim(l.source))='unknown')::int
    into v_total_leads, v_unknown_leads
  from public.leads l
  where l.workspace_id=v_workspace_id
    and l.created_at>=v_since
    and coalesce(l.archived,false)=false;

  select coalesce(
    jsonb_agg(jsonb_build_object('source', source_key, 'lead_count', lead_count) order by lead_count desc, source_key),
    '[]'::jsonb
  ) into v_sources
  from (
    select case when nullif(btrim(coalesce(l.source,'')),'') is null then 'unknown' else lower(btrim(l.source)) end as source_key,
           count(*)::int as lead_count
    from public.leads l
    where l.workspace_id=v_workspace_id
      and l.created_at>=v_since
      and coalesce(l.archived,false)=false
    group by 1
  ) s;

  select count(*)::int
    into v_referrals
  from public.community_referrals r
  where r.workspace_id=v_workspace_id and r.created_at>=v_since;

  select coalesce(
    jsonb_agg(jsonb_build_object('status', status_key, 'count', referral_count) order by referral_count desc, status_key),
    '[]'::jsonb
  ) into v_referral_statuses
  from (
    select lower(coalesce(nullif(btrim(r.status),''),'unknown')) as status_key,
           count(*)::int as referral_count
    from public.community_referrals r
    where r.workspace_id=v_workspace_id and r.created_at>=v_since
    group by 1
  ) rs;

  return jsonb_build_object(
    'days', greatest(1, least(coalesce(p_days,30),365)),
    'total_leads', v_total_leads,
    'unknown_source_leads', v_unknown_leads,
    'known_source_leads', greatest(v_total_leads-v_unknown_leads,0),
    'attribution_known_rate', case when v_total_leads=0 then 0 else round(((v_total_leads-v_unknown_leads)::numeric/v_total_leads::numeric)*100,1) end,
    'sources', v_sources,
    'referrals', v_referrals,
    'referral_statuses', v_referral_statuses
  );
end;
$function$;

revoke all on function public.get_hlc_growth_summary(integer) from public, anon;
grant execute on function public.get_hlc_growth_summary(integer) to authenticated, service_role;
