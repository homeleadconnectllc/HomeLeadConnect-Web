drop policy if exists community_reviews_insert on public.community_reviews;

create policy community_reviews_insert
on public.community_reviews
for insert
to authenticated
with check (
  hlc_is_workspace_member(workspace_id)
  and author_user_id = (select auth.uid())
  and exists (
    select 1
    from public.crm_jobs j
    where j.id = community_reviews.job_id
      and j.workspace_id = community_reviews.workspace_id
      and j.status = 'completed'
  )
);
