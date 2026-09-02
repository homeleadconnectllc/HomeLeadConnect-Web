import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync(new URL("../pages/dashboard/Dashboard.tsx", import.meta.url), "utf8");
const messages = readFileSync(new URL("../pages/dashboard/Messages.tsx", import.meta.url), "utf8");
const academy = readFileSync(new URL("../pages/dashboard/AcademyWorkspace.tsx", import.meta.url), "utf8");
const analytics = readFileSync(new URL("../pages/dashboard/Analytics.tsx", import.meta.url), "utf8");
const agentWorkspace = readFileSync(new URL("../pages/dashboard/AgentWorkspace.tsx", import.meta.url), "utf8");
const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const dashboardAuthority = readFileSync(new URL("../styles/hlc-dashboard-structural-correction.css", import.meta.url), "utf8");
const messagesAuthority = readFileSync(new URL("../styles/hlc-structural-correction.css", import.meta.url), "utf8");
const purposeBuiltAuthority = readFileSync(new URL("../styles/hlc-purpose-built-workspaces.css", import.meta.url), "utf8");

test("Dashboard is an attention-first home workspace rather than the old billboard/catalog composition", () => {
  assert.match(dashboard, /className="hlc-home-workspace hlc-home-structural"/);
  assert.match(dashboard, /className="hlc-home-primary-grid"/);
  assert.match(dashboard, />Needs attention</);
  assert.match(dashboard, />Today</);
  assert.match(dashboard, /className="hlc-home-quick-row"/);
  assert.match(dashboard, /className="hlc-home-ai-rail"/);
  assert.doesNotMatch(dashboard, /hlc-command-hero/);
  assert.doesNotMatch(dashboard, /Business Pulse/);
  assert.doesNotMatch(dashboard, /Everything you built/);
});

test("Messages renders as a conversation application with separate list and stage regions", () => {
  assert.match(messages, /className="hlc-messages-workspace hlc-messages-app-shell"/);
  assert.match(messages, /className="hlc-messaging-frame"/);
  assert.match(messages, /hlc-conversation-list-panel/);
  assert.match(messages, /hlc-conversation-stage/);
  assert.match(messages, /hlc-message-avatar/);
  assert.match(messages, /Select a conversation/);
  assert.match(messages, /className="hlc-message-stream"/);
});

test("Academy is a dedicated learning workspace rather than Community markup", () => {
  assert.match(academy, /className="hlc-academy-workspace"/);
  assert.match(academy, /className="hlc-academy-home-grid"/);
  assert.match(academy, /className="hlc-academy-sequence"/);
  assert.match(academy, /className="hlc-academy-curriculum"/);
  assert.doesNotMatch(academy, /hlc-community-workspace/);
  assert.doesNotMatch(academy, /hlc-premium-panel/);
});

test("Analytics is a dedicated intelligence workspace rather than a command-center dashboard", () => {
  assert.match(analytics, /className="hlc-analytics-workspace"/);
  assert.match(analytics, /className="hlc-analytics-grid"/);
  assert.match(analytics, /className="hlc-analytics-insight"/);
  assert.match(analytics, /className="hlc-analytics-table"/);
  assert.doesNotMatch(analytics, /hlc-command-center/);
  assert.doesNotMatch(analytics, /hlc-command-hero/);
});

test("AI Team uses conversation-first contextual structure rather than the old portrait hero", () => {
  assert.match(agentWorkspace, /className="hlc-agent-workspace hlc-agent-team-structural"/);
  assert.match(agentWorkspace, /className="hlc-agent-team-switcher"/);
  assert.match(agentWorkspace, /className="hlc-agent-chat-stage"/);
  assert.match(agentWorkspace, /className="hlc-agent-operating-grid"/);
  assert.match(agentWorkspace, /className="hlc-agent-history-grid"/);
  assert.doesNotMatch(agentWorkspace, /hlc-agent-command-hero/);
});

test("corrective authorities explicitly define desktop structure and purpose-built mobile composition", () => {
  assert.match(messagesAuthority, /grid-template-columns: minmax\(280px, 340px\) minmax\(0, 1fr\)/);
  assert.match(messagesAuthority, /data-messages-view="inbox"/);
  assert.match(messagesAuthority, /data-messages-view="thread"/);
  assert.match(dashboardAuthority, /grid-template-columns: minmax\(0, 1\.25fr\) minmax\(300px, 0\.75fr\)/);
  assert.match(dashboardAuthority, /@media \(max-width: 820px\)/);
  assert.match(purposeBuiltAuthority, /\.hlc-academy-home-grid\{display:grid;grid-template-columns:/);
  assert.match(purposeBuiltAuthority, /\.hlc-analytics-grid\{display:grid;grid-template-columns:/);
  assert.match(purposeBuiltAuthority, /\.hlc-agent-operating-grid\{display:grid;grid-template-columns:/);
  assert.match(purposeBuiltAuthority, /@media\(max-width:820px\)/);
  assert.match(purposeBuiltAuthority, /\.hlc-academy-home-grid,\.hlc-analytics-grid,\.hlc-agent-chat-stage,\.hlc-agent-operating-grid,\.hlc-agent-history-grid\{grid-template-columns:1fr\}/);
  assert.match(purposeBuiltAuthority, /\.hlc-agent-help-fab\{bottom:92px;right:14px\}/);
});

test("Messages Lane 2 remains the final authenticated stylesheet after all corrective authorities", () => {
  const lines = authenticatedStyles.trim().split("\n");
  const lane2 = 'import "./messages-lane-2-mobile-authority.css";';
  const structural = 'import "./hlc-structural-correction.css";';
  const dashboardStructural = 'import "./hlc-dashboard-structural-correction.css";';
  const purposeBuilt = 'import "./hlc-purpose-built-workspaces.css";';
  assert.ok(lines.indexOf(dashboardStructural) > -1);
  assert.ok(lines.indexOf(structural) > lines.indexOf(dashboardStructural));
  assert.ok(lines.indexOf(purposeBuilt) > lines.indexOf(structural));
  assert.ok(lines.indexOf(lane2) > lines.indexOf(purposeBuilt));
  assert.equal(lines.at(-5), lane2);
});
