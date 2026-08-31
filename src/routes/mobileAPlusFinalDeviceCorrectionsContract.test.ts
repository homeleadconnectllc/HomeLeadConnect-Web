import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/mobile-a-plus-final-device-corrections.css", "utf8");
const round2 = readFileSync("src/styles/mobile-a-plus-final-device-round-2.css", "utf8");
const round3 = readFileSync("src/styles/mobile-a-plus-final-device-round-3.css", "utf8");
const providerStyles = readFileSync("src/styles/provider-professional-profile.css", "utf8");
const softLaunchDashboard = readFileSync("src/styles/soft-launch-mobile-dashboard-authority.css", "utf8");
const styleEntry = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const viewportAuthority = readFileSync("src/components/MobileViewportAuthority.tsx", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const launchRouter = readFileSync("src/pages/dashboard/LaunchSurfaceRouter.tsx", "utf8");
const providerProfile = readFileSync("src/pages/dashboard/ProviderProfessionalProfile.tsx", "utf8");
const communityStore = readFileSync("src/components/community/CommunityStore.tsx", "utf8");
const communityStoreStyles = readFileSync("src/styles/community-store.css", "utf8");
const nativeCalendarStyles = readFileSync("src/styles/hlc-native-calendar.css", "utf8");

test("final device correction authorities remain ordered after Sprint 7", () => {
  const sprint7 = styleEntry.indexOf("./mobile-a-plus-sprint-7-integrated-accessibility.css");
  const correction = styleEntry.indexOf("./mobile-a-plus-final-device-corrections.css");
  const gateClosure = styleEntry.indexOf("./mobile-a-plus-final-device-gate-closure.css");
  const round2Entry = styleEntry.indexOf("./mobile-a-plus-final-device-round-2.css");
  const providerEntry = styleEntry.indexOf("./provider-professional-profile.css");
  const round3Entry = styleEntry.indexOf("./mobile-a-plus-final-device-round-3.css");
  assert.ok(sprint7 >= 0 && correction > sprint7);
  assert.ok(round2Entry > gateClosure && gateClosure > correction);
  assert.ok(round3Entry > providerEntry && providerEntry > round2Entry);
});

test("soft-launch dashboard authority loads last and protects greeting plus KPI columns", () => {
  const finalMobilePolish = styleEntry.indexOf("./final-mobile-polish.css");
  const softLaunchEntry = styleEntry.indexOf("./soft-launch-mobile-dashboard-authority.css");
  assert.ok(finalMobilePolish >= 0 && softLaunchEntry > finalMobilePolish);
  assert.match(softLaunchDashboard, /\.hlc-page-dashboard \.hlc-command-center[\s\S]*padding-top: max\(24px, calc\(env\(safe-area-inset-top\) \+ 18px\)\) !important/);
  assert.match(softLaunchDashboard, /\.hlc-command-copy h1[\s\S]*overflow: visible !important/);
  assert.match(softLaunchDashboard, /\.hlc-metric-card[\s\S]*grid-template-columns: 56px minmax\(54px, \.8fr\) minmax\(108px, 1\.2fr\) !important/);
  assert.match(softLaunchDashboard, /\.hlc-metric-card > strong[\s\S]*grid-column: 2 !important[\s\S]*text-align: center !important/);
  assert.match(softLaunchDashboard, /\.hlc-metric-card > span:last-child[\s\S]*grid-column: 3 !important[\s\S]*text-align: right !important/);
  assert.match(softLaunchDashboard, /html\.hlc-compact-device \.hlc-page-dashboard/);
});

test("FD-01 keeps the agent inside the real visual viewport with transcript-owned scrolling", () => {
  assert.match(styles, /--hlc-visual-viewport-height/);
  assert.match(styles, /\.hlc-agent-dock\.is-open[\s\S]*height: var\(--hlc-visual-viewport-height/);
  assert.match(styles, /\.hlc-ai-transcript[\s\S]*overflow-y: auto/);
  assert.match(styles, /\.hlc-ai-error[\s\S]*position: relative/);
  assert.match(styles, /@media \(max-width: 760px\) and \(max-height: 560px\)/);
});

test("FD-03 FD-04 FD-06 and FD-07 reserve mobile lanes and yield to the keyboard", () => {
  assert.match(styles, /\.hlc-route-content[\s\S]*padding-bottom: calc\(var\(--hlc-final-nav-height\)/);
  assert.match(styles, /\.hlc-smart-compose[\s\S]*display: none/);
  assert.match(viewportAuthority, /window\.visualViewport/);
  assert.match(viewportAuthority, /focusedEditable \|\| viewportKeyboardEvidence/);
  assert.match(viewportAuthority, /body\.classList\.add\("hlc-keyboard-open"\)/);
  assert.match(round3, /body\.hlc-keyboard-open #root \.hlc-mobile-tabbar/);
  assert.match(round3, /body\.hlc-keyboard-open #root \.hlc-signed-in-shell \.hlc-agent-dock:not\(\.is-open\)/);
});

test("FD-02 and FD-20 voice controls unlock audio and first verified fallback gets one replay attempt", () => {
  assert.match(viewportAuthority, /\.hlc-ai-settings > summary/);
  assert.match(viewportAuthority, /enable\.click\(\)/);
  assert.match(viewportAuthority, /maybeSpeakVerifiedFallback/);
  assert.match(viewportAuthority, /verified hlc fallback guidance/);
  assert.match(viewportAuthority, /fallbackReplayAttempted/);
  assert.match(viewportAuthority, /replay\.click\(\)/);
  assert.match(styles, /Tap to enable/);
  assert.match(styles, /\.hlc-ai-settings:has\(input\[type="checkbox"\]:checked\)/);
});

test("FD-05 makes Messages task-first on compact screens", () => {
  assert.match(styles, /\.hlc-messages-header > div:first-child > p:last-child,[\s\S]*\.hlc-messages-summary[\s\S]*display: none/);
  assert.match(styles, /\.hlc-message-start-fields[\s\S]*gap: 9px/);
  assert.match(styles, /body\.hlc-keyboard-open \.hlc-message-composer/);
});

test("FD-08 and FD-14 keep Community in one readable mobile column", () => {
  assert.match(round2, /FD-08 \/ FD-14/);
  assert.match(round2, /\.hlc-community-console,[\s\S]*grid-template-columns: minmax\(0, 1fr\) !important/);
  assert.match(round2, /\.hlc-community-row-copy :is\(h3, p\)[\s\S]*word-break: normal !important/);
});

test("FD-09 provider actions stay wide enough for deliberate touch actions", () => {
  assert.match(round2, /FD-09/);
  assert.match(round2, /\.hlc-s3-provider-actions[\s\S]*grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\) !important/);
  assert.match(round2, /\.hlc-s3-provider-more[\s\S]*grid-column: 1 \/ -1 !important/);
});

test("FD-10 agent quick actions preserve full labels and yield to the keyboard", () => {
  assert.match(round2, /FD-10/);
  assert.match(round2, /\.hlc-ai-quick-prompts[\s\S]*overflow-x: auto !important/);
  assert.match(round2, /body\.hlc-keyboard-open \.hlc-ai-quick-prompts[\s\S]*display: none !important/);
});

test("FD-13 and FD-14 documents use horizontal full-width record rows", () => {
  assert.match(round3, /\.hlc-document-row[\s\S]*grid-template-columns: minmax\(0, 1fr\) !important/);
  assert.match(round3, /\.hlc-document-row-meta[\s\S]*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(round3, /\.hlc-documents-workspace :is\([\s\S]*writing-mode: horizontal-tb !important/);
  assert.match(round3, /\.hlc-resources-commandbar[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
});

test("FD-15 pending Community checkout is status text, never a fake purchase control", () => {
  assert.match(communityStore, /hlc-community-product-checkout-status/);
  assert.match(communityStore, /role="status"/);
  assert.match(communityStore, /Checkout unavailable · storefront connection pending/);
  assert.doesNotMatch(communityStore, /<button[^>]*disabled[\s\S]*Checkout connection pending/);
  assert.match(communityStoreStyles, /\.hlc-community-product-checkout-status[\s\S]*border-top/);
});

test("FD-16 and FD-17 calendar uses one red work marker with today as the dominant date", () => {
  assert.match(nativeCalendarStyles, /grid-template-columns:\s*repeat\(7, minmax\(0, 1fr\)\)/);
  assert.match(round3, /button\.has-items::before[\s\S]*background: #ff4d5e !important/);
  assert.match(round3, /button::after[\s\S]*content: none !important/);
  assert.match(round3, /button\.today[\s\S]*font-size: 22px !important/);
  assert.match(round3, /button\.selected:not\(\.today\)[\s\S]*box-shadow: inset 0 0 0 1px/);
});

test("FD-18 calendar summaries remain compact horizontal phone information", () => {
  assert.match(round3, /\.hlc-calendar-kpis[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(round3, /\.hlc-calendar-kpis :is\(small, strong, span\)[\s\S]*writing-mode: horizontal-tb !important/);
});

test("FD-19 provider detail is a real professional identity profile using recorded evidence", () => {
  assert.match(launchRouter, /providerDetail[\s\S]*ProviderProfessionalProfile/);
  assert.match(providerProfile, /PROFESSIONAL PROFILE/);
  assert.match(providerProfile, /Occupation \/ trade/);
  assert.match(providerProfile, /license_number/);
  assert.match(providerProfile, /Insurance verification/);
  assert.match(providerProfile, /Skills & services/);
  assert.match(providerProfile, /Profile photo[\s\S]*Not added/);
  assert.match(providerProfile, /does not|Missing profile photo, insurance/i);
  assert.match(providerStyles, /\.hlc-provider-profile-avatar/);
  assert.match(providerStyles, /@media \(max-width: 760px\)/);
});

test("authenticated runtime mounts the viewport authority", () => {
  assert.match(app, /MobileViewportAuthority/);
  assert.match(app, /<MobileViewportAuthority \/>/);
});
