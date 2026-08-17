-- Forward-only: make advisory conversations visible in the existing audited agent history.
insert into public.ai_capability_registry
  (capability_id, agent_id, level, domain, required_role, readiness_requirement, approval_required, audit_required, idempotency_required, enabled)
values
  ('kendrell_advisory_chat', 'kendrell', 'SUGGEST', 'executive', 'owner', 'authorized_workspace_context', false, true, true, true),
  ('dion_advisory_chat', 'dion', 'SUGGEST', 'operations', 'member', 'authorized_workspace_context', false, true, true, true),
  ('diamond_advisory_chat', 'diamond', 'SUGGEST', 'customer_experience', 'member', 'authorized_workspace_context', false, true, true, true)
on conflict (capability_id) do update set
  level = excluded.level,
  domain = excluded.domain,
  required_role = excluded.required_role,
  readiness_requirement = excluded.readiness_requirement,
  audit_required = excluded.audit_required,
  enabled = true;

