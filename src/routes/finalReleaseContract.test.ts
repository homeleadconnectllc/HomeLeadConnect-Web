import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const home = readFileSync("src/pages/HomePage.tsx", "utf8");
const journey = readFileSync("src/pages/PublicJourney.tsx", "utf8");
const legal = readFileSync("src/pages/Legal.tsx", "utf8");
const reserved = readFileSync("src/pages/dashboard/ReservedCapability.tsx", "utf8");
const releaseGuard = readFileSync("src/styles/final-release-guard.css", "utf8");
const globalPremium = readFileSync("src/styles/global-premium-system.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");
const requestService = readFileSync("src/pages/RequestService.tsx", "utf8");
const professional = readFileSync("src/pages/ProfessionalApplication.tsx", "utf8");
const qaWorkflow = readFileSync(".github/workflows/netlify-e2e-qa-site.yml", "utf8");
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

test("anonymous intake surfaces retain bot-trap fields", () => {
  assert.match(requestService, /honeypot/);
  assert.match(requestService, /tabIndex=\{-1\}/);
  assert.match(professional, /honeypot/);
  assert.match(professional, /tabIndex=\{-1\}/);
});

test("isolated QA never inherits production authentication runtime", () => {
  assert.match(qaWorkflow, /VITE_SUPABASE_URL: https:\/\/agfwqnirspmptjiqrrtk\.supabase\.co/);
  assert.match(qaWorkflow, /VITE_AUTH_CAPTCHA_REQUIRED: "false"/);
  assert.doesNotMatch(qaWorkflow, /Load public runtime configuration from production Netlify site/);
  assert.match(turnstileConfig, /VITE_AUTH_CAPTCHA_REQUIRED/);
  assert.match(turnstileConfig, /import\.meta\.env\.PROD/);
  assert.match(supabaseRuntime, /host === "app\.homeleadconnect\.org"/);
  assert.doesNotMatch(supabaseRuntime, /endsWith\("\.netlify\.app"\)/);
});

test("iPhone installation metadata links the approved HLC icon", () => {
  assert.match(indexHtml, /rel="apple-touch-icon" href="\/hlc-logo-final\.png"/);
  assert.match(indexHtml, /rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(manifest, /"start_url": "\/app"/);
  assert.match(manifest, /"sizes": "1024x1024"/);
  assert.match(main, /register\("\/sw\.js", \{ updateViaCache: "none" \}\)/);
  assert.match(main, /registration\.update\(\)/);
});
