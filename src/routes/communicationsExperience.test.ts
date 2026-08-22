import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const callCenter = readFileSync("src/pages/dashboard/CallCenter.tsx", "utf8");
const manualCommunications = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const postCallAutomation = readFileSync("src/lib/postCallAutomation.ts", "utf8");
const messages = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const messagesApi = readFileSync("src/api/messages.ts", "utf8");
const sendCommunication = readFileSync("supabase/functions/send-communication/index.ts", "utf8");
const queueProviderRouting = readFileSync(
  "supabase/migrations/20260822113000_reconcile_communication_queue_provider_routing.sql",
  "utf8",
);
const communityHub = readFileSync("src/pages/dashboard/CommunityHub.tsx", "utf8");
const communityStore = readFileSync("src/components/community/CommunityStore.tsx", "utf8");

test("Call Center exposes persisted call history and outcome log without a duplicate call store", () => {
  assert.match(callCenter, /listCallSessions/);
  assert.match(callCenter, /recordCallDisposition/);
  assert.match(callCenter, />Call Log</);
  assert.match(callCenter, />Call History</);
  assert.match(callCenter, /Save to call log/);
});

test("free Google Voice handoff returns to a one-tap canonical outcome and follow-up flow", () => {
  assert.match(manualCommunications, /startCallHandoff/);
  assert.match(manualCommunications, /SMART POST-CALL/);
  assert.match(manualCommunications, /quickSaveOutcome/);
  assert.match(manualCommunications, /logManualCommunicationActivity/);
  assert.match(manualCommunications, /createFollowUp/);
  assert.match(postCallAutomation, /window\.sessionStorage/);
  assert.match(postCallAutomation, /beginPendingManualCall/);
  assert.match(postCallAutomation, /No answer/);
  assert.match(postCallAutomation, /Callback requested/);
  assert.match(postCallAutomation, /suggestedFollowUpLocal/);
});

test("Messages exposes persisted chat history from canonical conversations", () => {
  assert.match(messages, /listConversations/);
  assert.match(messages, /aria-label="Chat history"/);
  assert.match(messages, /ACTIVE CONVERSATION/);
  assert.match(messages, /Persisted chat history/);
  assert.match(messages, /conversation\.messages\.length/);
});

test("Messages can deliberately send a portal message through the canonical Resend transport", () => {
  assert.match(messages, /sendPortalEmail/);
  assert.match(messages, /Also send this by email/);
  assert.match(messages, /Start conversation \+ send email/);
  assert.match(messagesApi, /functions\.invoke\("send-communication"/);
  assert.match(messagesApi, /channel: "email"/);
  assert.match(messagesApi, /subjectId/);
  assert.match(sendCommunication, /requestedSubject/);
  assert.match(sendCommunication, /subject: emailSubject/);
});

test("canonical communication queue persists the provider selected for each channel", () => {
  assert.match(queueProviderRouting, /when lower\(p_channel\) in \('sms','call'\) then 'twilio'/);
  assert.match(queueProviderRouting, /when lower\(p_channel\)='email' then 'resend'/);
  assert.match(queueProviderRouting, /false,false,false,v_provider_name/);
  assert.match(queueProviderRouting, /content,provider_name,client_request_id,status,created_by/);
  assert.match(queueProviderRouting, /v_provider_name,p_client_request_id,v_status,auth\.uid\(\)/);
});

test("Community Store is fulfillment-gated and never claims HLC inventory or delivery", () => {
  assert.match(communityHub, /<CommunityStore \/>/);
  assert.match(communityHub, />HLC Store</);
  assert.match(communityStore, /VITE_HLC_MERCH_STORE_URL/);
  assert.match(communityStore, /third-party fulfillment provider/i);
  assert.match(communityStore, /does not represent an item as stocked, printed, shipped or delivered/i);
  assert.match(communityStore, /Checkout connection pending/);
});
