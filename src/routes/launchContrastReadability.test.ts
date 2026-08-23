import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedStyles = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const authenticatedStyleMount = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const contrast = readFileSync("src/styles/launch-contrast-readability.css", "utf8");
const liveDeviceAuthority = readFileSync("src/styles/launch-live-device-authority.css", "utf8");
const manualCommunicationsAuthority = readFileSync("src/styles/manual-communications-launch-authority.css", "utf8");
const mobileViewControls = readFileSync("src/components/MobileViewControls.tsx", "utf8");
const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");

test("launch contrast authority is mounted last in the canonical authenticated stylesheet chain", () => {
  const workspaceIndex = authenticatedStyles.indexOf("./application-workspace-ui.css");
  const contrastIndex = authenticatedStyles.indexOf("./launch-contrast-readability.css");
  assert.ok(workspaceIndex >= 0);
  assert.ok(contrastIndex > workspaceIndex);
});

test("live-device authority mounts after the canonical authenticated stylesheet chain", () => {
  const entryIndex = authenticatedStyleMount.indexOf("./authenticated-entry");
  const liveDeviceIndex = authenticatedStyleMount.indexOf("./launch-live-device-authority.css");
  assert.ok(entryIndex >= 0);
  assert.ok(liveDeviceIndex > entryIndex);
});

test("manual communications route authority mounts after the global live-device authority", () => {
  const liveDeviceIndex = authenticatedStyleMount.indexOf("./launch-live-device-authority.css");
  const manualIndex = authenticatedStyleMount.indexOf("./manual-communications-launch-authority.css");
  assert.ok(manualIndex > liveDeviceIndex);
  assert.match(appLayout, /function stableRouteClass/);
  assert.match(appLayout, /hlc-page-\$\{slug\}/);
});

test("signed-in workspace uses a deep navy canvas with explicit readable foregrounds", () => {
  assert.match(contrast, /--hlc-launch-canvas:\s*#071426/i);
  assert.match(contrast, /--hlc-launch-text:\s*#f8fafc/i);
  assert.match(contrast, /--hlc-launch-muted:\s*#c2cede/i);
  assert.match(contrast, /background:\s*var\(--hlc-launch-canvas\)\s*!important/i);
  assert.match(contrast, /color:\s*var\(--hlc-launch-text\)\s*!important/i);
});

test("interactive controls never rely on dark-on-dark or light-on-light copy", () => {
  assert.match(contrast, /background:\s*#112744\s*!important[\s\S]*color:\s*#f8fafc\s*!important/i);
  assert.match(contrast, /background:\s*#0a192c\s*!important[\s\S]*color:\s*var\(--hlc-launch-text\)\s*!important/i);
  assert.match(contrast, /outline:\s*3px solid #7dd3fc\s*!important/i);
  assert.match(liveDeviceAuthority, /background:\s*#ffffff\s*!important[\s\S]*color:\s*#1f2937\s*!important[\s\S]*-webkit-text-fill-color:\s*#1f2937\s*!important/i);
  assert.match(liveDeviceAuthority, /select option[\s\S]*background:\s*#ffffff\s*!important[\s\S]*#1f2937/i);
});

test("Manual Communications keeps dark panels and charcoal ink inside white controls", () => {
  assert.match(manualCommunicationsAuthority, /\.hlc-page-manual-communications[\s\S]*background:\s*#0d1f3a\s*!important/i);
  assert.match(manualCommunicationsAuthority, /:is\(input,select,textarea\)[\s\S]*background:\s*#ffffff\s*!important[\s\S]*#1f2937/i);
  assert.match(manualCommunicationsAuthority, /label[\s\S]*#93c5fd\s*!important/i);
  assert.match(manualCommunicationsAuthority, /section\[role="dialog"\][\s\S]*background:\s*#10243e\s*!important/i);
});

test("Leads mobile records keep identity, metadata, and actions readable", () => {
  assert.match(contrast, /\.hlc-lead-identity-copy\s*>\s*strong[\s\S]*var\(--hlc-launch-text\)/i);
  assert.match(contrast, /\.hlc-lead-contact-line[\s\S]*var\(--hlc-launch-muted\)/i);
  assert.match(contrast, /\.hlc-lead-actions a[\s\S]*background:\s*#112744\s*!important[\s\S]*#f8fafc/i);
  assert.match(contrast, /@media\s*\(max-width:\s*760px\)[\s\S]*\.hlc-lead-actions a[\s\S]*min-height:\s*44px\s*!important/i);
});

test("authenticated logo remains a readable uncropped HLC mark on live mobile routes", () => {
  assert.match(liveDeviceAuthority, /\.hlc-navbar-logo[\s\S]*width:\s*48px\s*!important/i);
  assert.match(liveDeviceAuthority, /\.hlc-navbar-logo img[\s\S]*object-fit:\s*contain\s*!important/i);
  assert.match(liveDeviceAuthority, /clip-path:\s*none\s*!important/i);
  assert.match(liveDeviceAuthority, /\.hlc-navbar-brand-copy h2[\s\S]*color:\s*#ffffff\s*!important/i);
});

test("physical phones boot into and activate the compact mobile shell", () => {
  assert.match(mobileViewControls, /return isCompactDevice\(\) \? "mobile" : readStoredViewMode\(\)/);
  assert.match(mobileViewControls, /classList\.toggle\("hlc-compact-device", compactDevice\)/);
  assert.match(liveDeviceAuthority, /max-device-width:\s*900px/i);
  assert.match(liveDeviceAuthority, /\.hlc-command-center[\s\S]*transform:\s*none\s*!important[\s\S]*zoom:\s*1\s*!important/i);
  assert.match(liveDeviceAuthority, /\.hlc-mobile-tabbar[\s\S]*position:\s*fixed\s*!important/i);
});
