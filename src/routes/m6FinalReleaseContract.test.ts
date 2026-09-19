import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const main = readFileSync("src/main.tsx","utf8");
const standalone = readFileSync("src/standalonePublicHome.ts","utf8");
const pricing = readFileSync("src/pages/PublicJourney.tsx","utf8");
const router = readFileSync("src/routes/AppRouter.tsx","utf8");
const portalBoundary = readFileSync("src/routes/PortalAccessBoundary.tsx","utf8");
const aiLauncher = readFileSync("src/components/agents/UniversalAITeamLauncher.tsx","utf8");

test("M6 release candidate preserves lightweight public root without parser seeding",()=>{
  assert.match(main,/standalonePublicHome/);
  assert.doesNotMatch(standalone,/\.innerHTML\s*=/);
  assert.match(standalone,/replaceChildren\(\)/);
  assert.match(standalone,/createElement/);
  assert.doesNotMatch(standalone,/react-dom\/client|react-router-dom/);
});

test("M6 release candidate preserves locked pricing and trial authority",()=>{
  assert.match(pricing,/14-day free business trial/);
  assert.match(pricing,/\$49\.99 per month after the trial/);
  assert.match(pricing,/14 days free · payment method required/);
});

test("M6 release candidate preserves canonical public app and portal routes",()=>{
  for(const route of ["/homeowners","/professionals","/partners","/community","/request-service","/professional-application","/login","/register","/homeowner-portal","/contractor-portal","/partner-portal","/leads","/jobs","/calendar","/messages","/follow-ups"]){
    assert.ok(router.includes(route),"Missing canonical route "+route);
  }
});

test("M6 release candidate preserves fail-closed portal role boundaries",()=>{
  assert.match(portalBoundary,/access\.homeowner/);
  assert.match(portalBoundary,/access\.contractor/);
  assert.match(portalBoundary,/access\.partner/);
});

test("M6 release candidate preserves one universal AI Team launcher",()=>{
  assert.match(aiLauncher,/UniversalAITeamLauncher/);
  assert.match(aiLauncher,/Kendrell/);
  assert.match(aiLauncher,/Dion/);
  assert.match(aiLauncher,/Diamond/);
});

test("M6 homepage footer remains logo-free",()=>{
  const footerStart=standalone.indexOf('const footer = make("footer"');
  assert.ok(footerStart>=0);
  assert.doesNotMatch(standalone.slice(footerStart),/hlc-public-footer-master-logo|make\("img"/);
});


test("retired public-family legacy styling cannot re-enter live public routes", () => {
  const mainSource = readFileSync("src/main.tsx","utf8");
  assert.doesNotMatch(mainSource, /public-family-legacy-entry/);
  assert.match(mainSource, /const styleReady = isAppHost \? import\("\.\/styles\/app-shell-entry"\) : import\("\.\/index\.css"\)/);
  assert.equal(existsSync(path.join(process.cwd(), "src/styles/public-family-legacy-entry.ts")), false);
});
