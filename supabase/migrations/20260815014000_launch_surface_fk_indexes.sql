create index if not exists ai_agent_action_audit_approved_by_idx on public.ai_agent_action_audit (approved_by);
create index if not exists ai_agent_action_audit_auth_user_id_idx on public.ai_agent_action_audit (auth_user_id);
create index if not exists ai_agent_action_audit_run_id_idx on public.ai_agent_action_audit (run_id);
create index if not exists ai_agent_handoffs_created_by_idx on public.ai_agent_handoffs (created_by);
create index if not exists ai_agent_handoffs_resolved_by_idx on public.ai_agent_handoffs (resolved_by) where resolved_by is not null;
create index if not exists ai_agent_runs_capability_id_idx on public.ai_agent_runs (capability_id);
create index if not exists ai_owner_attention_items_created_by_idx on public.ai_owner_attention_items (created_by);
create index if not exists automation_jobs_created_by_idx on public.automation_jobs (created_by);

create index if not exists community_posts_workspace_id_idx on public.community_posts (workspace_id);
create index if not exists community_posts_author_user_id_idx on public.community_posts (author_user_id);
create index if not exists community_referrals_workspace_id_idx on public.community_referrals (workspace_id);
create index if not exists community_referrals_referrer_user_id_idx on public.community_referrals (referrer_user_id);
create index if not exists community_reviews_workspace_id_idx on public.community_reviews (workspace_id);
create index if not exists community_reviews_author_user_id_idx on public.community_reviews (author_user_id);
create index if not exists community_reports_workspace_id_idx on public.community_reports (workspace_id);
create index if not exists community_reports_reporter_user_id_idx on public.community_reports (reporter_user_id);
create index if not exists community_reports_post_id_idx on public.community_reports (post_id) where post_id is not null;
create index if not exists community_reports_review_id_idx on public.community_reports (review_id) where review_id is not null;
create index if not exists community_reports_resolved_by_idx on public.community_reports (resolved_by) where resolved_by is not null;

create index if not exists conversation_participants_homeowner_portal_link_id_idx on public.conversation_participants (homeowner_portal_link_id) where homeowner_portal_link_id is not null;
create index if not exists conversation_participants_contractor_portal_link_id_idx on public.conversation_participants (contractor_portal_link_id) where contractor_portal_link_id is not null;
create index if not exists conversation_participants_workspace_id_idx on public.conversation_participants (workspace_id);
create index if not exists conversations_created_by_idx on public.conversations (created_by);
create index if not exists messages_sender_user_id_idx on public.messages (sender_user_id);
create index if not exists workspace_invitations_workspace_id_idx on public.workspace_invitations (workspace_id);
