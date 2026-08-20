import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const styles = readFileSync("src/styles/messages-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("Messages uses a dedicated communications console instead of panel cards", () => {
  assert.match(page, /hlc-messages-workspace/);
  assert.match(page, /COMMUNICATIONS/);
  assert.match(page, /hlc-messages-console/);
  assert.match(page, /hlc-message-inbox-row/);
  assert.match(page, /hlc-message-entry/);
  assert.doesNotMatch(page, /panelStyle|messageStyle|conversationButtonStyle/);
});

test("Messages preserves canonical conversations, deliberate email, replies and voice notes", () => {
  assert.match(page, /listConversations\(\)/);
  assert.match(page, /listPortalRecipients\(\)/);
  assert.match(page, /startPortalConversation/);
  assert.match(page, /sendPortalEmail/);
  assert.match(page, /postInternalMessage/);
  assert.match(page, /uploadVoiceNote/);
  assert.match(page, /listVoiceNotes/);
  assert.match(page, /sendEmailCopy/);
  assert.match(page, /composeVoiceNote/);
});

test("Messages specialization mounts before final authority and collapses to one mobile workspace", () => {
  const routeIndex = entry.indexOf("./messages-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-messages-console\{display:grid;grid-template-columns:/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-messages-console\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-message-entry\{grid-template-columns:1fr/);
});
