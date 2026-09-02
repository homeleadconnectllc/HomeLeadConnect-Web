-- Launch-stabilization follow-up: keep the workspace-role helper off the public/anonymous execution surface.
-- SECURITY DEFINER callers execute this helper under the function owner; browser callers do not need direct access.

revoke all on function public.current_workspace_role() from public, anon, authenticated;
grant execute on function public.current_workspace_role() to service_role;
