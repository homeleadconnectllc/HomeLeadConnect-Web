import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const messages = readFileSync(new URL("../pages/dashboard/Messages.tsx", import.meta.url), "utf8");
const authenticatedStyles = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");

test("Messages defaults to inbox-first progressive navigation", () => {
  assert.match(messages, /type MessagesView = "inbox" \| "thread" \| "compose";/);
  assert.match(messages, /useState<MessagesView>\("inbox"\)/);
  assert.match(messages, />New Message<\/button>/);
  assert.match(messages, /← Back to inbox/);
  assert.match(messages, /setView\("thread"\)/);
  assert.match(messages, /setView\("compose"\)/);
});

test("new-message controls are not rendered ahead of the inbox by default", () => {
  assert.match(messages, /\{view === "inbox" && \(/);
  assert.match(messages, /\{view === "compose" && \(/);
  assert.match(messages, /\{view === "thread" && \(/);
});

test("conversation and recipient loading remain independent", () => {
  assert.match(messages, /const \[conversationsLoading, setConversationsLoading\] = useState\(true\)/);
  assert.match(messages, /const \[recipientsLoading, setRecipientsLoading\] = useState\(true\)/);
  assert.match(messages, /listConversations\(\)\s*\.then/);
  assert.match(messages, /listPortalRecipients\(\)\s*\.then/);
  assert.doesNotMatch(messages, /Promise\.all\(\[listConversations\(\), listPortalRecipients\(\)\]\)/);
});

test("Messages keeps simpler user-facing communication language", () => {
  assert.match(messages, />HLC message<\/strong>/);
  assert.match(messages, />Email<\/strong>/);
  assert.match(messages, /"Send message"/);
  assert.match(messages, />Reply<\/label>/);
  assert.doesNotMatch(messages, />Internal<\/strong>/);
});

test("retired Lane 2 visual authority stays disconnected while current mobile communication behavior remains", () => {
  assert.doesNotMatch(authenticatedStyles, /messages-lane-2-mobile-authority\.css/);
  assert.match(authenticatedStyles, /mobile-a-plus-sprint-4-community-messages\.css/);
  assert.match(authenticatedStyles, /mobile-command-menu-rebuild-20260905\.css/);
});
