import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const callCenter = readFileSync("src/pages/dashboard/CallCenter.tsx", "utf8");
const manualCommunications = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const postCallAutomation = readFileSync("src/lib/postCallAutomation.ts", "utf8");
const messages = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const messagesApi = readFileSync("src/api/messages.ts", "utf8");
const sendCommunication = readFileSync("supabase/functions/send-communication/index.ts", "utf8");
const providerNeutralRouting = readFileSync(
  "supabase/migrations/20260822175000_provider_neutral_communication_resolution.sql",
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

test("Messages can deliberately send a portal message through the canonical email transport", () => {
  assert.match(messages, /sendPortalEmail/);
  assert.match(messages, /Also send this by email/);
  assert.match(messages, /Start conversation \+ send email/);
  assert.match(messagesApi, /functions\.invoke\("send-communication"/);
  assert.match(messagesApi, /channel: "email"/);
  assert.match(messagesApi, /subjectId/);
  assert.match(sendCommunication, /requestedSubject/);
  assert.match(sendCommunication, /subject: emailSubject/);
});

test("canonical communication queue resolves provider from workspace configuration", () => {
  assert.match(providerNeutralRouting, /from public\.communication_provider_connections pc/);
  assert.match(providerNeutralRouting, /pc\.workspace_id=v_workspace_id/);
  assert.match(providerNeutralRouting, /pc\.channel=lower\(p_channel\)/);
  assert.match(providerNeutralRouting, /pc\.status in \('connected','manual_available'\)/);
  assert.match(providerNeutralRouting, /case pc\.status when 'connected' then 0 else 1 end/);
  assert.match(providerNeutralRouting, /false,false,false,v_provider_name/);
  assert.match(providerNeutralRouting, /provider_name,client_request_id,status,created_by/);
  assert.doesNotMatch(providerNeutralRouting, /when lower\(p_channel\) in \('sms','call'\) then 'twilio'/);
  assert.doesNotMatch(providerNeutralRouting, /when lower\(p_channel\)='email' then 'resend'/);
});

test("manual providers remain honest handoffs and unknown adapters never fall back to Twilio", () => {
  assert.match(providerNeutralRouting, /v_provider_status='manual_available'[\s\S]*then 'review'/);
  assert.match(sendCommunication, /providerConnection\?\.status === "manual_available"/);
  assert.match(sendCommunication, /delivery_mode: "manual_handoff"/);
  assert.match(sendCommunication, /providerName === "resend" && channel === "email"/);
  assert.match(sendCommunication, /providerName === "twilio" && \(channel === "sms" \|\| channel === "call"\)/);
  assert.match(sendCommunication, /PROVIDER_ADAPTER_NOT_INSTALLED/);
  assert.match(sendCommunication, /delivery_mode: providerConnection\?\.status === "manual_available" \? "manual_handoff" : "adapter_required"/);
  assert.doesNotMatch(sendCommunication, /const providerName = channel ===/);
});

test("Community Store is fulfillment-gated and never claims HLC inventory or delivery", () => {
  assert.match(communityHub, /<CommunityStore \/>/);
  assert.match(communityHub, />HLC Store</);
  assert.match(communityStore, /VITE_HLC_MERCH_STORE_URL/);
  assert.match(communityStore, /third-party fulfillment provider/i);
  assert.match(communityStore, /does not represent an item as stocked, printed, shipped or delivered/i);
  assert.match(communityStore, /Checkout connection pending/);
});
