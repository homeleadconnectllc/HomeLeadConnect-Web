import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workspace = readFileSync("src/pages/dashboard/AgentWorkspace.tsx", "utf8");
const agents = readFileSync("src/ai/agents.ts", "utf8");
const styles = readFileSync("src/styles/ai-team-application-workspace.css", "utf8");
const purposeBuiltStyles = readFileSync("src/styles/hlc-purpose-built-workspaces.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("AI Team retains one serious structural workspace for all three canonical agents", () => {
  assert.match(workspace, /hlc-agent-workspace hlc-agent-team-structural/);
  assert.match(workspace, /hlc-agent-team-header/);
  assert.match(workspace, /hlc-agent-team-switcher/);
  assert.match(workspace, /hlc-agent-chat-stage/);
  assert.match(workspace, /hlc-agent-action-workbench/);
  assert.match(workspace, /hlc-agent-result-rail/);
  assert.match(workspace, /AgentChatPanel/);
  assert.match(workspace, /listAgentRuns\(agentId\)/);
  assert.match(workspace, /listAgentHandoffs\(agentId\)/);
  assert.match(workspace, /createAgentHandoff/);
  assert.match(workspace, /runAgentCapability/);
  assert.doesNotMatch(workspace, /hlc-agent-command-hero/);
});

test("locked AI identities routes roles portraits accents and voice personas remain exact", () => {
  assert.match(agents, /id: "kendrell", name: "Kendrell", role: "Executive Command AI"/);
  assert.match(agents, /route: "\/hq"/);
  assert.match(agents, /Kendrell_Locked_HLC\.png/);
  assert.match(agents, /kendrell: "#F59E0B"/);
  assert.match(agents, /id: "dion", name: "Dion", role: "Operations & BI AI"/);
  assert.match(agents, /route: "\/operations"/);
  assert.match(agents, /Dion_Locked_HLC\.png/);
  assert.match(agents, /dion: "#38BDF8"/);
  assert.match(agents, /id: "diamond", name: "Diamond", role: "Customer Experience & Community AI"/);
  assert.match(agents, /route: "\/customer-experience"/);
  assert.match(agents, /Diamond_Locked_HLC\.png/);
  assert.match(agents, /diamond: "#10B981"/);
  assert.match(agents, /genderPresentation: "male"/);
  assert.match(agents, /genderPresentation: "female"/);
});

test("AI Team preserves capability and authorization boundaries", () => {
  assert.match(workspace, /create_owner_attention_item/);
  assert.match(workspace, /account\.role !== "owner"/);
  assert.match(workspace, /Select a lead first/);
  assert.match(workspace, /create_followup/);
  assert.match(workspace, /new Date\(dueAt\)\.toISOString\(\)/);
  assert.match(workspace, /destination: agentId === "diamond" \? "dion" : "kendrell"/);
  assert.match(workspace, /handoffCopy/);
  assert.match(workspace, /TEAM HANDOFFS/);
});

test("AI Team styling keeps the structural workspace compact and mobile safe", () => {
  const routeIndex = entry.indexOf("./ai-team-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(purposeBuiltStyles, /\.hlc-agent-workspace\{display:grid;gap:18px\}/);
  assert.match(purposeBuiltStyles, /\.hlc-agent-team-header\{display:flex;justify-content:space-between/);
  assert.match(purposeBuiltStyles, /\.hlc-agent-chat-stage\{display:grid;grid-template-columns:/);
  assert.match(purposeBuiltStyles, /\.hlc-agent-operating-grid\{display:grid;grid-template-columns:/);
  assert.match(purposeBuiltStyles, /\.hlc-agent-history-grid\{display:grid;grid-template-columns:/);
  assert.match(purposeBuiltStyles, /@media\(max-width:820px\)[\s\S]*\.hlc-agent-chat-stage,\.hlc-agent-operating-grid,\.hlc-agent-history-grid\{grid-template-columns:1fr\}/);
  assert.doesNotMatch(purposeBuiltStyles, /\.hlc-agent-workspace> \.hlc-agent-command-hero/);
});

test("AI command workspaces remain dark while the new structure replaces the retired hero", () => {
  assert.match(styles, /--agent-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-agent-guidance-drawer\{[^}]*background:#0b192b!important/);
  assert.doesNotMatch(styles, /background:(?:#fff|#ffffff|#fbfdff|#eef5fc|#eef6ff|#f8fbff)!important/i);
  assert.match(workspace, /agent\.accent/);
  assert.match(workspace, /hlc-agent-team-identity/);
  assert.doesNotMatch(workspace, /style=\{\{ \.\.\.heroStyle/);
});
