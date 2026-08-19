# HLC SECURITY DEFINER Audit

This audit records the launch classification for privileged RPCs exposed by the live Supabase project.

## Classification rule

A Supabase advisor warning is launch-blocking only when an exposed `SECURITY DEFINER` function lacks an intentional caller role, a fixed/controlled search path, and an internal authorization or public-boundary guard appropriate to the operation.

## Intentional anonymous boundaries

`submit_public_service_request` and `submit_professional_application` are intentionally executable by `anon`. Both run with locked search paths and enforce public-intake guards before persistence. They validate request identifiers and required form fields. Their advisor warnings are expected by design and remain documented rather than suppressed by breaking the public form path.

`record_hlc_analytics_event` is also intentionally executable by `anon` for first-party public-site telemetry. The live definition uses a controlled `pg_catalog, public` search path, validates session/event/path/metadata inputs, resolves anonymous events only through a configured `analytics_site_sources` hostname, returns `null` when no workspace can be resolved, and writes only to `analytics_events`. It does not grant anonymous read access to protected workspace records. Its advisor warning is expected by design.

## Guarded authenticated RPCs

The live audit found explicit authenticated-user and/or scoped ownership checks on the privileged core RPC surface, including:

- `accept_portal_invitation`
- `configure_business_phone_number`
- `configure_google_voice_manual_channel`
- `contractor_decide_assignment`
- `convert_estimate_to_job`
- `create_hlc_agent_handoff`
- `create_workspace_lead`
- `evaluate_communication_compliance`
- `get_contractor_portal_data`
- `get_homeowner_portal_data`
- `get_user_workspace_ids`
- `homeowner_decide_estimate`
- `log_manual_communication_activity`
- `post_internal_message`
- `queue_communication_transmission`
- `record_call_disposition`
- `record_communication_consent`
- `record_document_view`
- `register_document`
- `register_voice_note`
- `revoke_portal_invitation`
- `run_hlc_agent_capability`
- `run_hlc_automation`
- `start_portal_conversation`
- `suppress_communication_destination`
- `switch_current_workspace`

`log_google_voice_activity` is a thin privileged wrapper that delegates to `log_manual_communication_activity`; the delegated function performs the authenticated workspace authorization.

## Launch disposition

No current `SECURITY DEFINER` advisor warning has been classified as a proven unauthorized-access vulnerability from the inspected live function definitions. This does not waive runtime acceptance testing. Any newly introduced or materially changed privileged RPC must be re-audited before launch acceptance closes.
