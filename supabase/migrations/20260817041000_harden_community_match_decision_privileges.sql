revoke all privileges on table public.community_match_decisions from anon;
revoke all privileges on table public.community_match_decisions from authenticated;
grant select, insert, update, delete on table public.community_match_decisions to authenticated;
