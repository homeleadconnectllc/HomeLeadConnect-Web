import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const checks = [];

function requireFile(rel, { nonEmpty = true } = {}) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; }
  if (nonEmpty && fs.statSync(full).size === 0) { failures.push(`Required file is empty: ${rel}`); return; }
  checks.push(`ok ${rel}`);
}

function requireText(rel, text) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; }
  const content = fs.readFileSync(full, 'utf8');
  if (!content.includes(text)) failures.push(`${rel} is missing required text: ${text}`);
  else checks.push(`ok ${rel} contains ${text}`);
}

function forbidText(rel, text) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { failures.push(`Missing required file: ${rel}`); return; }
  const content = fs.readFileSync(full, 'utf8');
  if (content.includes(text)) failures.push(`${rel} contains forbidden stale text: ${text}`);
  else checks.push(`ok ${rel} excludes ${text}`);
}

for (const file of [
  'src/lib/supabase.ts','src/lib/accessDestination.ts','src/lib/accessPolicy.ts','src/lib/accessPolicy.test.ts','src/routes/AppRouter.tsx','src/context/AuthContext.tsx',
  'src/pages/HostEntry.tsx','src/pages/HomePage.tsx','src/pages/AppEntry.tsx','src/pages/auth/Login.tsx',
  'src/pages/auth/ForgotPassword.tsx','src/pages/auth/ResetPassword.tsx','src/pages/RequestService.tsx',
  'src/pages/ProfessionalApplication.tsx','src/api/professionalApplications.ts',
  'src/api/publicIntake.ts','src/api/leads.ts','src/api/estimates.ts','src/api/jobs.ts','src/api/jobAssignments.ts',
  'src/api/appointments.ts','src/api/billing.ts','src/api/automations.ts','src/pages/dashboard/Automations.tsx','src/pages/dashboard/Workflow.tsx',
  'src/pages/dashboard/Settings.tsx','src/pages/dashboard/CallCenter.tsx','src/api/telephony.ts','src/pages/portal/HomeownerPortal.tsx',
  'src/pages/portal/HomeownerPortalDocuments.tsx','src/pages/portal/ResidentProfile.tsx','src/pages/portal/ContractorPortal.tsx',
  'src/pages/portal/ContractorProfile.tsx','src/pages/portal/ContractorPortalServices.tsx','src/pages/portal/ContractorPortalDocuments.tsx',
  'src/pages/dashboard/ProviderMap.tsx','src/pages/dashboard/WorkspaceActivity.tsx','src/components/agents/ContextualAgentDock.tsx','src/components/agents/AgentChatPanel.tsx',
  'src/ai/agents.ts','src/styles/launch-hardening.css','public/brand/avatars/Kendrell_Locked_HLC.png',
  'public/brand/avatars/Dion_Locked_HLC.png','public/brand/avatars/Diamond_Locked_HLC.png','public/_redirects','netlify.toml',
  'supabase/functions/stripe-checkout-session/index.ts','supabase/functions/hlc-agent-chat/index.ts',
  'supabase/migrations/20260814134500_harden_internal_automation_access.sql',
  'supabase/migrations/20260814135500_enable_hourly_workflow_automation.sql',
  'supabase/migrations/20260814141000_harden_legacy_security_definer_rpcs.sql',
  'supabase/migrations/20260814142000_align_management_rpc_roles.sql',
  'supabase/migrations/20260814143000_remove_browser_admin_table_privileges.sql',
  'supabase/migrations/20260814143500_remove_browser_view_admin_privileges.sql',
  'supabase/migrations/20260814144000_reconcile_voice_access_to_workspace_members.sql',
  'supabase/migrations/20260814144347_harden_community_review_workspace_linkage.sql',
  'supabase/migrations/20260814144749_provider_map_coordinates_foundation.sql',
  'supabase/migrations/20260814144914_secure_provider_map_coordinate_updates.sql',
  'supabase/migrations/20260814145407_portal_identity_and_provider_profile_types.sql',
  'supabase/migrations/20260814145501_harden_activity_log_as_append_only.sql',
  'supabase/migrations/20260814145520_linked_provider_profile_read.sql',
  'supabase/migrations/20260814150142_professional_portal_services_contract.sql',
  'supabase/migrations/20260814150206_fix_professional_portal_availability_upsert.sql',
  'supabase/migrations/20260814163950_professional_application_intake.sql',
]) requireFile(file);

