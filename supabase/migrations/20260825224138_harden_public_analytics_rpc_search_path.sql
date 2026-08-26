alter function public.record_hlc_analytics_event(uuid,text,text,text,text,jsonb) set search_path = '';
revoke all on function public.record_hlc_analytics_event(uuid,text,text,text,text,jsonb) from public;
grant execute on function public.record_hlc_analytics_event(uuid,text,text,text,text,jsonb) to anon, authenticated, service_role;
