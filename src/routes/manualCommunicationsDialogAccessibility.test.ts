import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const hook = readFileSync("src/hooks/useModalDialogAccessibility.ts", "utf8");

test("returned-call outcome dialog uses the shared modal accessibility behavior", () => {
  assert.match(source, /useModalDialogAccessibility<HTMLElement>\(returnPromptOpen && Boolean\(selected\), dismissReturnPrompt\)/);
  assert.match(source, /aria-describedby="post-call-description"/);
  assert.match(hook, /event\.key === "Escape"/);
  assert.match(hook, /event\.key !== "Tab"/);
  assert.match(hook, /previouslyFocused\.focus\(\)/);
  assert.match(hook, /modalStack\.at\(-1\) !== dialog/);
});

test("all application modal surfaces use the shared focus trap and restoration hook", () => {
  for (const file of [
    "src/components/scheduling/RescheduleDialog.tsx",
    "src/components/search/GlobalCommandSearch.tsx",
    "src/components/tutorials/LiveTutorialDock.tsx",
    "src/pages/dashboard/CallCenter.tsx",
    "src/pages/dashboard/AgentWorkspace.tsx",
  ]) {
    const modalSource = readFileSync(file, "utf8");
    assert.match(modalSource, /useModalDialogAccessibility/);
    assert.match(modalSource, /ref=\{(?:dialogRef|[A-Za-z]+DialogRef)\}/);
  }
});
