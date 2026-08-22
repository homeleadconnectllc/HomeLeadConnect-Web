import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync("src/pages/HomePage.tsx", "utf8");
const journey = readFileSync("src/pages/PublicJourney.tsx", "utf8");
const legal = readFileSync("src/pages/Legal.tsx", "utf8");
const reserved = readFileSync("src/pages/dashboard/ReservedCapability.tsx", "utf8");
const releaseGuard = readFileSync("src/styles/final-release-guard.css", "utf8");
const globalPremium = readFileSync("src/styles/global-premium-system.css", "utf8");
const workspaceRouteCleanup = readFileSync("src/styles/workspace-route-cleanup.css", "utf8");
const desktopDashboardCertification = readFileSync("src/styles/desktop-dashboard-certification.css", "utf8");
const mobileDashboardCertification = readFileSync("src/styles/mobile-dashboard-certification.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8") + readFileSync("src/styles/app-shell-entry.ts", "utf8").replaceAll('import "./', 'import "./styles/');
const authenticatedStyles = readFileSync("src/styles/authenticated-entry.ts", "utf8");
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
  assert.match(reserved, /No verified service-alert data loaded/);
});

test("320px through 430px viewports are explicitly contained", () => {
  assert.match(releaseGuard, /min-width: 320px/);
  assert.match(releaseGuard, /max-width: 430px/);
  assert.match(releaseGuard, /overflow-x: clip/);
  assert.match(releaseGuard, /font-size: max\(16px, 1em\)/);
  assert.match(main, /\.\/styles\/final-release-guard\.css/);
});

test("global premium HLC design system stays mounted before final release guards", () => {
  assert.match(main, /\.\/styles\/global-premium-system\.css/);
  assert.ok(main.indexOf("./styles/global-premium-system.css") < main.indexOf("./styles/contrast-contract.css"));
  assert.match(globalPremium, /--hlc-premium-blue:\s*#2563eb/);
  assert.match(globalPremium, /--accent:\s*var\(--hlc-premium-blue\)/);
  assert.match(globalPremium, /:where\(\.hlc-route-content, \.hlc-auth-shell\).*table/);
  assert.match(globalPremium, /\.hlc-premium-empty/);
  assert.match(globalPremium, /\.hlc-status-pill/);
  assert.match(globalPremium, /prefers-reduced-motion/);
});

test("route cleanup is the final authenticated presentation layer", () => {
  const v4Index = authenticatedStyles.indexOf("./workspace-premium-v4.css");
  const cleanupIndex = authenticatedStyles.indexOf("./workspace-route-cleanup.css");
  assert.ok(v4Index >= 0);
  assert.ok(cleanupIndex > v4Index);
  assert.match(workspaceRouteCleanup, /\.hlc-jobs-page/);
  assert.match(workspaceRouteCleanup, /\.hlc-calendar-page/);
  assert.match(workspaceRouteCleanup, /\.hlc-messages-page/);
  assert.match(workspaceRouteCleanup, /main:not\(\[class\]\)/);
  assert.match(workspaceRouteCleanup, /\.hlc-command-center/);
  assert.match(workspaceRouteCleanup, /margin-bottom: calc\(172px \+ env\(safe-area-inset-bottom\)\) !important/);
});

test("desktop dashboard certification layer stays late in authenticated styles and keeps light metrics readable", () => {
  const readinessIndex = authenticatedStyles.indexOf("./frontend-readiness-contract.css");
  const certificationIndex = authenticatedStyles.indexOf("./desktop-dashboard-certification.css");
  assert.ok(readinessIndex >= 0);
  assert.ok(certificationIndex > readinessIndex);
  assert.match(desktopDashboardCertification, /grid-template-columns:\s*264px minmax\(0, 1fr\)/);
  assert.match(desktopDashboardCertification, /\.hlc-metric-card strong[\s\S]*color:\s*#0b1730 !important/);
  assert.match(desktopDashboardCertification, /\.hlc-metric-card > span:last-child[\s\S]*color:\s*#475569 !important/);
  assert.match(desktopDashboardCertification, /\.hlc-nav-menu a > small[\s\S]*display:\s*none !important/);
  assert.match(desktopDashboardCertification, /min-width:\s*900px\) and \(max-width:\s*1699px/);
  assert.match(desktopDashboardCertification, /\.hlc-route-content \{[\s\S]*padding-right:\s*0 !important/);
  assert.match(desktopDashboardCertification, /\.hlc-command-center \{[\s\S]*width:\s*100% !important/);
  assert.match(desktopDashboardCertification, /\.hlc-agent-dock:not\(\.is-open\)[\s\S]*bottom:\s*16px !important/);
  assert.match(desktopDashboardCertification, /min-width:\s*1700px[\s\S]*padding-right:\s*282px !important/);
});

test("mobile dashboard certification keeps the AI team readable and single-column", () => {
  const desktopIndex = authenticatedStyles.indexOf("./desktop-dashboard-certification.css");
  const mobileIndex = authenticatedStyles.indexOf("./mobile-dashboard-certification.css");
  assert.ok(desktopIndex >= 0);
  assert.ok(mobileIndex > desktopIndex);
  assert.match(mobileDashboardCertification, /max-width:\s*720px/);
  assert.match(mobileDashboardCertification, /\.hlc-agent-team-chip[\s\S]*display:\s*none !important/);
  assert.match(mobileDashboardCertification, /\.hlc-agent-grid[\s\S]*grid-template-columns:\s*1fr !important/);
  assert.match(mobileDashboardCertification, /\.hlc-agent-card[\s\S]*grid-template-columns:\s*1fr !important/);
  assert.match(mobileDashboardCertification, /\.hlc-agent-portrait[\s\S]*object-fit:\s*cover !important/);
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
  assert.doesNotMatch(leadsPage, /setCreateError\(errorMessage\(reason, "Unable to create lead\."\)\)/);
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

test("iPhone installation metadata links the approved optimized HLC icon", () => {
  assert.match(indexHtml, /rel="apple-touch-icon" href="\/hlc-touch-icon\.svg"/);
  assert.match(indexHtml, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(manifest, /"start_url": "\/app"/);
  assert.match(manifest, /"sizes": "1024x1024"/);
  assert.match(main, /register\("\/sw\.js", \{ updateViaCache: "none" \}\)/);
  assert.match(main, /registration\.update\(\)/);
});

test("installed iPhone navigation clears the status-bar safe area", () => {
  assert.match(indexHtml, /viewport-fit=cover/);
  assert.match(indexHtml, /apple-mobile-web-app-status-bar-style/);
  assert.match(releaseGuard, /\.hlc-navbar \{[\s\S]*min-height: calc\(70px \+ env\(safe-area-inset-top\)\)/);
  assert.match(releaseGuard, /padding: calc\(11px \+ env\(safe-area-inset-top\)\)/);
  assert.match(releaseGuard, /\.hlc-mobile-portal \{[\s\S]*inset: calc\(70px \+ env\(safe-area-inset-top\)\)/);
});
