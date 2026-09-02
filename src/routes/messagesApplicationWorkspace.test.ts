import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const styles = readFileSync("src/styles/messages-application-workspace.css", "utf8");
const entry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const api = readFileSync("src/api/messages.ts", "utf8");
const recorder = readFileSync("src/components/messages/VoiceNoteRecorder.tsx", "utf8");

test("Messages uses a dedicated progressive messaging app workspace instead of panel cards", () => {
  assert.match(page, /hlc-messages-workspace hlc-messages-app-shell/);
  assert.match(page, /hlc-messages-kicker">MESSAGES/);
  assert.match(page, /data-messages-view=\{view\}/);
  assert.match(page, /hlc-messaging-frame/);
  assert.match(page, /hlc-conversation-list-panel/);
  assert.match(page, /hlc-conversation-stage/);
  assert.match(page, /hlc-messages-progressive-inbox/);
  assert.match(page, /hlc-messages-progressive-thread/);
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

test("Messages specialization remains beneath final authority while Lane 2 owns compact progressive layout", () => {
  const routeIndex = entry.indexOf("./messages-application-workspace.css");
  const finalIndex = entry.indexOf("./application-workspace-ui.css");
  assert.ok(routeIndex >= 0);
  assert.ok(finalIndex > routeIndex);
  assert.match(styles, /\.hlc-messages-console\{display:grid;grid-template-columns:/);
  assert.match(styles, /@media\(max-width:720px\)/);
  assert.match(styles, /\.hlc-messages-console\{grid-template-columns:1fr/);
  assert.match(styles, /\.hlc-message-entry\{grid-template-columns:1fr/);
});

test("Messages is natively dark and does not depend on a later contrast override to remove light islands", () => {
  assert.match(styles, /--msg-surface:#0d1b2f/);
  assert.match(styles, /\.hlc-message-stream\{[^}]*background:#081426/);
  assert.match(styles, /\.hlc-message-composer\{[^}]*background:var\(--msg-surface\)/);
  assert.match(styles, /\.hlc-message-inbox-row\.is-selected\{[^}]*rgba\(47,128,255,\.12\)/);
  assert.doesNotMatch(styles, /background:(?:#fff|#ffffff|#f8fafc|#f8fbff|#eef6ff)/i);
});

test("Messages mobile workspace uses available viewport height without a capped chat stream", () => {
  assert.match(styles, /min-height:calc\(100dvh - 190px\)/);
  assert.match(styles, /grid-template-rows:auto minmax\(260px,1fr\) auto auto/);
  assert.match(styles, /\.hlc-message-stream\{max-height:none;min-height:260px;overflow:auto/);
  assert.doesNotMatch(styles, /\.hlc-message-stream\{max-height:52vh\}[^\s\S]*Issue #153/);
});

test("Messages recipient picker is canonical and does not expose raw email addresses in option labels", () => {
  assert.match(api, /dedupePortalRecipients/);
  assert.match(api, /portalRecipientDisplayLabel/);
  assert.match(api, /const key = `\$\{recipient\.role\}:\$\{recipient\.subjectId\}`/);
  assert.match(page, /portalRecipientDisplayLabel\(recipient\)/);
  assert.doesNotMatch(page, /recipient\.label\}\$\{recipient\.email/);
});

test("Voice note attachment control is styled through HLC classes instead of inline layout and raw file chrome", () => {
  assert.match(recorder, /hlc-voice-note-recorder/);
  assert.match(recorder, /hlc-audio-file-action/);
  assert.match(recorder, /hlc-audio-file-input/);
  assert.doesNotMatch(recorder, /style=\{\{/);
  assert.match(styles, /\.hlc-audio-file-input\{position:absolute!important/);
});
