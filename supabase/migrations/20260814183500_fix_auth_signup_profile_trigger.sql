-- Repair production sign-up after the profiles schema moved to user_id/workspace_id.
-- The legacy on_auth_user_created trigger still called handle_new_user(), which
-- attempted to insert profiles(id, email) and caused GoTrue /signup to return 500.
-- The newer trg_handle_new_user_onboarding trigger is the canonical onboarding path.

drop trigger if exists on_auth_user_created on auth.users;

comment on function public.handle_new_user() is
  'Legacy auth trigger function retained for migration compatibility only. The on_auth_user_created trigger was removed because profiles no longer has an email column; trg_handle_new_user_onboarding is the canonical signup onboarding trigger.';
