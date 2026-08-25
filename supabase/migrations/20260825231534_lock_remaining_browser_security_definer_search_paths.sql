-- Pin the remaining audited browser-callable SECURITY DEFINER RPCs to an empty
-- search_path. Their application relations are already schema-qualified and their
-- existing authentication/workspace/provider authorization logic is unchanged.

alter function public.add_linked_provider_service(bigint,text) set search_path = '';
alter function public.add_linked_provider_service_area(bigint,text,text,text,integer) set search_path = '';
alter function public.call_lead(uuid,uuid,text) set search_path = '';
alter function public.change_lead_stage(uuid,bigint,text,text,text) set search_path = '';
alter function public.claim_next_lead_balanced(uuid,uuid) set search_path = '';
alter function public.disable_hlc_web_push_subscription(text) set search_path = '';
alter function public.get_hlc_web_push_public_key() set search_path = '';
alter function public.get_linked_provider_profile(bigint) set search_path = '';
alter function public.get_linked_provider_setup(bigint) set search_path = '';
alter function public.get_next_lead(uuid) set search_path = '';
alter function public.register_hlc_web_push_subscription(text,text,text) set search_path = '';
alter function public.remove_linked_provider_service(bigint,uuid) set search_path = '';
alter function public.remove_linked_provider_service_area(bigint,uuid) set search_path = '';
alter function public.route_lead(uuid,bigint,integer) set search_path = '';
alter function public.set_linked_provider_availability(bigint,boolean,text,timestamptz) set search_path = '';
alter function public.set_provider_map_coordinates(bigint,double precision,double precision) set search_path = '';
alter function public.update_linked_provider_profile(bigint,text,text,text,text,text,text,text,text,text,text,text) set search_path = '';
