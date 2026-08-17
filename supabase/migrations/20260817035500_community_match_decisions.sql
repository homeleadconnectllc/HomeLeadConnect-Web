create table if not exists public.community_match_decisions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  contractor_id bigint not null references public.contractors(id) on delete cascade,
  decision text not null check (decision in ('like','pass')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id, contractor_id)
);

alter table public.community_match_decisions enable row level security;

create index if not exists community_match_decisions_user_idx
  on public.community_match_decisions (workspace_id, user_id, updated_at desc);

create policy "community_match_decisions_select_own"
  on public.community_match_decisions for select
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = community_match_decisions.workspace_id
        and wm.user_id = auth.uid()
    )
  );

create policy "community_match_decisions_insert_own"
  on public.community_match_decisions for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = community_match_decisions.workspace_id
        and wm.user_id = auth.uid()
    )
    and exists (
      select 1 from public.contractors c
      where c.id = community_match_decisions.contractor_id
        and c.workspace_id = community_match_decisions.workspace_id
    )
  );

create policy "community_match_decisions_update_own"
  on public.community_match_decisions for update
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = community_match_decisions.workspace_id
        and wm.user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.contractors c
      where c.id = community_match_decisions.contractor_id
        and c.workspace_id = community_match_decisions.workspace_id
    )
  );

create policy "community_match_decisions_delete_own"
  on public.community_match_decisions for delete
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = community_match_decisions.workspace_id
        and wm.user_id = auth.uid()
    )
  );
