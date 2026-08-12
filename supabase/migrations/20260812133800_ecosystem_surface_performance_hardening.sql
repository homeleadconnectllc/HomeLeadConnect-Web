create index if not exists community_posts_author_idx on public.community_posts(author_user_id);
create index if not exists community_reviews_author_idx on public.community_reviews(author_user_id);
create index if not exists community_referrals_workspace_idx on public.community_referrals(workspace_id);
create index if not exists community_referrals_referrer_idx on public.community_referrals(referrer_user_id);
create index if not exists community_reports_reporter_idx on public.community_reports(reporter_user_id);
create index if not exists community_reports_post_idx on public.community_reports(post_id) where post_id is not null;
create index if not exists community_reports_review_idx on public.community_reports(review_id) where review_id is not null;
create index if not exists community_reports_resolved_by_idx on public.community_reports(resolved_by) where resolved_by is not null;
create index if not exists community_groups_created_by_idx on public.community_groups(created_by);
create index if not exists participant_preferences_workspace_idx on public.participant_preferences(workspace_id);
create index if not exists provider_availability_workspace_idx on public.provider_availability(workspace_id);
create index if not exists saved_providers_workspace_idx on public.saved_providers(workspace_id);
create index if not exists saved_providers_contractor_idx on public.saved_providers(contractor_id);
create index if not exists resident_properties_user_only_idx on public.resident_properties(user_id);

create or replace function public.hlc_is_workspace_member(p_workspace_id uuid)
returns boolean language sql stable security invoker set search_path='' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.workspace_members wm where wm.workspace_id=p_workspace_id and wm.user_id=(select auth.uid())
  );
$$;
create or replace function public.hlc_is_workspace_owner(p_workspace_id uuid)
returns boolean language sql stable security invoker set search_path='' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.profiles p where p.workspace_id=p_workspace_id and p.user_id=(select auth.uid()) and lower(p.role)='owner'
  );
$$;

drop policy if exists community_posts_insert on public.community_posts;
drop policy if exists community_posts_update on public.community_posts;
drop policy if exists community_reviews_insert on public.community_reviews;
drop policy if exists community_referrals_select on public.community_referrals;
drop policy if exists community_referrals_insert on public.community_referrals;
drop policy if exists community_reports_select on public.community_reports;
drop policy if exists community_reports_insert on public.community_reports;
drop policy if exists saved_providers_all on public.saved_providers;
drop policy if exists participant_preferences_all on public.participant_preferences;
drop policy if exists resident_properties_all on public.resident_properties;
drop policy if exists community_groups_insert on public.community_groups;
drop policy if exists community_groups_update on public.community_groups;

create policy community_posts_insert on public.community_posts for insert to authenticated with check (public.hlc_is_workspace_member(workspace_id) and author_user_id=(select auth.uid()));
create policy community_posts_update on public.community_posts for update to authenticated using (author_user_id=(select auth.uid()) or public.hlc_is_workspace_owner(workspace_id)) with check (public.hlc_is_workspace_member(workspace_id));
create policy community_reviews_insert on public.community_reviews for insert to authenticated with check (public.hlc_is_workspace_member(workspace_id) and author_user_id=(select auth.uid()) and exists (select 1 from public.crm_jobs j where j.id=job_id and j.workspace_id=workspace_id and j.status='completed'));
create policy community_referrals_select on public.community_referrals for select to authenticated using (referrer_user_id=(select auth.uid()) or public.hlc_is_workspace_owner(workspace_id));
create policy community_referrals_insert on public.community_referrals for insert to authenticated with check (public.hlc_is_workspace_member(workspace_id) and referrer_user_id=(select auth.uid()));
create policy community_reports_select on public.community_reports for select to authenticated using (reporter_user_id=(select auth.uid()) or public.hlc_is_workspace_owner(workspace_id));
create policy community_reports_insert on public.community_reports for insert to authenticated with check (public.hlc_is_workspace_member(workspace_id) and reporter_user_id=(select auth.uid()));
create policy saved_providers_all on public.saved_providers for all to authenticated using (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id)) with check (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id));
create policy participant_preferences_all on public.participant_preferences for all to authenticated using (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id)) with check (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id));
create policy resident_properties_all on public.resident_properties for all to authenticated using (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id)) with check (user_id=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id));
create policy community_groups_insert on public.community_groups for insert to authenticated with check (created_by=(select auth.uid()) and public.hlc_is_workspace_member(workspace_id));
create policy community_groups_update on public.community_groups for update to authenticated using (created_by=(select auth.uid()) or public.hlc_is_workspace_owner(workspace_id)) with check (public.hlc_is_workspace_member(workspace_id));
