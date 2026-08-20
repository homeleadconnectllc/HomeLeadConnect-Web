import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const mobileProfessional = readFileSync("src/styles/mobile-professional-certification.css", "utf8");

test("mobile professional certification layer loads last for signed-in workspaces", () => {
  assert.match(authenticatedEntry, /global-readability-certification\.css";\s*import "\.\/mobile-professional-certification\.css";/);
});

test("mobile operational pages use readable contrast and flatter record surfaces", () => {
  assert.match(mobileProfessional, /\.hlc-chat-history-item\.is-selected[\s\S]*background: #eaf2ff !important;/);
  assert.match(mobileProfessional, /\.hlc-chat-history-item :is\(strong, span, small\)[\s\S]*color: #0f172a !important;/);
  assert.match(mobileProfessional, /\.hlc-lead-open-hint[\s\S]*background: transparent !important;/);
  assert.match(mobileProfessional, /\.hlc-job-card-copy small[\s\S]*background: transparent !important;/);
  assert.match(mobileProfessional, /\.hlc-business-pulse-section[\s\S]*color: #f8fafc !important;/);
});

test("mobile agent and navigation occupy separate viewport lanes", () => {
  assert.match(mobileProfessional, /\.hlc-agent-dock:not\(\.is-open\)[\s\S]*bottom: calc\(92px \+ env\(safe-area-inset-bottom\)\) !important;/);
  assert.match(mobileProfessional, /\.hlc-agent-dock\.is-open[\s\S]*inset: 12px 12px calc\(82px \+ env\(safe-area-inset-bottom\)\) 12px !important;/);
  assert.match(mobileProfessional, /\.hlc-mobile-tabbar \{[\s\S]*z-index: 1600 !important;/);
});
