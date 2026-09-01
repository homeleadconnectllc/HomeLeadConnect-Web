-- E1 Community Premium: explicit RPC privilege hardening for Supabase default privileges.
-- Authenticated callers are intentionally allowed; anonymous callers are not.

revoke execute on function public.community_discover_members() from anon;
revoke execute on function public.community_request_connection(uuid) from anon;
revoke execute on function public.community_respond_connection(uuid, boolean) from anon;
revoke execute on function public.community_can_message(uuid) from anon;
revoke execute on function public.community_list_relationships() from anon;
revoke execute on function public.community_send_message(uuid, text) from anon;
revoke execute on function public.community_list_messages(uuid) from anon;
revoke execute on function public.community_block_connection(uuid) from anon;

grant execute on function public.community_discover_members() to authenticated;
grant execute on function public.community_request_connection(uuid) to authenticated;
grant execute on function public.community_respond_connection(uuid, boolean) to authenticated;
grant execute on function public.community_can_message(uuid) to authenticated;
grant execute on function public.community_list_relationships() to authenticated;
grant execute on function public.community_send_message(uuid, text) to authenticated;
grant execute on function public.community_list_messages(uuid) to authenticated;
grant execute on function public.community_block_connection(uuid) to authenticated;
