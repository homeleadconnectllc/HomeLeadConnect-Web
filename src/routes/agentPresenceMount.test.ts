import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const protectedLayout = readFileSync("src/layouts/ProtectedLayout.tsx", "utf8");

test("authenticated protected layout always mounts the contextual agent dock", () => {
  assert.match(protectedLayout, /import ContextualAgentDock from "\.\.\/components\/agents\/ContextualAgentDock"/);
  assert.match(protectedLayout, /<ContextualAgentDock \/>/);
});
