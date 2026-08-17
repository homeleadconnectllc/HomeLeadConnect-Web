-- Forward-only: Kendrell is Antoine's personal assistant by identity, while
-- approved management roles may use Kendrell's advisory command surface.
-- State-changing owner capabilities remain owner-only.
update public.ai_capability_registry
set required_role = 'member'
where capability_id = 'kendrell_advisory_chat'
  and agent_id = 'kendrell'
  and level = 'SUGGEST';
