import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const checks = [];

function requireFile(rel, { nonEmpty = true } = {}) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`Missing required file: ${rel}`);
    return;
  }
  if (nonEmpty && fs.statSync(full).size === 0) {
    failures.push(`Required file is empty: ${rel}`);
    return;
  }
  checks.push(`ok ${rel}`);
}

function requireText(rel, text) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`Missing required file: ${rel}`);
    return;
  }
  const content = fs.readFileSync(full, 'utf8');
  if (!content.includes(text)) failures.push(`${rel} is missing required text: ${text}`);
  else checks.push(`ok ${rel} contains ${text}`);
}

for (const file of [
  'src/lib/supabase.ts',
  'src/lib/accessDestination.ts',
  'src/routes/AppRouter.tsx',
  'src/context/AuthContext.tsx',
  'src/pages/AppEntry.tsx',
  'src/pages/auth/Login.tsx',
  'src/pages/auth/ForgotPassword.tsx',
  'src/pages/auth/ResetPassword.tsx',
  'src/pages/RequestService.tsx',
  'src/api/publicIntake.ts',
  'src/api/leads.ts',
  'src/api/estimates.ts',
  'src/api/jobs.ts',
  'src/api/jobAssignments.ts',
  'src/api/appointments.ts',
  'src/pages/dashboard/CallCenter.tsx',
  'src/api/telephony.ts',
  'src/pages/portal/HomeownerPortal.tsx',
  'src/pages/portal/ContractorPortal.tsx',
  'src/ai/agents.ts',
  'public/brand/avatars/Kendrell_Locked_HLC.png',
  'public/brand/avatars/Dion_Locked_HLC.png',
  'public/brand/avatars/Diamond_Locked_HLC.png',
  'public/_redirects',
  'netlify.toml',
]) requireFile(file);

requireText('.env.example', 'VITE_SUPABASE_URL=');
requireText('.env.example', 'VITE_SUPABASE_ANON_KEY=');
requireText('.env.example', 'VITE_BILLING_ENABLED=false');
requireText('.env.example', 'VITE_PORTAL_INVITATIONS_ENABLED=false');
requireText('public/_redirects', '/* /index.html 200');
requireText('netlify.toml', 'publish = "dist"');
requireText('src/pages/AppEntry.tsx', 'resolveUserDestination');
requireText('src/layouts/WorkspaceLayout.tsx', 'resolveUserDestination');
requireText('src/routes/AppRouter.tsx', '<Route path="/" element={<AppEntry/>}/>');
requireText('src/routes/AppRouter.tsx', '<Route path="/app" element={<AppEntry/>}/>');
requireText('src/routes/AppRouter.tsx', '<Route path="/portal" element={<AppEntry/>}/>');
requireText('src/pages/auth/Login.tsx', 'navigate(requested || "/"');
requireText('src/pages/auth/Login.tsx', 'https://homeleadconnect.org');

if (fs.existsSync(path.join(root, 'vercel.json'))) {
  failures.push('Stale vercel.json is present; Netlify is the canonical application host.');
}

const routerPath = path.join(root, 'src/routes/AppRouter.tsx');
if (fs.existsSync(routerPath)) {
  const router = fs.readFileSync(routerPath, 'utf8');
  const rootDeclarations = [...router.matchAll(/<Route path="\/" element=\{<([^/>\s]+)\s*\/>\}\/>/g)];
  if (rootDeclarations.length !== 1 || rootDeclarations[0]?.[1] !== 'AppEntry') {
    failures.push('The application must have exactly one root front door and it must resolve through AppEntry.');
  } else checks.push('ok single calibrated app root');
}

const forbidden = [/service_role/i, /sb_secret_[A-Za-z0-9_-]+/];
const scanRoots = ['src', '.env.example'];
function scan(rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(full)) scan(path.join(rel, name));
    return;
  }
  if (!/\.(ts|tsx|js|jsx|mjs|env|example)$/.test(rel)) return;
  const content = fs.readFileSync(full, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(content)) failures.push(`Forbidden elevated-key reference found in public/client source: ${rel}`);
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
