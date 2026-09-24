import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const visual = readFileSync(new URL("../styles/signed-in-professional-system.css", import.meta.url), "utf8");

test("signing in from the public login page loads the same structural app styles as a direct workspace visit", () => {
  assert.match(app, /session\s*&&\s*\([\s\S]*?<AuthenticatedStyles\s*\/>/);
  assert.match(styles, /import "\.\/app-shell-entry";[\s\S]*import "\.\/authenticated-entry";/);
});

test("light dashboard panels and the body-portaled More dialog remain readable on iPhone", () => {
  const lightCanvas = visual.lastIndexOf("background:var(--hlc-app-surface)!important");
  const oldDarkPanel = visual.indexOf("background:rgba(16,25,36,.72)");
  assert.ok(lightCanvas > oldDarkPanel, "light panel paint must follow the retired dark fill");
  assert.match(visual, /body>\.hlc-mobile-command-sheet>\.hlc-drawer-v2-scroll\s*\{[^}]*background:#f8fbfe!important/s);
  assert.match(visual, /body>\.hlc-mobile-command-sheet\s*\{[^}]*font-family:[^}]*system-ui/s);
  assert.match(visual, /body>\.hlc-mobile-command-sheet \.hlc-mobile-more-quick>a\s*\{[^}]*background:#fff!important/s);
});
