-- Post-launch hardening batch 1: preserve authorization semantics while
-- preventing per-row re-evaluation of auth helpers in two existing RLS policies.
--
-- Production is intentionally untouched by this migration until the branch is
-- reviewed, certified, and explicitly approved for promotion.

begin;

-- causal.leads_state: same workspace_id = JWT workspace_id rule, but evaluate
-- auth.jwt() once per statement via scalar subquery.
drop policy if exists "state is workspace-scoped" on causal.leads_state;
create policy "state is workspace-scoped"
on causal.leads_state
for select
to authenticated
using (
  workspace_id = (((select auth.jwt()) ->> 'workspace_id'))::uuid
);

-- public.business_profile: same membership rule, but evaluate auth.uid() once
-- per statement rather than once per candidate row.
drop policy if exists "workspace members can view business profile" on public.business_profile;
create policy "workspace members can view business profile"
on public.business_profile
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = business_profile.workspace_id
      and wm.user_id = (select auth.uid())
  )
);

commit;