requireText('.env.example', 'VITE_SUPABASE_URL=');
requireText('.env.example', 'VITE_SUPABASE_ANON_KEY=');
requireText('.env.example', 'VITE_BILLING_ENABLED=false');
requireText('.env.example', 'VITE_PORTAL_INVITATIONS_ENABLED=false');
requireText('public/_redirects', '/* /index.html 200');
requireText('netlify.toml', 'publish = "dist"');
requireText('src/pages/AppEntry.tsx', 'resolveUserDestination');
requireText('src/layouts/WorkspaceLayout.tsx', 'resolveUserDestination');
requireText('src/layouts/WorkspaceLayout.tsx', 'canAccessWorkspacePath');
requireText('src/layouts/WorkspaceLayout.tsx', 'Internal access not assigned');
requireText('src/components/Navbar.tsx', 'canAccessWorkspacePath');
requireText('src/lib/accessPolicy.ts', '"owner" | "manager" | "technician"');
requireText('src/lib/accessPolicy.ts', 'ownerOnlyPrefixes');
requireText('src/lib/accessPolicy.ts', 'managerPrefixes');
requireText('src/lib/accessPolicy.test.ts', 'customer and provider identity labels never unlock internal workspace routes');
requireText('src/lib/accessPolicy.test.ts', 'automation execution is management-only');
requireText('src/pages/dashboard/Automations.tsx', 'Safe deterministic runs');
requireText('src/api/automations.ts', 'run_hlc_automation');
requireText('supabase/migrations/20260814134500_harden_internal_automation_access.sql', "IN ('owner', 'manager')");
requireText('supabase/migrations/20260814134500_harden_internal_automation_access.sql', 'REVOKE ALL ON FUNCTION public.run_hlc_automation');
requireText('supabase/migrations/20260814135500_enable_hourly_workflow_automation.sql', 'run_hlc_scheduled_workflow_scan');
requireText('supabase/migrations/20260814135500_enable_hourly_workflow_automation.sql', "'hlc-workflow-automation-hourly'");
requireText('supabase/migrations/20260814135500_enable_hourly_workflow_automation.sql', "'7 * * * *'");
requireText('supabase/migrations/20260814135500_enable_hourly_workflow_automation.sql', 'REVOKE ALL ON FUNCTION public.run_hlc_scheduled_workflow_scan() FROM authenticated');
requireText('supabase/migrations/20260814141000_harden_legacy_security_definer_rpcs.sql', 'perform_dashboard_action');
requireText('supabase/migrations/20260814141000_harden_legacy_security_definer_rpcs.sql', "IN ('owner','manager','technician')");
requireText('supabase/migrations/20260814142000_align_management_rpc_roles.sql', "IN ('owner','manager')");
requireText('supabase/migrations/20260814142000_align_management_rpc_roles.sql', 'get_hlc_business_kpis');
requireText('supabase/migrations/20260814143000_remove_browser_admin_table_privileges.sql', 'TRUNCATE');
requireText('supabase/migrations/20260814143000_remove_browser_admin_table_privileges.sql', 'UPDATE(full_name, avatar_url, onboarding_completed, onboarding_step, updated_at)');
requireText('supabase/migrations/20260814143500_remove_browser_view_admin_privileges.sql', 'TRUNCATE');
requireText('supabase/migrations/20260814144000_reconcile_voice_access_to_workspace_members.sql', 'voice_audio_select_workspace_members');
requireText('supabase/migrations/20260814144000_reconcile_voice_access_to_workspace_members.sql', 'workspace_members');
requireText('supabase/migrations/20260814144347_harden_community_review_workspace_linkage.sql', 'j.workspace_id = community_reviews.workspace_id');
requireText('supabase/migrations/20260814144749_provider_map_coordinates_foundation.sql', 'latitude');
requireText('supabase/migrations/20260814144749_provider_map_coordinates_foundation.sql', 'longitude');
requireText('supabase/migrations/20260814144914_secure_provider_map_coordinate_updates.sql', 'owner');
requireText('supabase/migrations/20260814144914_secure_provider_map_coordinate_updates.sql', 'manager');
requireText('supabase/migrations/20260814145407_portal_identity_and_provider_profile_types.sql', 'provider_type');
requireText('supabase/migrations/20260814145501_harden_activity_log_as_append_only.sql', 'revoke update, delete on public.activity_log from authenticated');
requireText('supabase/migrations/20260814145501_harden_activity_log_as_append_only.sql', 'activity_log_delete_workspace');
requireText('supabase/migrations/20260814145520_linked_provider_profile_read.sql', 'contractor_portal_links');
requireText('supabase/migrations/20260814150142_professional_portal_services_contract.sql', 'provider_services');
requireText('supabase/migrations/20260814150142_professional_portal_services_contract.sql', 'provider_service_areas');
requireText('supabase/migrations/20260814150206_fix_professional_portal_availability_upsert.sql', 'contractor_id');
requireText('src/pages/HostEntry.tsx', 'app.homeleadconnect.org');
requireText('src/pages/HostEntry.tsx', '<HomePage />');
requireText('src/pages/HostEntry.tsx', '<AppEntry />');
requireText('src/routes/AppRouter.tsx', '<Route path="/" element={<HostEntry/>}/>');
requireText('src/routes/AppRouter.tsx', '<Route path="/app" element={<AppEntry/>}/>');
requireText('src/routes/AppRouter.tsx', '<Route path="/portal" element={<AppEntry/>}/>');
requireText('src/routes/AppRouter.tsx', '<Route path="/homeowner-portal/documents" element={<HomeownerPortalDocuments/>}/>');
requireText('src/routes/AppRouter.tsx', 'path="/homeowner-portal/profile"');
requireText('src/routes/AppRouter.tsx', 'path="/homeowner-portal/settings"');
requireText('src/routes/AppRouter.tsx', 'path="/contractor-portal/profile"');
requireText('src/routes/AppRouter.tsx', 'path="/contractor-portal/services"');
requireText('src/routes/AppRouter.tsx', 'path="/contractor-portal/documents"');
requireText('src/routes/AppRouter.tsx', 'path="/map"');
requireText('src/routes/AppRouter.tsx', 'path="/network/map"');
requireText('src/routes/AppRouter.tsx', 'path="/activity"');
requireText('src/pages/portal/HomeownerPortalDocuments.tsx', 'sharing_scope === "homeowner"');
requireText('src/pages/portal/HomeownerPortalDocuments.tsx', 'Only files explicitly shared with your resident portal are shown here.');
requireText('src/pages/dashboard/ProviderMap.tsx', 'latitude');
requireText('src/pages/dashboard/ProviderMap.tsx', 'longitude');
requireText('src/pages/dashboard/ProviderMap.tsx', 'not mapped');
requireText('src/pages/dashboard/WorkspaceActivity.tsx', 'activity');
requireText('src/components/agents/ContextualAgentDock.tsx', '#F59E0B');
requireText('src/components/agents/ContextualAgentDock.tsx', '#6366F1');
requireText('src/components/agents/ContextualAgentDock.tsx', '#10B981');
requireText('src/pages/auth/Login.tsx', 'navigate(requested || "/app"');
requireText('src/pages/auth/Login.tsx', '<Navigate to="/app" replace />');
requireText('src/pages/HomePage.tsx', 'to="/request-service"');
requireText('src/pages/HomePage.tsx', 'to="/app"');
requireText('src/pages/HomePage.tsx', 'to="/community"');
requireText('src/pages/ProfessionalApplication.tsx', 'submitProfessionalApplication');
requireText('src/api/professionalApplications.ts', 'submit_professional_application');
requireText('supabase/migrations/20260814163950_professional_application_intake.sql', 'enable row level security');
requireText('supabase/migrations/20260814163950_professional_application_intake.sql', 'security definer');
requireText('supabase/migrations/20260814163950_professional_application_intake.sql', 'revoke all on table public.professional_applications from public, anon, authenticated');
requireText('supabase/migrations/20260814163950_professional_application_intake.sql', "'professional-application'");
forbidText('src/pages/ProfessionalApplication.tsx', 'Status: MISSING');
forbidText('src/pages/dashboard/Workflow.tsx', 'status: "MISSING"');
forbidText('src/pages/Accessibility.tsx', 'UNPROVEN');
requireText('src/styles/launch-hardening.css', 'aside[aria-label$=" guidance"]');
requireText('src/styles/launch-hardening.css', 'width: 44px !important;');
requireText('src/styles/launch-hardening.css', 'bottom: calc(132px + env(safe-area-inset-bottom)) !important;');
requireText('src/api/billing.ts', 'getBillingOffer');
requireText('src/api/billing.ts', '.from("plans")');
requireText('src/pages/dashboard/Settings.tsx', 'formatBillingOffer');
requireText('supabase/functions/stripe-checkout-session/index.ts', 'Stripe billing does not match the published HLC plan.');
forbidText('src/pages/dashboard/Settings.tsx', '$99');

