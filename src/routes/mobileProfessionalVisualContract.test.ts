import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const mobileProfessional = readFileSync("src/styles/mobile-professional-certification.css", "utf8");
const fiveStarFoundation = readFileSync("src/styles/five-star-mobile-foundation.css", "utf8");
const fiveStarRoutes = readFileSync("src/styles/five-star-mobile-routes.css", "utf8");
const physicalResources = readFileSync("src/styles/five-star-mobile-physical-resources.css", "utf8");
const operationalGuide = readFileSync("src/pages/dashboard/OperationalGuide.tsx", "utf8");
const legal = readFileSync("src/pages/Legal.tsx", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const commandSearch = readFileSync("src/components/search/GlobalCommandSearch.tsx", "utf8");

test("mobile professional certification layer loads last for signed-in workspaces", () => {
  assert.match(authenticatedEntry, /global-readability-certification\.css";\s*import "\.\/mobile-professional-certification\.css";/);
});

test("mobile operational pages use readable contrast and flatter record surfaces", () => {
  assert.match(mobileProfessional, /\.hlc-chat-history-item\.is-selected[\s\S]*background: #eaf2ff !important;/);
  assert.match(mobileProfessional, /\.hlc-chat-history-item :is\(strong, span, small\)[\s\S]*color: #0f172a !important;/);
  assert.match(mobileProfessional, /\.hlc-lead-open-hint[\s\S]*background: transparent !important;/);
  assert.match(mobileProfessional, /\.hlc-job-card-copy small[\s\S]*background: transparent !important;/);
  assert.match(mobileProfessional, /\.hlc-business-pulse-section[\s\S]*color: #f8fafc !important;/);
});

test("mobile agent and navigation occupy separate viewport lanes", () => {
  assert.match(mobileProfessional, /\.hlc-agent-dock:not\(\.is-open\)[\s\S]*bottom: calc\(92px \+ env\(safe-area-inset-bottom\)\) !important;/);
  assert.match(mobileProfessional, /\.hlc-agent-dock\.is-open[\s\S]*inset: 12px 12px calc\(82px \+ env\(safe-area-inset-bottom\)\) 12px !important;/);
  assert.match(mobileProfessional, /\.hlc-mobile-tabbar \{[\s\S]*z-index: 1600 !important;/);
});

test("Five-Star authority loads after the legacy Mobile A+ layer", () => {
  const legacy = authenticatedStyles.indexOf('./mobile-a-plus.css');
  const foundation = authenticatedStyles.indexOf('./five-star-mobile-foundation.css');
  const routes = authenticatedStyles.indexOf('./five-star-mobile-routes.css');
  const physical = authenticatedStyles.indexOf('./five-star-mobile-physical-qa.css');
  const physicalResource = authenticatedStyles.indexOf('./five-star-mobile-physical-resources.css');
  assert.ok(legacy >= 0);
  assert.ok(foundation > legacy);
  assert.ok(routes > foundation);
  assert.ok(physical > routes);
  assert.ok(physicalResource > physical);
  assert.match(fiveStarFoundation, /--hlc-five-star-rail:\s*18px/);
  assert.match(fiveStarFoundation, /padding-bottom: calc\(var\(--hlc-five-star-nav-height\) \+ env\(safe-area-inset-bottom\) \+ 36px\) !important/);
  assert.match(fiveStarRoutes, /\.hlc-lead-row[\s\S]*border-bottom: 1px solid rgba\(148, 180, 219, \.16\) !important/);
});

test("More owns first-class Search alerts profile and settings without fixed Search geometry", () => {
  assert.match(navbar, /hlc-mobile-command-search-trigger/);
  assert.match(navbar, /hlc-mobile-more-quick/);
  assert.match(navbar, />Notifications</);
  assert.match(navbar, />My profile</);
  assert.match(navbar, />Settings</);
  assert.match(navbar, /dispatchEvent\(new Event\(OPEN_HLC_COMMAND_SEARCH\)\)/);
  assert.doesNotMatch(commandSearch, /querySelector<HTMLElement>\("\.hlc-mobile-portal-scroll"\)/);
  assert.doesNotMatch(commandSearch, /createPortal/);
  assert.doesNotMatch(fiveStarFoundation, /\.hlc-mobile-command-search-trigger \{[\s\S]{0,320}position:\s*fixed/);
});

test("Five-Star contextual agent reserves one circular mobile lane and one open sheet", () => {
  assert.match(fiveStarFoundation, /\.hlc-agent-dock:not\(\.is-open\)[\s\S]*width: 60px !important/);
  assert.match(fiveStarFoundation, /\.hlc-agent-dock:not\(\.is-open\) \.hlc-agent-dock-trigger[\s\S]*border-radius: 50% !important/);
  assert.match(fiveStarFoundation, /\.hlc-agent-dock\.is-open[\s\S]*height: min\(88dvh, 760px\) !important/);
  assert.match(fiveStarFoundation, /body\.hlc-agent-open \.hlc-mobile-tabbar[\s\S]*visibility: hidden/);
});

test("physical iPhone resource authority targets the exact Rules and Legal DOM", () => {
  assert.match(operationalGuide, /className="hlc-resources-workspace"/);
  assert.match(operationalGuide, /className="hlc-resources-header"/);
  assert.match(operationalGuide, /className="hlc-resources-summary"/);
  assert.match(operationalGuide, /className="hlc-resources-commandbar"/);
  assert.match(operationalGuide, /className="hlc-resource-row"/);
  assert.match(physicalResources, /\.hlc-signed-in-shell \.hlc-resources-header[\s\S]*min-height: 0 !important/);
  assert.match(physicalResources, /\.hlc-signed-in-shell \.hlc-resources-summary[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\) !important/);
  assert.match(physicalResources, /\.hlc-signed-in-shell \.hlc-resources-commandbar[\s\S]*overflow-x: auto !important/);
  assert.match(physicalResources, /\.hlc-signed-in-shell \.hlc-resource-row[\s\S]*grid-template-columns: 30px minmax\(0, 1fr\) !important/);

  assert.match(legal, /className="hlc-legal-page"/);
  assert.match(legal, /className="hlc-legal-hero"/);
  assert.match(legal, /className="hlc-legal-card"/);
  assert.match(legal, /src="\/hlc-logo-transparent\.png"/);
  assert.doesNotMatch(legal, /hlc-logo-final\.png/);
  assert.match(physicalResources, /\.hlc-signed-in-shell \.hlc-legal-hero[\s\S]*min-height: 0 !important/);
  assert.match(physicalResources, /\.hlc-signed-in-shell \.hlc-legal-guide[\s\S]*display: none !important/);
  assert.match(physicalResources, /\.hlc-signed-in-shell \.hlc-legal-card[\s\S]*border-radius: 0 !important/);
  assert.match(physicalResources, /\.hlc-signed-in-shell \.hlc-legal-nav[\s\S]*overflow-x: auto !important/);
});
