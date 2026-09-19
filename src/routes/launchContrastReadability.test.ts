import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const mobileViewControls = readFileSync("src/components/MobileViewControls.tsx", "utf8");
const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");

test("retired global contrast and live-device paint stay disconnected", () => {
  assert.match(authenticatedEntry, /application-workspace-ui\.css/);
  assert.doesNotMatch(authenticatedEntry, /launch-contrast-readability\.css/);
  assert.doesNotMatch(authenticatedStyles, /launch-live-device-authority\.css/);
  assert.doesNotMatch(authenticatedStyles, /manual-communications-launch-authority\.css/);
});

test("route identity remains available for narrow route-owned styling", () => {
  assert.match(appLayout, /function stableRouteClass/);
  assert.match(appLayout, /hlc-page-\$\{slug\}/);
});

test("physical phones still activate the compact mobile shell through runtime behavior", () => {
  assert.match(mobileViewControls, /return isCompactDevice\(\) \? "mobile" : readStoredViewMode\(\)/);
  assert.match(mobileViewControls, /classList\.toggle\("hlc-compact-device", compactDevice\)/);
});
