import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedStyles = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const contrast = readFileSync("src/styles/launch-contrast-readability.css", "utf8");

test("launch contrast authority is mounted last", () => {
  const workspaceIndex = authenticatedStyles.indexOf("./application-workspace-ui.css");
  const contrastIndex = authenticatedStyles.indexOf("./launch-contrast-readability.css");
  assert.ok(workspaceIndex >= 0);
  assert.ok(contrastIndex > workspaceIndex);
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
});

test("Leads mobile records keep identity, metadata, and actions readable", () => {
  assert.match(contrast, /\.hlc-lead-identity-copy\s*>\s*strong[\s\S]*var\(--hlc-launch-text\)/i);
  assert.match(contrast, /\.hlc-lead-contact-line[\s\S]*var\(--hlc-launch-muted\)/i);
  assert.match(contrast, /\.hlc-lead-actions a[\s\S]*background:\s*#112744\s*!important[\s\S]*#f8fafc/i);
  assert.match(contrast, /@media\s*\(max-width:\s*760px\)[\s\S]*\.hlc-lead-actions a[\s\S]*min-height:\s*44px\s*!important/i);
});
