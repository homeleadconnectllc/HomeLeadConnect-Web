import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync("src/routes/AppRouter.tsx","utf8");
const mainSource = readFileSync("src/main.tsx","utf8");
const publicNav = readFileSync("src/components/PublicSiteNav.tsx","utf8");
const visualFamily = readFileSync("src/styles/public-visual-family-20260919.css","utf8");
const indexHtml = readFileSync("index.html","utf8");
const runtimeAuthority = readFileSync("src/components/RuntimePhysicalAuthority.tsx","utf8");
const runtimeStructural = readFileSync("public/runtime-structural-safeguards-20260919.css","utf8");
const files = {
  publicInfo: readFileSync("src/pages/PublicInfo.tsx","utf8"),
  publicJourney: readFileSync("src/pages/PublicJourney.tsx","utf8"),
  pathway: readFileSync("src/pages/PathwayPage.tsx","utf8"),
  partner: readFileSync("src/pages/PartnerAccess.tsx","utf8"),
  professionalApplication: readFileSync("src/pages/ProfessionalApplication.tsx","utf8"),
  about: readFileSync("src/pages/About.tsx","utf8"),
  contact: readFileSync("src/pages/ContactPage.tsx","utf8"),
  request: readFileSync("src/pages/RequestService.tsx","utf8"),
  accessibility: readFileSync("src/pages/Accessibility.tsx","utf8"),
  legal: readFileSync("src/pages/Legal.tsx","utf8"),
  memorial: readFileSync("src/pages/Memorial.tsx","utf8"),
  authShell: readFileSync("src/components/auth/AuthShell.tsx","utf8"),
  login: readFileSync("src/pages/auth/Login.tsx","utf8"),
  appEntry: readFileSync("src/pages/AppEntry.tsx","utf8"),
};

const CURRENT_STYLE = 'import "../styles/public-visual-family-20260919.css";';
const retiredImports = [
  "public-premium.css",
  "public-board-pages-20260912.css",
  "public-utility-flat.css",
  "public-utility-imagery.css",
  "pathway-family-pages-20260916.css",
  "pathway-exact-render-authority-20260916.css",
  "public-owner-visual-authority-20260918.css",
  "public-pathway-owner-authority-20260918.css",
  "final-candidate-public-reconciliation.css",
  "legal.css",
  "public-owner-visual-final-20260918.css",
];

test("all owner-listed public routes stay in the current public visual family", () => {
  for (const route of [
    "/homeowners","/professionals","/professional-application","/contractors","/partners","/community",
    "/services","/how-it-works","/leadscope","/pricing","/trust","/demo","/about","/contact",
    "/request-service","/accessibility","/platform-disclosure","/privacy","/terms","/memorial",
    "/kendrell-memorial","/login","/register","/forgot-password","/reset-password","/app","/portal","/portal/accept",
  ]) assert.ok(router.includes(`path="${route}"`), `Missing public visual-family route ${route}`);
});

test("public page implementations use one current visual authority only", () => {
  for (const [name, source] of Object.entries(files)) {
    if (name !== "partner") assert.ok(source.includes(CURRENT_STYLE), `${name} must import the current public visual authority`);
    for (const retired of retiredImports) assert.ok(!source.includes(retired), `${name} still imports retired visual layer ${retired}`);
  }
  assert.ok(files.partner.includes("<PathwayPage pathway=\"partners\"/>"));
  assert.ok(files.request.includes(CURRENT_STYLE));
  assert.ok(!files.request.includes("<style>{"));
});

test("shared route components cover the full public family", () => {
  assert.ok(files.publicInfo.includes('page === "homeowners"'));
  assert.ok(files.publicInfo.includes('page === "community"'));
  assert.ok(files.publicJourney.includes('page==="professionals"'));
  assert.ok(files.pathway.includes('pathway === "residents"'));
  assert.ok(files.pathway.includes('pathway === "professionals"'));
  assert.ok(files.pathway.includes('pathway === "partners"'));
  assert.ok(files.pathway.includes('pathway === "community"'));
});

test("auth and app-entry routes join the visual family without the retired imperative public runtime", () => {
  assert.match(mainSource, /const isVisualFamilyEntryRoute =/);
  assert.match(mainSource, /login\|register\|forgot-password\|reset-password\|app\|portal\|portal\\\/accept/);
  assert.match(mainSource, /isPublicSiteRoute \|\| isVisualFamilyEntryRoute/);
  assert.match(files.authShell, /public-visual-family-20260919\.css/);
  assert.match(files.appEntry, /public-visual-family-20260919\.css/);
  assert.doesNotMatch(files.authShell, /public-auth-visual-closure-20260912\.css|public-header-logo-authority-20260915\.css/);
  assert.doesNotMatch(files.login, /front-door-auth-refinement-20260910\.css|front-door-login-outer-authority-20260911\.css/);
  assert.doesNotMatch(files.appEntry, /app-entry-frontdoor-20260913\.css/);
  assert.doesNotMatch(publicNav, /PUBLIC_VISUAL_RUNTIME_PATHS|publicSiteNavRuntime|useLayoutEffect|rgba\(2,10,22/);
});

test("runtime bootstrap cannot revive retired visual authority files", () => {
  for (const retired of [
    "public-home-app-reconciliation-20260907.css",
    "runtime-physical-authority-20260907.css",
    "runtime-portal-authority-20260907.css",
    "physical-component-root-authority-20260907.css",
    "frontdoor-login-visual-authority-20260910.css",
    "board-login-authority-20260912.css",
  ]) {
    assert.ok(!indexHtml.includes(retired), `index.html still loads retired runtime painter ${retired}`);
    assert.ok(!runtimeAuthority.includes(retired), `RuntimePhysicalAuthority can revive retired painter ${retired}`);
  }
  assert.match(indexHtml, /runtime-structural-safeguards-20260919\.css/);
  assert.match(runtimeAuthority, /runtime-structural-safeguards-20260919\.css/);
  assert.doesNotMatch(runtimeStructural, /background(?:-color|-image)?\s*:|\bcolor\s*:|box-shadow\s*:|border-radius\s*:|gradient\(/i);
});

test("canonical visual family rejects retired navy page shells", () => {
  assert.doesNotMatch(visualFamily, /#071a2d|#0b2845|#04111f|#03111f|#030914|#06182a/i);
});


test("About hero keeps the owner-approved readable heading scale", () => {
  assert.match(visualFamily,/data-public-page="about"[^\n]+hlc-public-hero>div h1\{/);
  assert.match(visualFamily,/font-size:clamp\(2\.4rem,4vw,4rem\)!important/);
});
