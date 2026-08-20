import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const documents = readFileSync("src/pages/dashboard/Documents.tsx", "utf8");
const guides = readFileSync("src/pages/dashboard/OperationalGuide.tsx", "utf8");
const styles = readFileSync("src/styles/documents-resources-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("Documents uses a dedicated evidence workspace instead of inline card composition", () => {
  assert.match(documents, /hlc-documents-workspace/);
  assert.match(documents, /RECORD EVIDENCE/);
  assert.match(documents, /hlc-documents-console/);
  assert.match(documents, /hlc-document-row/);
  assert.doesNotMatch(documents, /heroStyle|guideCardStyle|fileCardStyle|boxShadow:/);
});

test("Documents preserves canonical loading, upload, sharing and open behavior", () => {
  assert.match(documents, /listDocuments\(\)/);
  assert.match(documents, /uploadDocument\(\{/);
  assert.match(documents, /getDocumentUrl\(item\.id, item\.storage_path\)/);
  assert.match(documents, /name="entityType"/);
  assert.match(documents, /value="lead"/);
  assert.match(documents, /value="estimate"/);
  assert.match(documents, /value="job"/);
  assert.match(documents, /value="appointment"/);
  assert.match(documents, /value="contractor"/);
  assert.match(documents, /value="conversation"/);
  assert.match(documents, /name="sharingScope"/);
  assert.match(documents, /value="workspace"/);
  assert.match(documents, /value="homeowner"/);
  assert.match(documents, /value="contractor"/);
  assert.match(documents, /25 MB/);
});

test("Help Tutorials and Rules share the knowledge workspace while preserving operational handoffs", () => {
  assert.match(guides, /hlc-resources-workspace/);
  assert.match(guides, /RECOVERY DESK/);
  assert.match(guides, /ROLE PLAYBOOKS/);
  assert.match(guides, /OPERATING BOUNDARIES/);
  assert.match(guides, /\/manuals\/hlc-technician-troubleshooting-manual\.html/);
  assert.match(guides, /\/manuals\/hlc-manager-operations-manual\.html/);
  assert.match(guides, /\/forgot-password/);
  assert.match(guides, /\/workflow/);
  assert.match(guides, /\/call-center/);
  assert.match(guides, /\/settings\/billing/);
  assert.match(guides, /\/contractor-portal/);
  assert.match(guides, /\/privacy/);
  assert.match(guides, /\/terms/);
  assert.match(guides, /\/platform-disclosure/);
  assert.doesNotMatch(guides, /const card =|gridTemplateColumns: "repeat\(auto-fit/);
});

test("Documents Resources specialization mounts before final authority and collapses on mobile", () => {
  const routeIndex = entry.indexOf("./documents-resources-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-documents-console\{display:grid;grid-template-columns:/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-document-row\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-manual-row\{grid-template-columns:1fr/);
  assert.match(styles, /width:min\(100% - 24px,1440px\)/);
});
