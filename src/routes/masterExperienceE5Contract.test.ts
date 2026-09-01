import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { buildSimulationActionPlan, runForecast, runLogisticsScenario } from "../lib/intelligenceSandbox.ts";

const router=readFileSync(new URL("./AppRouter.tsx",import.meta.url),"utf8");
const page=readFileSync(new URL("../pages/dashboard/IntelligenceWorkspace.tsx",import.meta.url),"utf8");
const model=readFileSync(new URL("../lib/intelligenceSandbox.ts",import.meta.url),"utf8");
const css=readFileSync(new URL("../styles/e5-intelligence-sandbox.css",import.meta.url),"utf8");

test("E5 intelligence routes remain inside manager workspace access",()=>{
  const boundary=router.indexOf("<Route element={<WorkspaceLayout/>}>");
  for(const route of ["/analytics/forecasting","/analytics/sandbox"]) assert.ok(router.indexOf(`path="${route}"`)>boundary);
});

test("forecast is deterministic and exposes a directional range",()=>{
  const input={monthlyLeads:48,conversionRate:35,averageJobHours:5,weeklyTeamHours:80,horizonWeeks:8};
  assert.deepEqual(runForecast(input),runForecast(input));
  const result=runForecast(input);
  assert.ok(result.lowJobs<result.expectedJobs&&result.expectedJobs<result.highJobs);
  assert.equal(result.confidence,"directional");
  assert.match(page,/Range uses ±20%/);
});

test("logistics simulation compares deterministic browser-local scenarios",()=>{
  const input={name:"Test",jobs:10,technicians:2,serviceMinutes:120,travelMinutes:30,workingDays:5,hoursPerDay:8};
  const result=runLogisticsScenario(input);
  assert.equal(result.totalHours,25);
  assert.equal(result.capacityHours,80);
  assert.equal(result.feasible,true);
  assert.equal(buildSimulationActionPlan(result).productionWrites,false);
});

test("simulation has no production mutation dependency or live-state claim",()=>{
  assert.doesNotMatch(model,/supabase|fetch\(|\.rpc\(|\.insert\(|\.update\(|\.delete\(/i);
  assert.doesNotMatch(page,/from "\.\.\/\.\.\/api\//);
  assert.match(page,/SIMULATION ONLY/);
  assert.match(page,/Zero production writes/);
  assert.match(page,/Blob/);
});

test("E5 keeps provenance labels, accessible controls, and mobile layout distinct",()=>{
  for(const label of ["REAL DATA","FORECAST","SIMULATION ONLY"]) assert.match(page,new RegExp(label));
  assert.match(page,/aria-label="Scenario comparison"/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/min-height:48px/);
  assert.match(css,/:focus-visible/);
});