if (fs.existsSync(path.join(root, 'vercel.json'))) failures.push('Stale vercel.json is present; Netlify is the canonical application host.');

const routerPath = path.join(root, 'src/routes/AppRouter.tsx');
if (fs.existsSync(routerPath)) {
  const router = fs.readFileSync(routerPath, 'utf8');
  const roots = [...router.matchAll(/<Route path="\/" element=\{<([^/>\s]+)\s*\/>\}\/>/g)];
  if (roots.length !== 1 || roots[0]?.[1] !== 'HostEntry') failures.push('HLC must have exactly one host-aware root front door through HostEntry.');
  else checks.push('ok one host-aware HLC root');
  if ([...router.matchAll(/path="\/app"/g)].length !== 1) failures.push('HLC must expose exactly one authenticated /app entry.');
  else checks.push('ok one authenticated app entry');
}

const legacyHomeFiles = [
  'src/pages/HomePage.backup.tsx','src/pages/HomePage.before-dashboard-v2.tsx','src/pages/HomePage.before-dashboard.tsx',
  'src/pages/HomePage.before-final-polish.tsx','src/pages/HomePage.before-polish.tsx','src/pages/HomePage.before-product-preview.tsx',
  'src/pages/HomePage.stable-backup.tsx'
];
for (const rel of legacyHomeFiles) if (fs.existsSync(path.join(root, rel))) failures.push(`Legacy competing home-page source must be removed: ${rel}`);

