import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const startHere = readFileSync("src/pages/dashboard/StartHere.tsx", "utf8");
const operationalGuide = readFileSync("src/pages/dashboard/OperationalGuide.tsx", "utf8");
const communityHub = readFileSync("src/pages/dashboard/CommunityHub.tsx", "utf8");
const communityMatchDeck = readFileSync("src/pages/dashboard/CommunityMatchDeck.tsx", "utf8");
const eligibilityFit = readFileSync("src/pages/dashboard/EligibilityFit.tsx", "utf8");
const communityMatchingApi = readFileSync("src/api/communityMatching.ts", "utf8");
const communityMatchingMigration = readFileSync("supabase/migrations/20260817035500_community_match_decisions.sql", "utf8");
const communityMatchingGrantMigration = readFileSync("supabase/migrations/20260817041000_harden_community_match_decision_privileges.sql", "utf8");
const publicInfo = readFileSync("src/pages/PublicInfo.tsx", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8");
const responsiveContract = readFileSync("src/styles/responsive-page-contract.css", "utf8");
const legacyDeviceCompat = readFileSync("src/styles/legacy-device-compat.css", "utf8");
const finalReleaseGuard = readFileSync("src/styles/final-release-guard.css", "utf8");
const publicCopy = ["src/pages/HomePage.tsx", "src/pages/PublicInfo.tsx", "src/pages/ContactPage.tsx", "src/pages/Legal.tsx"]
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
const pageMap = readFileSync("src/config/pageMap.ts", "utf8");

const definedRoutes = new Set([...router.matchAll(/path="([^"]+)"/g)].map((match) => match[1]));

test("every launch navigation link resolves to a declared route", () => {
  const navigation = `${navbar}\n${footer}`;
  const targets = [...navigation.matchAll(/to="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(targets.length > 0);
  for (const target of targets) assert.ok(definedRoutes.has(target), `Missing route for navigation target ${target}`);
});

test("canonical protected AI routes remain declared once", () => {
  for (const route of ["/hq", "/operations", "/customer-experience"]) {
    assert.equal([...router.matchAll(new RegExp(`path="${route}"`, "g"))].length, 1);
  }
});

test("canonical golden workflow route remains declared once", () => {
  assert.equal([...router.matchAll(/path="\/workflow"/g)].length, 1);
});

test("shared HLC automation control plane remains declared once", () => {
  assert.equal([...router.matchAll(/path="\/automations"/g)].length, 1);
});

test("company rollout operating guides remain declared and actionable", () => {
  for (const route of ["/start-here", "/help", "/tutorials", "/rules"]) {
    assert.equal([...router.matchAll(new RegExp(`path="${route}"`, "g"))].length, 1, route);
  }
  assert.match(router, /path="\/start-here" element=\{<StartHere\s*\/>\}/);
  assert.match(router, /path="\/help" element=\{<OperationalGuide page="help"\s*\/>\}/);
  assert.match(router, /path="\/tutorials" element=\{<OperationalGuide page="tutorials"\s*\/>\}/);
  assert.match(router, /path="\/rules" element=\{<OperationalGuide page="rules"\s*\/>\}/);
  assert.match(startHere, /First-day checklist/);
  assert.match(startHere, /Support and escalation/);
  assert.match(operationalGuide, /Cannot sign in/);
  assert.match(operationalGuide, /Company owner/);
  assert.match(operationalGuide, /Incident response/);
});

test("responsive page contract is followed by HLC brand lock, compatibility fallbacks and the final narrow-mobile release guard", () => {
  const importLines = [...mainEntry.matchAll(/import "\.\/styles\/([^"]+\.css)";/g)].map((match) => match[1]);
  assert.equal(importLines.at(-4), "responsive-page-contract.css");
  assert.equal(importLines.at(-3), "hlc-brand-lock.css");
  assert.equal(importLines.at(-2), "legacy-device-compat.css");
  assert.equal(importLines.at(-1), "final-release-guard.css");
  assert.match(responsiveContract, /\.hlc-route-content > main/);
  assert.match(responsiveContract, /margin-inline: auto !important/);
  assert.match(responsiveContract, /--hlc-page-max: 1440px/);
  assert.match(responsiveContract, /@media \(min-width: 1600px\)/);
  assert.match(responsiveContract, /@media \(max-width: 1024px\)/);
  assert.match(responsiveContract, /@media \(max-width: 700px\)/);
  assert.match(responsiveContract, /@media \(max-width: 390px\)/);
  assert.match(responsiveContract, /Provider coordinate map/);
  assert.match(responsiveContract, /:has\(table\)/);
  assert.match(legacyDeviceCompat, /@media \(max-width: 360px\)/);
  assert.match(legacyDeviceCompat, /@media \(min-width: 701px\) and \(max-width: 1280px\)/);
  assert.match(legacyDeviceCompat, /@media \(forced-colors: active\)/);
  assert.match(legacyDeviceCompat, /@media \(-ms-high-contrast: active\)/);
  assert.match(legacyDeviceCompat, /@supports \(height: 1dvh\)/);
  assert.match(finalReleaseGuard, /min-width: 320px/);
  assert.match(finalReleaseGuard, /max-width: 430px/);
  assert.match(finalReleaseGuard, /overflow-x: clip/);
});

test("Community is a unified public and authenticated Network front door", () => {
  assert.match(router, /path="\/community-hub" element=\{<CommunityHub\s*\/>\}/);
  for (const label of ["Provider Directory", "Provider Map", "Community Matching", "Eligibility & Fit", "Service Areas", "Availability", "Saved Providers", "Discussions", "Groups", "Events & Updates", "Completion-linked Reviews", "Referrals", "Rules & Safety"]) {
    assert.match(communityHub, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const route of ["/providers", "/map", "/matching", "/network/service-areas", "/network/availability", "/network/saved", "/community/discussions", "/community/reviews", "/community/referrals", "/community/events", "/community-hub"]) {
    assert.match(publicInfo, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(publicInfo, /not operational Pennsylvania V1 services yet/);
});

test("Community Matching is the swipe discovery experience while operational fit stays separate", () => {
  assert.match(router, /path="\/matching" element=\{<CommunityMatchDeck\s*\/>\}/);
  assert.match(router, /path="\/network\/eligibility" element=\{<EligibilityFit\s*\/>\}/);
  assert.match(router, /path="\/homeowner-portal\/matches" element=\{<EligibilityFit\s*\/>\}/);
  assert.match(communityMatchDeck, /Swipe right or tap Like/);
  assert.match(communityMatchDeck, /Swipe left or tap Pass/);
  assert.match(communityMatchDeck, /hlc-match-card-active/);
  assert.match(communityMatchDeck, /setCommunityMatchDecision\(providerId, "like"\)/);
  assert.match(communityMatchDeck, /setCommunityMatchDecision\(providerId, "pass"\)/);
  assert.match(eligibilityFit, /Eligibility &amp; Fit/);
  assert.match(eligibilityFit, /separate from the Community swipe experience/);
  assert.match(communityMatchingApi, /community_match_decisions/);
  assert.match(communityMatchingMigration, /enable row level security/i);
  assert.match(communityMatchingMigration, /decision in \('like','pass'\)/);
  assert.match(communityMatchingMigration, /workspace_members/);
  assert.match(communityMatchingGrantMigration, /revoke all privileges.*from anon/i);
  assert.match(communityMatchingGrantMigration, /grant select, insert, update, delete.*authenticated/i);
});

test("canonical page map contains every top-level HLC experience", () => {
  for (const area of ["Public Website", "Homeowners & Renters", "Professionals", "Network & Map", "Community", "HQ", "Shared System"]) {
    assert.match(pageMap, new RegExp(area.replace(/[&]/g, "&")));
  }
});

test("previously reserved page-map destinations now resolve inside the app", () => {
  for (const route of ["/accessibility", "/homeowner-portal/profile", "/homeowner-portal/properties", "/homeowner-portal/requests", "/homeowner-portal/matches", "/homeowner-portal/appointments", "/homeowner-portal/jobs", "/homeowner-portal/documents", "/contractor-portal/profile", "/contractor-portal/team", "/contractor-portal/services", "/contractor-portal/documents", "/analytics", "/activity", "/network/map", "/network/service-areas", "/providers/:providerId", "/network/availability", "/network/eligibility", "/network/saved", "/community/groups", "/hq/approvals", "/hq/system-health"]) {
    assert.equal([...router.matchAll(new RegExp(`path="${route}"`, "g"))].length, 1, `Missing routed capability ${route}`);
  }
});

test("portal record subroutes use canonical data-backed views", () => {
  for (const route of ["/homeowner-portal/requests", "/homeowner-portal/appointments", "/homeowner-portal/jobs"]) {
    const declaration = router.match(new RegExp(`<Route path="${route}" element=\\{<([^ />]+)`));
    assert.equal(declaration?.[1], "HomeownerPortalSection", `${route} must use the homeowner portal RPC view`);
  }
  assert.match(router, /path="\/homeowner-portal\/documents" element=\{<HomeownerPortalDocuments\s*\/>\}/);
  assert.match(router, /path="\/homeowner-portal\/profile" element=\{<ResidentProfile\s*\/>\}/);
  assert.match(router, /path="\/homeowner-portal\/settings" element=\{<ResidentProfile\s*\/>\}/);
  assert.match(router, /path="\/contractor-portal\/profile" element=\{<ContractorProfile\s*\/>\}/);
  assert.match(router, /path="\/contractor-portal\/services" element=\{<ContractorPortalServices\s*\/>\}/);
  assert.match(router, /path="\/contractor-portal\/documents" element=\{<ContractorPortalDocuments\s*\/>\}/);
  const workspaceMatch = router.match(/<Route element=\{<WorkspaceLayout\s*\/>\}>/);
  assert.ok(workspaceMatch?.index !== undefined, "WorkspaceLayout route boundary must exist");
  const workspaceStart = workspaceMatch.index;
  for (const route of ["/homeowner-portal/requests", "/homeowner-portal/appointments", "/homeowner-portal/jobs", "/homeowner-portal/documents", "/homeowner-portal/profile", "/homeowner-portal/settings", "/contractor-portal/profile", "/contractor-portal/services", "/contractor-portal/documents"]) {
    assert.ok(router.indexOf(`path="${route}"`) < workspaceStart, `${route} must remain accessible to explicitly linked portal users without workspace membership`);
  }
});

test("implemented ecosystem destinations use data-backed surfaces", () => {
  const generic: Array<[string,string]> = [
    ["/network","network"], ["/profiles","profiles"], ["/providers","providers"],
    ["/community/discussions","discussions"], ["/community/reviews","reviews"], ["/community/referrals","referrals"],
    ["/community/events","events"], ["/community/moderation","moderation"], ["/community/groups","groups"], ["/network/service-areas","serviceAreas"],
    ["/network/availability","availability"], ["/network/saved","saved"], ["/contractor-portal/team","team"],
    ["/hq/approvals","approvals"], ["/hq/system-health","systemHealth"],
  ];
  for (const [route,page] of generic) {
    assert.match(router, new RegExp(`path="${route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}" element=\\{<LaunchSurface page="${page}"\\/>\\}`));
  }
  assert.match(router, /path="\/matching" element=\{<CommunityMatchDeck\s*\/>\}/);
  assert.match(router, /path="\/network\/eligibility" element=\{<EligibilityFit\s*\/>\}/);
  assert.match(router, /path="\/map" element=\{<ProviderMap\s*\/>\}/);
  assert.match(router, /path="\/network\/map" element=\{<ProviderMap\s*\/>\}/);
  assert.match(router, /path="\/activity" element=\{<WorkspaceActivity\s*\/>\}/);
  assert.match(router, /path="\/homeowner-portal\/properties" element=\{<PropertyIntelligence\s*\/>\}/);
  assert.match(router, /path="\/analytics" element=\{<Analytics\s*\/>\}/);
});

test("every canonical ecosystem destination has one declared route", () => {
  const routes = [
    "/network", "/map", "/network/map", "/profiles", "/providers", "/matching", "/community-hub",
    "/community/discussions", "/community/reviews", "/community/referrals",
    "/community/events", "/community/moderation", "/help", "/tutorials", "/rules",
    "/start-here", "/profile", "/settings/billing", "/activity",
  ];
  for (const route of routes) {
    assert.equal([...router.matchAll(new RegExp(`path="${route}"`, "g"))].length, 1, `Expected one route for ${route}`);
  }
});

test("public production copy uses the locked company contact identity", () => {
  assert.match(publicCopy, /HomeLead Connect LLC/);
  assert.match(publicCopy, /Antoine Washington/);
  assert.match(publicCopy, /homeleadconnect@gmail\.com/);
  assert.match(publicCopy, /717-288-1785/);
  assert.doesNotMatch(publicCopy, /info@homeleadconnect\.(?:org|com)/i);
});

test("launch navigation contains no placeholder href targets", () => {
  assert.doesNotMatch(`${navbar}\n${footer}`, /href="#"/);
});
