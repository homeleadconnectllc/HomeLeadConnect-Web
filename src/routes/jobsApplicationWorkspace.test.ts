import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const jobsPage = readFileSync(new URL("../pages/dashboard/Jobs.tsx", import.meta.url), "utf8");
const jobRow = readFileSync(new URL("../components/jobs/JobCard.tsx", import.meta.url), "utf8");
const jobsCss = readFileSync(new URL("../styles/jobs-application-workspace.css", import.meta.url), "utf8");

test("Jobs uses a dedicated operating workspace instead of a card page", () => {
  assert.match(jobsPage, /className="hlc-jobs-workspace"/);
  assert.match(jobsPage, /className="hlc-jobs-summary"/);
  assert.match(jobsPage, /className="hlc-jobs-board"/);
  assert.doesNotMatch(jobsPage, /style=\{pageStyle\}/);
});

test("job records render as dense operating rows", () => {
  assert.match(jobRow, /className="hlc-job-row"/);
  assert.match(jobRow, /className="hlc-job-value-cell"/);
  assert.match(jobRow, /className="hlc-job-actions"/);
  assert.doesNotMatch(jobRow, /responsive-record-card/);
  assert.doesNotMatch(jobRow, /cardStyle/);
});

test("Jobs preserves status and open-job controls with a compact mobile layout", () => {
  assert.match(jobRow, /onStatusChange/);
  assert.match(jobRow, /to=\{`\/jobs\/\$\{job\.id\}`\}/);
  assert.match(jobsCss, /grid-template-columns:minmax\(0,1\.3fr\)/);
  assert.match(jobsCss, /@media\(max-width:760px\)/);
  assert.match(jobsCss, /\.hlc-job-row\{grid-template-columns:1fr/);
});
