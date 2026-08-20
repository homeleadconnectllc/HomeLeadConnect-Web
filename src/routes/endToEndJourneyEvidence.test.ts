import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const jobCard = fs.readFileSync(new URL("../components/jobs/JobCard.tsx", import.meta.url), "utf8");
const documents = fs.readFileSync(new URL("../pages/dashboard/Documents.tsx", import.meta.url), "utf8");

test("job work hands evidence intake the exact job context", () => {
  assert.match(jobCard, /to=\{`\/documents\?entityType=job&entityId=\$\{encodeURIComponent\(job\.id\)\}`\}/);
  assert.match(jobCard, />Attach evidence<\/Link>/);
});

test("documents accepts only supported contextual record types and pre-fills the linked record", () => {
  assert.match(documents, /useSearchParams\(\)/);
  assert.match(documents, /documentEntityTypes = new Set\(\["lead", "estimate", "job", "appointment", "contractor", "conversation"\]\)/);
  assert.match(documents, /defaultValue=\{initialEntityType\}/);
  assert.match(documents, /defaultValue=\{requestedEntityId\}/);
  assert.match(documents, /uploadDocument\(\{/);
  assert.match(documents, /entityType: String\(form\.get\("entityType"\)\)/);
  assert.match(documents, /entityId: String\(form\.get\("entityId"\)\)/);
  assert.match(documents, /sharingScope: String\(form\.get\("sharingScope"\)\)/);
});
