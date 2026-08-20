import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const leadDetail = fs.readFileSync(new URL("../pages/dashboard/LeadDetail.tsx", import.meta.url), "utf8");
const jobs = fs.readFileSync(new URL("../pages/dashboard/Jobs.tsx", import.meta.url), "utf8");
const jobCard = fs.readFileSync(new URL("../components/jobs/JobCard.tsx", import.meta.url), "utf8");
const documents = fs.readFileSync(new URL("../pages/dashboard/Documents.tsx", import.meta.url), "utf8");

test("lead detail carries exact lead context into related jobs", () => {
  assert.match(leadDetail, /to=\{`\/jobs\?lead=\$\{lead\.id\}`\}/);
  assert.match(jobs, /const raw = searchParams\.get\("lead"\)/);
  assert.match(jobs, /jobs\.filter\(\(job\) => job\.lead_id === leadFilter\)/);
  assert.match(jobs, /Showing jobs for Lead #\{leadFilter\}/);
  assert.match(jobs, /Show all jobs/);
});

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
