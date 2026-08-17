import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const callCenter = readFileSync("src/pages/dashboard/CallCenter.tsx", "utf8");
const messages = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const communityHub = readFileSync("src/pages/dashboard/CommunityHub.tsx", "utf8");
const communityStore = readFileSync("src/components/community/CommunityStore.tsx", "utf8");

test("Call Center exposes persisted call history and outcome log without a duplicate call store", () => {
  assert.match(callCenter, /listCallSessions/);
  assert.match(callCenter, /recordCallDisposition/);
  assert.match(callCenter, />Call Log</);
  assert.match(callCenter, />Call History</);
  assert.match(callCenter, /Save to call log/);
});

test("Messages exposes persisted chat history from canonical conversations", () => {
  assert.match(messages, /listConversations/);
  assert.match(messages, /aria-label="Chat history"/);
  assert.match(messages, /CONVERSATION HISTORY/);
  assert.match(messages, /Persisted chat history/);
  assert.match(messages, /conversation\.messages\.length/);
});

test("Community Store is fulfillment-gated and never claims HLC inventory or delivery", () => {
  assert.match(communityHub, /<CommunityStore \/>/);
  assert.match(communityHub, />HLC Store</);
  assert.match(communityStore, /VITE_HLC_MERCH_STORE_URL/);
  assert.match(communityStore, /third-party fulfillment provider/i);
  assert.match(communityStore, /does not represent an item as stocked, printed, shipped or delivered/i);
  assert.match(communityStore, /Checkout connection pending/);
});
