import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const documents = readFileSync("src/pages/dashboard/Documents.tsx", "utf8");
const scan = readFileSync("src/pages/dashboard/DocumentScan.tsx", "utf8");
const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const guides = readFileSync("src/pages/dashboard/OperationalGuide.tsx", "utf8");
const styles = readFileSync("src/styles/documents-resources-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("Documents uses a dedicated evidence workspace instead of inline card composition", () => {
  assert.match(documents, /hlc-documents-workspace/);
  assert.match(documents, /WORK · DOCUMENTS/);
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
  assert.match(documents, /value="estimate">Operational estimate/);
  assert.doesNotMatch(documents, /LeadScope estimate/);
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

test("Documents v2 exposes real library controls while keeping unconnected processing honest", () => {
  assert.match(documents, /type="search"/);
  assert.match(documents, /Record type/);
  assert.match(documents, /File type/);
  assert.match(documents, /Sharing/);
  assert.match(documents, /Clear filters/);
  assert.match(documents, /\/resources\/forms/);
  assert.match(documents, /to="\/documents\/scan">Scan capture/);
  assert.match(documents, /OCR extraction · setup pending/);
  assert.match(documents, /E-signatures · setup pending/);
  assert.match(documents, /aria-disabled="true"/);
  assert.doesNotMatch(documents, /OCR complete|Signature complete|Signed successfully/);
});

test("Scan intake stores original record evidence without claiming OCR", () => {
  assert.match(router, /path="\/documents\/scan" element={<DocumentScan\/>}/);
  assert.match(scan, /SCAN INTAKE/);
  assert.match(scan, /uploadDocument\(\{/);
  assert.match(scan, /capture="environment"/);
  assert.match(scan, /application\/pdf,image\/jpeg,image\/png,image\/webp/);
  assert.match(scan, /OCR extraction has not been run/);
  assert.match(scan, /Human review/);
  assert.doesNotMatch(scan, /OCR complete|extracted successfully|auto-posted|signature complete/i);
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

test("Documents and Resources are natively dark without pale form or command-bar islands", () => {
  assert.match(styles, /--resource-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-documents-form select,[\s\S]*background:var\(--resource-surface-soft\)/);
  assert.match(styles, /\.hlc-documents-guidance-row>strong\{[^}]*rgba\(47,128,255,\.14\)/);
  assert.match(styles, /\.hlc-resources-commandbar a:hover,[\s\S]*rgba\(47,128,255,\.1\)/);
  assert.doesNotMatch(styles, /background:(?:#fff|#ffffff|#fbfdff|#e7f1fb|#edf5ff)/i);
});
