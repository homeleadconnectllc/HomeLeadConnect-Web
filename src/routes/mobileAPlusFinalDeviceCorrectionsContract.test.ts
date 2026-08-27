import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/mobile-a-plus-final-device-corrections.css", "utf8");
const styleEntry = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const viewportAuthority = readFileSync("src/components/MobileViewportAuthority.tsx", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const communityStore = readFileSync("src/components/community/CommunityStore.tsx", "utf8");
const communityStoreStyles = readFileSync("src/styles/community-store.css", "utf8");
const nativeCalendarStyles = readFileSync("src/styles/hlc-native-calendar.css", "utf8");

test("final device correction authority mounts after Sprint 7", () => {
  const sprint7 = styleEntry.indexOf("./mobile-a-plus-sprint-7-integrated-accessibility.css");
  const correction = styleEntry.indexOf("./mobile-a-plus-final-device-corrections.css");
  assert.ok(sprint7 >= 0 && correction > sprint7);
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
  assert.match(styles, /body\.hlc-keyboard-open \.hlc-agent-dock:not\(\.is-open\)/);
  assert.match(styles, /body\.hlc-keyboard-open \.hlc-mobile-tabbar/);
  assert.match(viewportAuthority, /window\.visualViewport/);
  assert.match(viewportAuthority, /hlc-keyboard-open/);
});

test("FD-02 voice control gets an explicit mobile user gesture without faking audio", () => {
  assert.match(viewportAuthority, /\.hlc-ai-settings > summary/);
  assert.match(viewportAuthority, /input\[type="checkbox"\]/);
  assert.match(viewportAuthority, /enable\.click\(\)/);
  assert.match(styles, /Tap to enable/);
  assert.match(styles, /\.hlc-ai-settings:has\(input\[type="checkbox"\]:checked\)/);
});

test("FD-05 makes Messages task-first on compact screens", () => {
  assert.match(styles, /\.hlc-messages-header > div:first-child > p:last-child,[\s\S]*\.hlc-messages-summary[\s\S]*display: none/);
  assert.match(styles, /\.hlc-message-start-fields[\s\S]*gap: 9px/);
  assert.match(styles, /body\.hlc-keyboard-open \.hlc-message-composer/);
});

test("FD-15 pending Community checkout is status text, never a fake purchase control", () => {
  assert.match(communityStore, /hlc-community-product-checkout-status/);
  assert.match(communityStore, /role="status"/);
  assert.match(communityStore, /Checkout unavailable · storefront connection pending/);
  assert.doesNotMatch(communityStore, /<button[^>]*disabled[\s\S]*Checkout connection pending/);
  assert.match(communityStoreStyles, /\.hlc-community-product-checkout-status[\s\S]*border-top/);
  assert.doesNotMatch(communityStoreStyles, /\.hlc-community-product-checkout-status[\s\S]*cursor:\s*pointer/);
});

test("FD-16 mobile calendar keeps seven quiet columns without card-like day treatment", () => {
  assert.match(nativeCalendarStyles, /FD-16/);
  assert.match(nativeCalendarStyles, /grid-template-columns:\s*repeat\(7, minmax\(0, 1fr\)\)/);
  assert.match(nativeCalendarStyles, /\.hlc-calendar-mini-grid button,[\s\S]*min-height:\s*44px/);
  assert.match(nativeCalendarStyles, /\.hlc-calendar-mini-grid button\.has-items[\s\S]*box-shadow:\s*none/);
  assert.match(nativeCalendarStyles, /\.hlc-calendar-mini-grid button\.selected[\s\S]*box-shadow:\s*inset 0 0 0 1px/);
});

test("authenticated runtime mounts the viewport authority", () => {
  assert.match(app, /MobileViewportAuthority/);
  assert.match(app, /<MobileViewportAuthority \/>/);
});