const forbidden = [/service_role/i, /sb_secret_[A-Za-z0-9_-]+/];
const suspiciousControlPatterns = [
  { pattern: /href\s*=\s*["']#["']/g, label: 'placeholder href="#"' },
  { pattern: /javascript:void\s*\(\s*0\s*\)/gi, label: 'javascript:void(0)' },
  { pattern: /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*\{\s*\}\s*\}/g, label: 'empty click handler' },
  { pattern: /onClick\s*=\s*\{\s*function\s*\(\s*\)\s*\{\s*\}\s*\}/g, label: 'empty click function' },
];
const scanRoots = ['src', '.env.example'];
function scan(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) { for (const name of fs.readdirSync(full)) scan(path.join(rel, name)); return; }
  if (!/\.(ts|tsx|js|jsx|mjs|env|example)$/.test(rel)) return;
  const content = fs.readFileSync(full, 'utf8');
  for (const pattern of forbidden) if (pattern.test(content)) failures.push(`Forbidden elevated-key reference found in public/client source: ${rel}`);
  if (/\.(tsx|jsx)$/.test(rel)) {
    for (const { pattern, label } of suspiciousControlPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) failures.push(`Obvious inert control (${label}) found in ${rel}`);
    }
  }
}
for (const rel of scanRoots) scan(rel);

console.log(`HLC launch static audit: ${checks.length} checks passed.`);
if (failures.length) {
  console.error('\nLaunch audit failed:');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Launch static audit passed.');
