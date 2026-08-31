import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const callCenter = readFileSync("src/pages/dashboard/CallCenter.tsx", "utf8");
const manualCommunications = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const manualCommunicationsMobile = readFileSync("src/styles/soft-launch-manual-communications-authority.css", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
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

test("Call Center exposes persisted call history and intelligent outcome logging without a duplicate call store", () => {
  assert.match(callCenter, /listCallSessions/);
  assert.match(callCenter, /recordCallDisposition/);
  assert.match(callCenter, />Call Log</);
  assert.match(callCenter, />Call History</);
  assert.match(callCenter, /Save intelligent disposition/);
  assert.match(callCenter, /Human confirmation required/);
});

test("manual communications is action-first while preserving canonical handoff and outcome logging", () => {
  const contact = manualCommunications.indexOf("Who are you contacting?");
  const channel = manualCommunications.indexOf("How do you want to reach them?");
  const open = manualCommunications.indexOf("Check &amp; open");
  const outcome = manualCommunications.indexOf("Record what happened");
  const advanced = manualCommunications.indexOf("Advanced options");
  const compliance = manualCommunications.indexOf("How HLC records manual calls and texts");

  assert.ok(contact >= 0 && channel > contact && open > channel && outcome > open);
  assert.ok(advanced > outcome && compliance > advanced);
  assert.match(manualCommunications, /Open Phone App/);
  assert.match(manualCommunications, /Open Messages/);
  assert.match(manualCommunications, /aria-pressed=\{channel === "call"\}/);
  assert.match(manualCommunications, /aria-pressed=\{channel === "sms"\}/);
  assert.match(manualCommunications, /Check before \$\{channel === "call" \? "calling" : "texting"\}/);
  assert.match(manualCommunications, /Only record the result after the call or text actually happened/);
  assert.match(manualCommunications, /startCallHandoff/);
  assert.match(manualCommunications, /quickSaveOutcome/);
  assert.match(manualCommunications, /logManualCommunicationActivity/);
  assert.match(manualCommunications, /createFollowUp/);
});

test("manual communications iPhone authority keeps controls readable and action cards compact", () => {
  assert.ok(
    authenticatedStyles.indexOf("soft-launch-manual-communications-authority.css") > authenticatedStyles.indexOf("soft-launch-mobile-dashboard-authority.css"),
    "manual communications soft-launch authority must load last",
  );
  assert.match(manualCommunicationsMobile, /:is\(input, select, textarea\)[\s\S]*background: #ffffff !important;[\s\S]*color: #172033 !important;/);
  assert.match(manualCommunicationsMobile, /::placeholder[\s\S]*color: #536176 !important;[\s\S]*opacity: 1 !important;/);
  assert.match(manualCommunicationsMobile, /aria-label="Choose call or text"\][\s\S]*button span[\s\S]*font-size: 14px !important;[\s\S]*word-break: normal !important;/);
  assert.match(manualCommunicationsMobile, /body\.hlc-page-manual-communications \.hlc-agent-dock:not\(\.is-open\)[\s\S]*transform: scale\(0\.8\) !important;/);
});

test("free Google Voice handoff returns to the canonical outcome and follow-up flow", () => {
  assert.match(manualCommunications, /Open Google Voice/);
  assert.match(manualCommunications, /What happened with \{selected\.label\}/);
  assert.match(postCallAutomation, /window\.sessionStorage/);
  assert.match(postCallAutomation, /beginPendingManualCall/);
  assert.match(postCallAutomation, /No answer/);
  assert.match(postCallAutomation, /Callback requested/);
  assert.match(postCallAutomation, /suggestedFollowUpLocal/);
});

test("manual communication compliance stays visible but secondary to the task flow", () => {
  assert.match(manualCommunications, /<details style=\{advancedStyle\}>/);
  assert.match(manualCommunications, /How HLC records manual calls and texts/);
  assert.match(manualCommunications, /HLC opens the selected device\/provider after a compliance check/);
  assert.match(manualCommunications, /It does not claim a call connected, a text delivered, or a provider synchronized unless provider evidence proves it/);
  assert.match(manualCommunications, /checkNativeDeviceAction/);
  assert.match(manualCommunications, /checkGoogleVoiceAction/);
});

test("Messages exposes persisted chat history from canonical conversations", () => {
  assert.match(messages, /listConversations/);
  assert.match(messages, /aria-label="Chat history"/);
  assert.match(messages, /ACTIVE CONVERSATION/);
  assert.match(messages, /Persisted conversation history/);
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
  assert.match(communityStore, /Checkout unavailable · storefront connection pending/);
  assert.match(communityStore, /role="status"/);
  assert.doesNotMatch(communityStore, /<button[^>]*disabled[\s\S]*Checkout/);
});