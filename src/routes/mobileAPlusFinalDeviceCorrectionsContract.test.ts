import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/mobile-a-plus-final-device-corrections.css", "utf8");
const styleEntry = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const viewportAuthority = readFileSync("src/components/MobileViewportAuthority.tsx", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const launchRouter = readFileSync("src/pages/dashboard/LaunchSurfaceRouter.tsx", "utf8");
const providerProfile = readFileSync("src/pages/dashboard/ProviderProfessionalProfile.tsx", "utf8");
const providerStyles = readFileSync("src/styles/provider-professional-profile.css", "utf8");
const communityStore = readFileSync("src/components/community/CommunityStore.tsx", "utf8");
const communityStoreStyles = readFileSync("src/styles/community-store.css", "utf8");
const nativeCalendarStyles = readFileSync("src/styles/hlc-native-calendar.css", "utf8");

test("final compact-device corrections load after the integrated accessibility layer", () => {
  const sprint7 = styleEntry.indexOf("./mobile-a-plus-sprint-7-integrated-accessibility.css");
  const correction = styleEntry.indexOf("./mobile-a-plus-final-device-corrections.css");
  assert.ok(sprint7 >= 0 && correction > sprint7);
  assert.doesNotMatch(styleEntry, /mobile-a-plus-final-device-round-2\.css/);
  assert.doesNotMatch(styleEntry, /mobile-a-plus-final-device-round-3\.css/);
  assert.doesNotMatch(styleEntry, /soft-launch-mobile-dashboard-authority\.css/);
});

test("final device layer owns viewport, navigation clearance and keyboard yielding only", () => {
  assert.match(styles, /--hlc-visual-viewport-height/);
  assert.match(styles, /--hlc-final-nav-height/);
  assert.match(styles, /\.hlc-route-content[\s\S]*padding-bottom:calc\(var\(--hlc-final-nav-height\)/);
  assert.match(styles, /body\.hlc-keyboard-open \.hlc-mobile-tabbar/);
  assert.match(styles, /\.hlc-agent-dock\.is-open[\s\S]*height:var\(--hlc-visual-viewport-height/);
  assert.match(styles, /\.hlc-ai-transcript[\s\S]*overflow-y:auto/);
});

test("runtime viewport authority remains mounted and keyboard-aware", () => {
  assert.match(viewportAuthority, /window\.visualViewport/);
  assert.match(viewportAuthority, /focusedEditable \|\| viewportKeyboardEvidence/);
  assert.match(viewportAuthority, /body\.classList\.add\("hlc-keyboard-open"\)/);
  assert.match(app, /MobileViewportAuthority/);
  assert.match(app, /<MobileViewportAuthority \/>/);
});

test("community checkout remains status text instead of a fake purchase control", () => {
  assert.match(communityStore, /hlc-community-product-checkout-status/);
  assert.match(communityStore, /role="status"/);
  assert.match(communityStore, /Checkout unavailable · storefront connection pending/);
  assert.doesNotMatch(communityStore, /<button[^>]*disabled[\s\S]*Checkout connection pending/);
  assert.match(communityStoreStyles, /\.hlc-community-product-checkout-status/);
});

test("calendar keeps a seven-column native grid", () => {
  assert.match(nativeCalendarStyles, /grid-template-columns:\s*repeat\(7, minmax\(0, 1fr\)\)/);
});

test("provider detail remains a real professional identity profile using recorded evidence", () => {
  assert.match(launchRouter, /providerDetail[\s\S]*ProviderProfessionalProfile/);
  assert.match(providerProfile, /PROFESSIONAL PROFILE/);
  assert.match(providerProfile, /Occupation \/ trade/);
  assert.match(providerProfile, /license_number/);
  assert.match(providerProfile, /Insurance verification/);
  assert.match(providerProfile, /Skills & services/);
  assert.match(providerStyles, /\.hlc-provider-profile-avatar/);
});
