import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const structuralLegacyFiles = [
  "src/styles/workspace-route-cleanup.css",
  "src/styles/dashboard-application-workspace.css",
  "src/styles/jobs-dashboard-a.css",
  "src/styles/calendar-dashboard-a.css",
  "src/styles/follow-ups-dashboard-a.css",
  "src/styles/workflow-dashboard-a.css",
  "src/styles/automations-dashboard-a.css",
  "src/styles/command-center-experience.css",
  "src/styles/agent-team.css",
  "src/styles/agent-premium-v2.css"
];

test("legacy dashboard and agent route files retain structure without owning visual paint", () => {
  const paint = /(?:background(?:-color|-image)?|(?<!-)color|-webkit-text-fill-color|box-shadow|text-shadow|border-radius|border-color)\s*:/gi;
  for (const path of structuralLegacyFiles) {
    const css = readFileSync(path,"utf8");
    assert.match(css,/visual paint retired 2026-09-19/);
    assert.doesNotMatch(css,paint, path);
  }
});
