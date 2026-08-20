import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entry = readFileSync(new URL("../styles/authenticated-entry.ts", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles/signed-in-professional-system.css", import.meta.url), "utf8");

test("signed-in professional system loads last in authenticated styles", () => {
  assert.match(entry, /import "\.\/signed-in-professional-system\.css";/);
  assert.ok(entry.trimEnd().endsWith('import "./signed-in-professional-system.css";'));
});

test("signed-in professional system keeps operational pages aligned and restrained", () => {
  assert.match(css, /\.hlc-leads-page/);
  assert.match(css, /\.hlc-jobs-page/);
  assert.match(css, /\.hlc-messages-page/);
  assert.match(css, /text-align: left/);
  assert.match(css, /border-radius: var\(--hlc-radius\)/);
  assert.match(css, /box-shadow: none/);
});

test("signed-in professional system protects readable brand surfaces", () => {
  assert.match(css, /\.hlc-command-hero/);
  assert.match(css, /#f8fafc/);
  assert.match(css, /#dbeafe/);
  assert.match(css, /\.hlc-chat-history-item\.is-selected/);
});

test("signed-in professional system keeps agent utility from covering the whole mobile app", () => {
  assert.match(css, /height: min\(68dvh, 620px\)/);
  assert.match(css, /bottom: calc\(84px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(css, /\.hlc-mobile-tabbar \{ z-index: 1600/);
});
