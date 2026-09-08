-- Root repair: a company owner signup promises a 14-day HomeLead Connect trial,
-- but the canonical onboarding path previously created only workspace/profile/member
-- rows. Billing then saw no entitlement and immediately gated the new workspace.
--
-- This migration provisions a local trial entitlement when a NEW company workspace
-- is created. It does not create a Stripe subscription, does not collect payment,
-- does not reset trials for invitees/existing workspaces, and does not overwrite a
-- Stripe-backed entitlement. Stripe checkout/webhook remains the authority once a
-- user affirmatively enrolls in recurring billing.

create or replace function public.handle_new_user_onboarding()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_workspace_id uuid;
  v_company_name text;
  v_account_type text;
begin
  if exists (select 1 from public.profiles where user_id = new.id) then
    return new;
  end if;

  v_account_type := lower(coalesce(new.raw_user_meta_data->>'account_type', 'company_owner'));

  -- Workspace invitees join an existing workspace through accept_workspace_invitation.
  -- Never create a workspace or restart a trial for an invitee identity.
  if v_account_type = 'workspace_invitee' then
    return new;
  end if;

  v_company_name := nullif(btrim(coalesce(new.raw_user_meta_data->>'company_name', '')), '');

  insert into public.workspaces (name, created_by)
  values (coalesce(v_company_name, 'My Workspace'), new.id)
  returning id into v_workspace_id;

  insert into public.profiles (user_id, workspace_id, full_name, avatar_url, role)
  values (
    new.id,
    v_workspace_id,
    nullif(btrim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(btrim(coalesce(new.raw_user_meta_data->>'avatar_url', '')), ''),
    'owner'
  );

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_workspace_id, new.id, 'owner')
  on conflict (workspace_id, user_id) do update set role = 'owner';

  -- Signup trial: 14 days from the server-side workspace creation transaction.
  -- Stripe identifiers intentionally stay null until affirmative Stripe enrollment.
  insert into public.workspace_plan_status (
    workspace_id,
    plan_key,
    status,
    is_active,
    trial_end,
    current_period_end,
    grace_period_end,
    cancel_at_period_end,
    last_stripe_event_id,
    updated_at
  )
  values (
    v_workspace_id,
    'hlc_v1',
    'trialing',
    true,
    now() + interval '14 days',
    null,
    null,
    false,
    null,
    now()
  )
  on conflict (workspace_id) do nothing;

  return new;
end;
$function$;

-- Ensure the canonical auth signup trigger exists. Replacing the trigger is safe
-- and prevents drift where the function exists in migrations but auth.users is not
-- actually wired to it.
drop trigger if exists trg_handle_new_user_onboarding on auth.users;
create trigger trg_handle_new_user_onboarding
after insert on auth.users
for each row execute function public.handle_new_user_onboarding();

-- A trial is valid only while its authoritative server-side trial_end is in the future.
-- This closes the prior loophole where status='trialing' + is_active=true could remain
-- effective forever after introducing app-managed signup trials.
create or replace function public.hlc_workspace_has_paid_access(p_workspace_id uuid)
returns boolean
language sql
stable
set search_path to ''
as $function$
  select exists (
    select 1
    from public.workspace_plan_status s
    where s.workspace_id = p_workspace_id
      and s.plan_key = 'hlc_v1'
      and s.is_active = true
      and (
        lower(coalesce(s.status, '')) = 'active'
        or (
          lower(coalesce(s.status, '')) = 'trialing'
          and s.trial_end is not null
          and s.trial_end > now()
        )
        or (
          lower(coalesce(s.status, '')) = 'past_due'
          and s.grace_period_end is not null
          and s.grace_period_end > now()
        )
      )
  );
$function$;

create or replace function public.resolve_billing_workspace_access()
returns table(
  workspace_id uuid,
  plan_key text,
  status text,
  is_active boolean,
  trial_end timestamptz,
  current_period_end timestamptz,
  grace_period_end timestamptz,
  cancel_at_period_end boolean,
  recovered boolean
)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_selected_workspace uuid;
  v_selected_role text;
  v_candidate_workspace uuid;
  v_candidate_role text;
  v_candidate_count integer := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication is required.' using errcode = '42501';
  end if;

  select p.workspace_id
    into v_selected_workspace
  from public.profiles p
  where p.user_id = v_user_id
  limit 1;

  if v_selected_workspace is null then
    raise exception 'Your profile does not have a selected workspace.' using errcode = 'P0002';
  end if;

  select lower(coalesce(wm.role, ''))
    into v_selected_role
  from public.workspace_members wm
  where wm.user_id = v_user_id
    and wm.workspace_id = v_selected_workspace
  limit 1;

  if v_selected_role is null then
    raise exception 'Selected workspace membership is unavailable.' using errcode = '42501';
  end if;

  if public.hlc_workspace_has_paid_access(v_selected_workspace) then
    return query
    select
      wps.workspace_id,
      wps.plan_key,
      wps.status,
      public.hlc_workspace_has_paid_access(wps.workspace_id) as is_active,
      wps.trial_end,
      wps.current_period_end,
      wps.grace_period_end,
      wps.cancel_at_period_end,
      false
    from public.workspace_plan_status wps
    where wps.workspace_id = v_selected_workspace
    limit 1;
    return;
  end if;

  select count(*), min(wm.workspace_id), min(lower(coalesce(wm.role, '')))
    into v_candidate_count, v_candidate_workspace, v_candidate_role
  from public.workspace_members wm
  where wm.user_id = v_user_id
    and wm.workspace_id <> v_selected_workspace
    and public.hlc_workspace_has_paid_access(wm.workspace_id);

  if v_candidate_count = 1 and v_candidate_workspace is not null then
    update public.profiles
       set workspace_id = v_candidate_workspace,
           role = v_candidate_role
     where user_id = v_user_id;

    if not found then
      raise exception 'Your profile is unavailable.' using errcode = 'P0002';
    end if;

    return query
    select
      wps.workspace_id,
      wps.plan_key,
      wps.status,
      public.hlc_workspace_has_paid_access(wps.workspace_id) as is_active,
      wps.trial_end,
      wps.current_period_end,
      wps.grace_period_end,
      wps.cancel_at_period_end,
      true
    from public.workspace_plan_status wps
    where wps.workspace_id = v_candidate_workspace
    limit 1;
    return;
  end if;

  -- Return the selected workspace row, if one exists, but expose EFFECTIVE access
  -- rather than the stored historical is_active flag. That makes an expired trial
  -- fail closed in the frontend without relying on the browser clock.
  return query
  select
    wps.workspace_id,
    wps.plan_key,
    wps.status,
    public.hlc_workspace_has_paid_access(wps.workspace_id) as is_active,
    wps.trial_end,
    wps.current_period_end,
    wps.grace_period_end,
    wps.cancel_at_period_end,
    false
  from public.workspace_plan_status wps
  where wps.workspace_id = v_selected_workspace
  limit 1;
end;
$function$;
