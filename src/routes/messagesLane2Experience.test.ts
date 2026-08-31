import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const messages = readFileSync(new URL("../pages/dashboard/Messages.tsx", import.meta.url), "utf8");
const authority = readFileSync(new URL("../styles/messages-lane-2-mobile-authority.css", import.meta.url), "utf8");
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
  assert.doesNotMatch(messages, /setSelectedId\(conversationRows\[0\]\?\.id \?\? null\)/);
});

test("conversation and recipient loading are independent", () => {
  assert.match(messages, /const \[conversationsLoading, setConversationsLoading\] = useState\(true\)/);
  assert.match(messages, /const \[recipientsLoading, setRecipientsLoading\] = useState\(true\)/);
  assert.match(messages, /listConversations\(\)\s*\.then/);
  assert.match(messages, /listPortalRecipients\(\)\s*\.then/);
  assert.doesNotMatch(messages, /Promise\.all\(\[listConversations\(\), listPortalRecipients\(\)\]\)/);
});

test("Messages uses simpler user-facing communication language", () => {
  assert.match(messages, />HLC message<\/strong>/);
  assert.match(messages, />Email<\/strong>/);
  assert.match(messages, /"Send message"/);
  assert.match(messages, />Reply<\/label>/);
  assert.doesNotMatch(messages, />Internal<\/strong>/);
  assert.doesNotMatch(messages, /Internal reply/);
});

test("Lane 2 mobile authority is loaded last and locks compact progressive controls", () => {
  const authorityImport = 'import "./messages-lane-2-mobile-authority.css";';
  assert.match(authenticatedStyles, /import "\.\/messages-lane-2-mobile-authority\.css";/);
  assert.equal(authenticatedStyles.trim().split("\n").at(-5), authorityImport);
  assert.match(authority, /@media \(max-width: 720px\)/);
  assert.match(authority, /\.hlc-messages-progressive-inbox/);
  assert.match(authority, /\.hlc-messages-view-toolbar/);
  assert.match(authority, /grid-template-columns: 1fr !important;/);
  assert.match(authority, /min-height: 120px !important;/);
});

test("Lane 2 mobile subject and inbox remain compact dark application surfaces", () => {
  assert.match(authority, /\.hlc-message-subject-details \{/);
  assert.match(authority, /background: #0d1b2f !important;/);
  assert.match(authority, /\.hlc-message-subject-details input \{/);
  assert.match(authority, /background: #0a192c !important;/);
  assert.match(authority, /color: #f8fafc !important;/);
  assert.match(authority, /\.hlc-message-subject-details input::placeholder/);
  assert.match(authority, /min-height: 68px !important;/);
  assert.match(authority, /grid-template-columns: minmax\(0, 1fr\) auto !important;/);
});
