import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const leadsPage = readFileSync(new URL("../pages/dashboard/Leads.tsx", import.meta.url), "utf8");
const leadDetail = readFileSync(new URL("../pages/dashboard/LeadDetail.tsx", import.meta.url), "utf8");
const leadRow = readFileSync(new URL("../components/leads/LeadCard.tsx", import.meta.url), "utf8");
const leadsApi = readFileSync(new URL("../api/leads.ts", import.meta.url), "utf8");
const leadsCss = readFileSync(new URL("../styles/leads-application-workspace.css", import.meta.url), "utf8");

test("Leads uses a dedicated operating workspace instead of a page card", () => {
  assert.match(leadsPage, /className="hlc-leads-workspace"/);
  assert.match(leadsPage, /className="hlc-leads-summary"/);
  assert.match(leadsPage, /className="hlc-leads-toolbar"/);
  assert.match(leadsPage, /className="hlc-leads-pipeline"/);
  assert.doesNotMatch(leadsPage, /style=\{pageStyle\}/);
});

test("lead records are dense pipeline rows rather than floating cards", () => {
  assert.match(leadRow, /className="hlc-lead-row"/);
  assert.match(leadRow, /className="hlc-lead-pipeline-cell"/);
  assert.match(leadRow, /className="hlc-lead-actions"/);
  assert.doesNotMatch(leadRow, /responsive-record-card/);
  assert.doesNotMatch(leadRow, /cardStyle/);
});

test("Leads preserves the operational actions and mobile collapse", () => {
  for (const action of ["/estimator?lead=", "/follow-ups?lead=", "/manual-communications?contact=lead:"]) {
    assert.match(leadRow, new RegExp(action.replace(/[?]/g, "\\?")));
  }
  assert.match(leadsCss, /grid-template-columns:minmax\(0,1\.55fr\)/);
  assert.match(leadsCss, /@media\(max-width:760px\)/);
  assert.match(leadsCss, /\.hlc-lead-row\{grid-template-columns:1fr/);
});

test("Leads queries only columns present in the deployed lead schema", () => {
  assert.doesNotMatch(leadsApi, /lead_code/);
  assert.doesNotMatch(leadsPage, /lead_code|lead code/i);
  assert.doesNotMatch(leadRow, /lead_code/);
  assert.doesNotMatch(leadDetail, /lead_code/);
  assert.match(leadRow, /Lead #\{lead\.id\}/);
  assert.match(leadDetail, /Lead #\{lead\.id\}/);
});
