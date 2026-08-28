import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const controls = readFileSync("src/components/MobileViewControls.tsx", "utf8");
const styles = readFileSync("src/styles/mobile-message-shell-controls.css", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const appLayout = readFileSync("src/routes/AppLayout.tsx", "utf8");
const main = readFileSync("src/main.tsx", "utf8");
const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("compact devices expose Mobile/Desktop inside the More menu instead of a fixed overlay", () => {
  assert.match(app, /<MobileViewControls \/>/);
  assert.match(controls, /hlc-view-mode/);
  assert.match(controls, /width=device-width/);
  assert.match(controls, /width=1180/);
  assert.match(controls, /hlc-drawer-v2-scroll/);
  assert.match(controls, />\s*Mobile\s*</);
  assert.match(controls, />\s*Desktop\s*</);
  assert.doesNotMatch(controls, /hlc-mobile-side-controls/);
  assert.doesNotMatch(styles, /position:\s*fixed/);
});

test("global compact shell cannot mount the retired mobile work dock", () => {
  assert.doesNotMatch(appLayout, /MobileWorkDock/);
  assert.doesNotMatch(main, /mobile-work-dock\.css/);
});

test("Messages mobile layout preserves contrast and clears fixed navigation", () => {
  assert.match(authenticatedEntry, /mobile-message-shell-controls\.css/);
  assert.match(styles, /\.hlc-messages-page \{[\s\S]*padding-bottom: calc\(96px \+ env\(safe-area-inset-bottom\)\);/);
  assert.match(styles, /\.hlc-chat-history-item strong \{[\s\S]*color: #0f172a !important;/);
  assert.match(styles, /\.hlc-message-bubble p \{[\s\S]*color: #0f172a !important;/);
  assert.match(styles, /\.hlc-messages-layout \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) !important;/);
});
