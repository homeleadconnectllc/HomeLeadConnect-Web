import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const controls = readFileSync("src/components/MobileViewControls.tsx", "utf8");
const styles = readFileSync("src/styles/mobile-message-shell-controls.css", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

test("compact devices expose persistent Mobile/Desktop and Sign out side controls", () => {
  assert.match(app, /<MobileViewControls \/>/);
  assert.match(controls, /hlc-view-mode/);
  assert.match(controls, /width=device-width/);
  assert.match(controls, /width=1180/);
  assert.match(controls, />\s*Mobile\s*</);
  assert.match(controls, />\s*Desktop\s*</);
  assert.match(controls, />\s*Sign out\s*</);
  assert.match(styles, /\.hlc-mobile-side-controls \{/);
  assert.match(styles, /\.hlc-mobile-portal \.hlc-nav-logout \{[\s\S]*display: none !important;/);
});

test("Messages mobile layout preserves contrast and clears fixed navigation", () => {
  assert.match(main, /mobile-message-shell-controls\.css/);
  assert.match(styles, /\.hlc-messages-page \{[\s\S]*padding-bottom: calc\(178px \+ env\(safe-area-inset-bottom\)\);/);
  assert.match(styles, /\.hlc-chat-history-item strong \{[\s\S]*color: #0f172a !important;/);
  assert.match(styles, /\.hlc-message-bubble p \{[\s\S]*color: #0f172a !important;/);
  assert.match(styles, /\.hlc-messages-layout \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) !important;/);
});
