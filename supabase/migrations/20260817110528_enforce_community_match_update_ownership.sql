drop policy if exists "community_match_decisions_update_own"
  on public.community_match_decisions;

create policy "community_match_decisions_update_own"
  on public.community_match_decisions for update
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = community_match_decisions.workspace_id
        and wm.user_id = (select auth.uid())
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = community_match_decisions.workspace_id
        and wm.user_id = (select auth.uid())
    )
    and exists (
      select 1
      from public.contractors c
      where c.id = community_match_decisions.contractor_id
        and c.workspace_id = community_match_decisions.workspace_id
    )
  );
