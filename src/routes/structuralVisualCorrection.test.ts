import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync(new URL("../pages/dashboard/Dashboard.tsx", import.meta.url), "utf8");
const messages = readFileSync(new URL("../pages/dashboard/Messages.tsx", import.meta.url), "utf8");
const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const dashboardAuthority = readFileSync(new URL("../styles/hlc-dashboard-structural-correction.css", import.meta.url), "utf8");
const messagesAuthority = readFileSync(new URL("../styles/hlc-structural-correction.css", import.meta.url), "utf8");

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

test("corrective authorities explicitly define desktop structure and mobile progressive composition", () => {
  assert.match(messagesAuthority, /grid-template-columns: minmax\(280px, 340px\) minmax\(0, 1fr\)/);
  assert.match(messagesAuthority, /data-messages-view="inbox"/);
  assert.match(messagesAuthority, /data-messages-view="thread"/);
  assert.match(dashboardAuthority, /grid-template-columns: minmax\(0, 1\.25fr\) minmax\(300px, 0\.75fr\)/);
  assert.match(dashboardAuthority, /@media \(max-width: 820px\)/);
});

test("Messages Lane 2 remains the final authenticated stylesheet after structural correction authorities", () => {
  const lines = authenticatedStyles.trim().split("\n");
  const lane2 = 'import "./messages-lane-2-mobile-authority.css";';
  const structural = 'import "./hlc-structural-correction.css";';
  const dashboardStructural = 'import "./hlc-dashboard-structural-correction.css";';
  assert.ok(lines.indexOf(dashboardStructural) > -1);
  assert.ok(lines.indexOf(structural) > lines.indexOf(dashboardStructural));
  assert.ok(lines.indexOf(lane2) > lines.indexOf(structural));
  assert.equal(lines.at(-5), lane2);
});
