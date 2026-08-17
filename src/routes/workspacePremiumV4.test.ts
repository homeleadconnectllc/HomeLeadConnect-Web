import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const mainEntry = readFileSync("src/main.tsx", "utf8");
const workspaceV4 = readFileSync("src/styles/workspace-premium-v4.css", "utf8");

test("workspace v4 loads after final mobile and release guards", () => {
  assert.match(
    mainEntry,
    /final-release-guard\.css";\s*import "\.\/styles\/mobile-release-fix\.css";\s*import ['"]\.\/styles\/workspace-premium-v4\.css['"];/,
  );
});

test("workspace v4 stays scoped to the authenticated shell and preserves specialized pages", () => {
  assert.match(workspaceV4, /\.hlc-signed-in-shell/);
  assert.match(workspaceV4, /:not\(\.hlc-match-page\):not\(\.hlc-kendrell-dedication-page\)/);
});

test("workspace v4 keeps HLC brand colors and CRM density contracts", () => {
  assert.match(workspaceV4, /--hlc-v4-navy-900: #0d1b3d/);
  assert.match(workspaceV4, /--hlc-v4-blue: #1e5bff/);
  assert.match(workspaceV4, /\.hlc-lead-card/);
  assert.match(workspaceV4, /border-radius: 0 !important/);
  assert.match(workspaceV4, /font-size: 13px !important/);
});

test("workspace v4 reserves mobile space above fixed navigation and agent dock", () => {
  assert.match(workspaceV4, /margin-bottom: calc\(172px \+ env\(safe-area-inset-bottom\)\) !important/);
  assert.match(workspaceV4, /bottom: calc\(82px \+ env\(safe-area-inset-bottom\)\) !important/);
});
