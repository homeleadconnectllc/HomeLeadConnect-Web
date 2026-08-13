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
  'src/lib/supabase.ts','src/lib/accessDestination.ts','src/routes/AppRouter.tsx','src/context/AuthContext.tsx',
  'src/pages/HostEntry.tsx','src/pages/HomePage.tsx','src/pages/AppEntry.tsx','src/pages/auth/Login.tsx',
  'src/pages/auth/ForgotPassword.tsx','src/pages/auth/ResetPassword.tsx','src/pages/RequestService.tsx',
  'src/api/publicIntake.ts','src/api/leads.ts','src/api/estimates.ts','src/api/jobs.ts','src/api/jobAssignments.ts',
  'src/api/appointments.ts','src/api/billing.ts','src/pages/dashboard/Settings.tsx','src/pages/dashboard/CallCenter.tsx','src/api/telephony.ts','src/pages/portal/HomeownerPortal.tsx',
  'src/pages/portal/ContractorPortal.tsx','src/ai/agents.ts','src/styles/launch-hardening.css','public/brand/avatars/Kendrell_Locked_HLC.png',
  'public/brand/avatars/Dion_Locked_HLC.png','public/brand/avatars/Diamond_Locked_HLC.png','public/_redirects','netlify.toml',
  'supabase/functions/stripe-checkout-session/index.ts',
]) requireFile(file);

requireText('.env.example', 'VITE_SUPABASE_URL=');
requireText('.env.example', 'VITE_SUPABASE_ANON_KEY=');
requireText('.env.example', 'VITE_BILLING_ENABLED=false');
requireText('.env.example', 'VITE_PORTAL_INVITATIONS_ENABLED=false');
requireText('public/_redirects', '/* /index.html 200');
requireText('netlify.toml', 'publish = "dist"');
requireText('src/pages/AppEntry.tsx', 'resolveUserDestination');
requireText('src/layouts/WorkspaceLayout.tsx', 'resolveUserDestination');
requireText('src/pages/HostEntry.tsx', 'app.homeleadconnect.org');
requireText('src/pages/HostEntry.tsx', '<HomePage />');
requireText('src/pages/HostEntry.tsx', '<AppEntry />');
requireText('src/routes/AppRouter.tsx', '<Route path="/" element={<HostEntry/>}/>');
requireText('src/routes/AppRouter.tsx', '<Route path="/app" element={<AppEntry/>}/>');
requireText('src/routes/AppRouter.tsx', '<Route path="/portal" element={<AppEntry/>}/>');
requireText('src/pages/auth/Login.tsx', 'navigate(requested || "/app"');
requireText('src/pages/auth/Login.tsx', '<Navigate to="/app" replace />');
requireText('src/pages/HomePage.tsx', 'to="/request-service"');
requireText('src/pages/HomePage.tsx', 'to="/app"');
requireText('src/pages/HomePage.tsx', 'to="/community"');
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
const scanRoots = ['src', '.env.example'];
function scan(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) { for (const name of fs.readdirSync(full)) scan(path.join(rel, name)); return; }
  if (!/\.(ts|tsx|js|jsx|mjs|env|example)$/.test(rel)) return;
  const content = fs.readFileSync(full, 'utf8');
  for (const pattern of forbidden) if (pattern.test(content)) failures.push(`Forbidden elevated-key reference found in public/client source: ${rel}`);
}
for (const rel of scanRoots) scan(rel);

console.log(`HLC launch static audit: ${checks.length} checks passed.`);
if (failures.length) {
  console.error('\nLaunch audit failed:');
  for (const failure of [...new Set(failures)]) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Launch static audit passed.');
