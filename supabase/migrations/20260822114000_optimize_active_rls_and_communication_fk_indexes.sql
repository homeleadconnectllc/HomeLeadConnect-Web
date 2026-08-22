-- Evidence-backed first performance batch for canonical production.
--
-- Scope is intentionally narrow:
-- 1. preserve existing authorization semantics while evaluating auth.uid() once
--    per statement for active RLS policies;
-- 2. add covering indexes only for genuinely unindexed foreign keys on active
--    call/communication surfaces.
--
-- This migration does not consolidate duplicate permissive policies and does
-- not remove any unused indexes.

-- call_sessions: preserve existing workspace-membership semantics.
drop policy if exists "workspace members can insert sessions" on public.call_sessions;
create policy "workspace members can insert sessions"
  on public.call_sessions
  for insert
  to authenticated
  with check (
    workspace_id in (
      select wm.workspace_id
      from public.workspace_members wm
      where wm.user_id = (select auth.uid())
    )
  );

drop policy if exists "workspace members can select sessions" on public.call_sessions;
create policy "workspace members can select sessions"
  on public.call_sessions
  for select
  to authenticated
  using (
    workspace_id in (
      select wm.workspace_id
      from public.workspace_members wm
      where wm.user_id = (select auth.uid())
    )
  );

drop policy if exists "workspace members can update sessions" on public.call_sessions;
create policy "workspace members can update sessions"
  on public.call_sessions
  for update
  to authenticated
  using (
    workspace_id in (
      select wm.workspace_id
      from public.workspace_members wm
      where wm.user_id = (select auth.uid())
    )
  )
  with check (
    workspace_id in (
      select wm.workspace_id
      from public.workspace_members wm
      where wm.user_id = (select auth.uid())
    )
  );

-- public_forms: preserve exact workspace-membership checks for all CRUD commands.
drop policy if exists "public_forms_select_workspace" on public.public_forms;
create policy "public_forms_select_workspace"
  on public.public_forms
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public_forms.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );

drop policy if exists "public_forms_insert_workspace" on public.public_forms;
create policy "public_forms_insert_workspace"
  on public.public_forms
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public_forms.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );

drop policy if exists "public_forms_update_workspace" on public.public_forms;
create policy "public_forms_update_workspace"
  on public.public_forms
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public_forms.workspace_id
        and wm.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public_forms.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );

drop policy if exists "public_forms_delete_workspace" on public.public_forms;
create policy "public_forms_delete_workspace"
  on public.public_forms
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = public_forms.workspace_id
        and wm.user_id = (select auth.uid())
    )
  );

-- subscriptions: authenticated users remain read-only and scoped to their
-- profile workspace; backend service-role write policies are untouched.
drop policy if exists "subscriptions_select_own_workspace" on public.subscriptions;
create policy "subscriptions_select_own_workspace"
  on public.subscriptions
  for select
  to authenticated
  using (
    workspace_id in (
      select p.workspace_id
      from public.profiles p
      where p.user_id = (select auth.uid())
    )
  );

-- Active call/communication foreign-key coverage verified missing in production.
create index if not exists business_phone_numbers_provider_connection_id_idx
  on public.business_phone_numbers (provider_connection_id);

create index if not exists call_sessions_business_phone_id_idx
  on public.call_sessions (business_phone_id);

create index if not exists call_sessions_compliance_check_id_idx
  on public.call_sessions (compliance_check_id);

create index if not exists call_sessions_conversation_id_idx
  on public.call_sessions (conversation_id);

create index if not exists call_sessions_requested_by_idx
  on public.call_sessions (requested_by);

create index if not exists communication_compliance_checks_actor_user_id_idx
  on public.communication_compliance_checks (actor_user_id);

create index if not exists communication_provider_events_call_session_id_idx
  on public.communication_provider_events (call_session_id);

create index if not exists communication_provider_events_transmission_id_idx
  on public.communication_provider_events (transmission_id);
