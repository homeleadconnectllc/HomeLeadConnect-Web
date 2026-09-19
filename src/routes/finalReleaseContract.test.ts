import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync("src/pages/HomePage.tsx", "utf8");
const journey = readFileSync("src/pages/PublicJourney.tsx", "utf8");
const legal = readFileSync("src/pages/Legal.tsx", "utf8");
const reserved = readFileSync("src/pages/dashboard/ReservedCapability.tsx", "utf8");
const releaseGuard = readFileSync("src/styles/final-release-guard.css", "utf8");
const mobileShell = readFileSync("src/styles/authenticated-mobile-shell-authority.css", "utf8");
const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const appShellEntry = readFileSync("src/styles/app-shell-entry.ts", "utf8");
const requestService = readFileSync("src/pages/RequestService.tsx", "utf8");
const professional = readFileSync("src/pages/ProfessionalApplication.tsx", "utf8");
const leadsPage = readFileSync("src/pages/dashboard/Leads.tsx", "utf8");
const unlimitedPlanMigration = readFileSync("supabase/migrations/20260819210000_fix_hlc_v1_unlimited_plan_limits.sql", "utf8");
const productionWorkflow = readFileSync(".github/workflows/cloudflare-production-verification.yml", "utf8");
const turnstileConfig = readFileSync("src/lib/turnstile.ts", "utf8");
const indexHtml = readFileSync("index.html", "utf8");
const supabaseRuntime = readFileSync("src/lib/supabase.ts", "utf8");
const manifest = readFileSync("public/manifest.webmanifest", "utf8");

for (const [name, source] of [["Home", home], ["Pricing", journey], ["Legal", legal]] as const) {
  test(`${name} contains no legacy $99 subscription copy`, () => {
    assert.doesNotMatch(source, /\$99(?:\.00)?\b/);
  });
}

test("public subscription surfaces use the canonical $49.99 launch price", () => {
  assert.match(home, /\$49\.99\/month/);
  assert.match(journey, /\$49\.99 per month/);
  assert.match(legal, /\$49\.99 USD/);
});

test("preview surfaces use the release status lexicon", () => {
  assert.match(reserved, /PREVIEW TERMINAL/);
  assert.match(reserved, /No verified approval data loaded/);
  assert.match(reserved, /Operational integration required/);
});

test("release guard is structural containment only", () => {
  assert.match(releaseGuard, /overflow-x:clip/);
  assert.match(releaseGuard, /box-sizing:border-box/);
  assert.match(releaseGuard, /font-size:max\(16px,1em\)/);
  assert.match(appShellEntry, /final-release-guard\.css/);
  assert.doesNotMatch(releaseGuard, /background:|border-radius:|box-shadow:|\.hlc-mobile-portal\s*\{/);
});

test("retired premium and certification themes stay disconnected", () => {
  for (const retired of [
    "global-premium-system.css",
    "workspace-premium-v4.css",
    "desktop-dashboard-certification.css",
    "mobile-dashboard-certification.css",
    "global-readability-certification.css",
  ]) {
    assert.ok(!authenticatedEntry.includes(retired));
    assert.ok(!appShellEntry.includes(retired));
  }
});

test("installed iPhone navigation safe-area behavior is owned by the mobile shell", () => {
  assert.match(indexHtml, /viewport-fit=cover/);
  assert.match(indexHtml, /apple-mobile-web-app-status-bar-style/);
  assert.match(mobileShell, /\.hlc-signed-in-shell > \.hlc-navbar/);
  assert.match(mobileShell, /max-height:\s*76px !important/);
  assert.match(mobileShell, /env\(safe-area-inset-right\)/);
  assert.match(mobileShell, /env\(safe-area-inset-left\)/);
});

test("anonymous intake surfaces retain bot-trap fields", () => {
  assert.match(requestService, /honeypot/);
  assert.match(requestService, /tabIndex=\{-1\}/);
  assert.match(professional, /honeypot/);
  assert.match(professional, /tabIndex=\{-1\}/);
});

test("HLC V1 zero limits remain unlimited rather than zero-capacity", () => {
  assert.match(unlimitedPlanMigration, /if v_limit = 0 then[\s\S]*return true/i);
  assert.match(unlimitedPlanMigration, /when wps\.lead_limit = 0 then false/i);
  assert.match(unlimitedPlanMigration, /when wps\.pipeline_limit = 0 then false/i);
  assert.match(leadsPage, /Your workspace has reached its lead limit\. Review your subscription or contact support/);
});

test("production authentication runtime is Cloudflare-bound and fail-closed", () => {
  assert.match(productionWorkflow, /https:\/\/app\.homeleadconnect\.org/);
  assert.match(productionWorkflow, /https:\/\/homeleadconnect-web\.pages\.dev/);
  assert.doesNotMatch(productionWorkflow, /NETLIFY_AUTH_TOKEN|api\.netlify\.com/);
  assert.match(turnstileConfig, /VITE_AUTH_CAPTCHA_REQUIRED/);
  assert.match(turnstileConfig, /import\.meta\.env\.PROD/);
  assert.match(supabaseRuntime, /host === "app\.homeleadconnect\.org"/);
  assert.doesNotMatch(supabaseRuntime, /endsWith\("\.netlify\.app"\)/);
});

test("iPhone installation metadata links the canonical transparent HLC icon", () => {
  assert.match(indexHtml, /rel="apple-touch-icon" href="\/hlc-logo-transparent\.png"/);
  assert.match(indexHtml, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(manifest, /"start_url": "\/app"/);
  assert.match(manifest, /"src": "\/hlc-logo-transparent\.png"/);
  assert.match(manifest, /"sizes": "1024x1024"/);
  assert.match(manifest, /"type": "image\/png"/);
});
