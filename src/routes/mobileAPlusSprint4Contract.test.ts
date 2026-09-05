import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/mobile-a-plus-sprint-4-community-messages.css", "utf8");
const communityV2 = readFileSync("src/styles/community-hub-source-authority.css", "utf8");
const styleEntry = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const drafts = readFileSync("src/components/messages/MessageDraftPersistence.tsx", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const messages = readFileSync("src/pages/dashboard/Messages.tsx", "utf8");
const community = readFileSync("src/pages/dashboard/CommunityHub.tsx", "utf8");
const recorder = readFileSync("src/components/messages/VoiceNoteRecorder.tsx", "utf8");

test("Sprint 4 mobile authority mounts after Sprint 3 without replacing desktop authority", () => {
  const sprint3 = styleEntry.indexOf("./mobile-a-plus-sprint-3-network.css");
  const sprint4 = styleEntry.indexOf("./mobile-a-plus-sprint-4-community-messages.css");
  assert.ok(sprint3 >= 0);
  assert.ok(sprint4 > sprint3);
  assert.match(styles, /@media \(max-width: 760px\)/);
});

test("Sprint 4 keeps Community v2 content-first and touch-safe on compact screens", () => {
  assert.match(community, /hlc-community-v2-commandbar/);
  assert.match(community, /hlc-community-v2-row/);
  assert.match(communityV2, /@media\(max-width:760px\)/);
  assert.match(communityV2, /\.hlc-community-v2-commandbar\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
  assert.match(communityV2, /\.hlc-community-v2-row\{grid-template-columns:1fr!important/);
  assert.match(communityV2, /\.hlc-community-v2-row-action\{width:100%!important/);
  assert.match(communityV2, /\.hlc-community-v2-row-action\{[^}]*min-height:44px!important/);
  assert.match(communityV2, /\.hlc-community-v2-commandbar>a\{[^}]*min-height:44px!important/);
});

test("Sprint 4 makes Messages keyboard-conscious and bottom-navigation safe", () => {
  assert.match(messages, /hlc-message-composer/);
  assert.match(styles, /\.hlc-message-composer\s*\{[\s\S]*position: sticky/);
  assert.match(styles, /bottom: calc\(72px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(styles, /font-size: 16px/);
  assert.match(styles, /padding: 0 16px calc\(92px \+ env\(safe-area-inset-bottom\)\)/);
});

test("Sprint 4 preserves message drafts without changing server message authority", () => {
  assert.match(app, /MessageDraftPersistence/);
  assert.match(drafts, /sessionStorage\.setItem/);
  assert.match(drafts, /sessionStorage\.getItem/);
  assert.match(drafts, /hlc-message-quick-compose/);
  assert.match(drafts, /hlc-message-composer/);
  assert.match(messages, /startPortalConversation/);
  assert.match(messages, /postInternalMessage/);
});

test("Sprint 4 preserves explicit voice-note controls and fallback path", () => {
  assert.match(recorder, /MediaRecorder/);
  assert.match(recorder, /Cancel/);
  assert.match(recorder, /hlc-audio-file-action/);
  assert.match(messages, /VoiceNoteRecorder/);
  assert.match(messages, /uploadVoiceNote/);
});

test("Sprint 4 respects reduced motion for mobile navigation rails", () => {
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /scroll-behavior: auto/);
});
