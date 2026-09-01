import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workspace = readFileSync("src/pages/dashboard/AgentWorkspace.tsx", "utf8");
const agents = readFileSync("src/ai/agents.ts", "utf8");
const styles = readFileSync("src/styles/ai-team-application-workspace.css", "utf8");
const visualStyles = readFileSync("src/styles/ai-team-visual-wave.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("AI Team retains one serious command workspace for all three canonical agents", () => {
  assert.match(workspace, /hlc-agent-workspace/);
  assert.match(workspace, /hlc-agent-command-hero/);
  assert.match(workspace, /AgentChatPanel/);
  assert.match(workspace, /hlc-agent-actions/);
  assert.match(workspace, /hlc-agent-action-button/);
  assert.match(workspace, /listAgentRuns\(agentId\)/);
  assert.match(workspace, /listAgentHandoffs\(agentId\)/);
  assert.match(workspace, /createAgentHandoff/);
  assert.match(workspace, /runAgentCapability/);
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
  assert.match(workspace, /The source agent remains attributable; the destination agent does not impersonate it/);
});

test("AI Team styling replaces generic panel cards with command rows and stays mobile safe", () => {
  const routeIndex = entry.indexOf("./ai-team-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-agent-actions,.hlc-agent-actions\+section/);
  assert.match(styles, /border-radius:0!important;background:transparent!important;box-shadow:none!important/);
  assert.match(styles, /\.hlc-agent-action-button\{display:grid/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /width:min\(100% - 24px,1440px\)!important/);
  assert.match(styles, /width:100vw!important;max-width:none!important/);
});

test("AI command workspaces are natively dark while preserving role-owned accents", () => {
  assert.match(styles, /--agent-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-agent-command-hero\{[^}]*border-radius:10px!important/);
  assert.match(styles, /\.hlc-agent-actions select,[\s\S]*background:var\(--agent-surface-soft\)!important/);
  assert.match(styles, /\.hlc-agent-action-button:hover,[\s\S]*rgba\(47,128,255,\.06\)!important/);
  assert.match(styles, /\.hlc-agent-guidance-drawer\{[^}]*background:#0b192b!important/);
  assert.doesNotMatch(styles, /background:(?:#fff|#ffffff|#fbfdff|#eef5fc|#eef6ff|#f8fbff)!important/i);
  assert.match(workspace, /style=\{\{ \.\.\.heroStyle, borderColor: agent\.accent \}\}/);
});

test("AI Team visual authority reports real command signals without widening authority", () => {
  const baseIndex = entry.indexOf("./ai-team-application-workspace.css");
  const visualIndex = entry.indexOf("./ai-team-visual-wave.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(visualIndex > baseIndex);
  assert.ok(finalIndex > visualIndex);
  assert.match(workspace, /data-agent=\{agentId\}/);
  assert.match(workspace, /hlc-agent-command-signals/);
  assert.match(workspace, /capabilityCatalog\[agentId\]\.length/);
  assert.match(workspace, /runs\.length/);
  assert.match(workspace, /handoffs\.length/);
  assert.match(visualStyles, /\.hlc-agent-command-signals/);
  assert.match(visualStyles, /\[data-agent="kendrell"\]/);
  assert.match(visualStyles, /\[data-agent="dion"\]/);
  assert.match(visualStyles, /\[data-agent="diamond"\]/);
  assert.match(visualStyles, /@media\(max-width:720px\)/);
  assert.doesNotMatch(visualStyles, /background:(?:#fff|#ffffff|#fbfdff|#eef5fc|#eef6ff|#f8fbff)/i);
});
