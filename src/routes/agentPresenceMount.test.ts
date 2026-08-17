import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const protectedLayout = readFileSync("src/layouts/ProtectedLayout.tsx", "utf8");
const contextualAgentDock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");

test("authenticated protected layout mounts the contextual AI agent without a separate tutorial bubble", () => {
  assert.match(protectedLayout, /import ContextualAgentDock from "\.\.\/components\/agents\/ContextualAgentDock"/);
  assert.match(protectedLayout, /<ContextualAgentDock \/>/);
  assert.doesNotMatch(protectedLayout, /LiveTutorialDock/);
});

test("active AI agent teaches the current workspace tab before freeform chat", () => {
  assert.match(contextualAgentDock, /type TabTutorial/);
  assert.match(contextualAgentDock, /title: "How to work Leads"/);
  assert.match(contextualAgentDock, /title: "How to use the Communications Hub"/);
  assert.match(contextualAgentDock, /className="hlc-agent-tutorial"/);
  assert.match(contextualAgentDock, /Learn this tab/);
  assert.match(contextualAgentDock, /Ask \{agent\.name\} about this tab/);
  assert.doesNotMatch(contextualAgentDock, /hlc-agent-greeting/);
});
