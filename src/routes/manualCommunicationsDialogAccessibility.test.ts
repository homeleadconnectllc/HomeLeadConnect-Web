import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");

test("returned-call outcome dialog has focus, description, and Escape behavior", () => {
  assert.match(source, /returnPromptRef\.current\?\.focus\(\)/);
  assert.match(source, /previouslyFocused\?\.focus\(\)/);
  assert.match(source, /event\.key !== "Escape"/);
  assert.match(source, /aria-describedby="post-call-description"/);
  assert.match(source, /tabIndex=\{-1\}/);
});
