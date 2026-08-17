create index if not exists community_match_decisions_contractor_id_idx
  on public.community_match_decisions (contractor_id);

create index if not exists community_match_decisions_user_id_idx
  on public.community_match_decisions (user_id);

drop policy if exists "community_match_decisions_select_own"
  on public.community_match_decisions;

create policy "community_match_decisions_select_own"
  on public.community_match_decisions for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = community_match_decisions.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );

drop policy if exists "community_match_decisions_insert_own"
  on public.community_match_decisions;

create policy "community_match_decisions_insert_own"
  on public.community_match_decisions for insert
  to authenticated
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

drop policy if exists "community_match_decisions_delete_own"
  on public.community_match_decisions;

create policy "community_match_decisions_delete_own"
  on public.community_match_decisions for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = community_match_decisions.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );
