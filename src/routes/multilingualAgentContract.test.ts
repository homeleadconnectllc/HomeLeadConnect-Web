import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const locale = readFileSync("src/lib/agentLocale.ts", "utf8");
const localeQuality = readFileSync("src/lib/agentLocaleQuality.ts", "utf8");
const panel = readFileSync("src/components/agents/AgentChatPanel.tsx", "utf8");
const chatApi = readFileSync("src/api/agentChat.ts", "utf8");
const voiceClient = readFileSync("src/lib/agentVoice.ts", "utf8");
const voiceEdge = readFileSync("supabase/functions/hlc-agent-voice/index.ts", "utf8");
const styles = readFileSync("src/styles/agent-multilingual.css", "utf8");
const styleEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");

test("all three agents share one persisted multilingual layer with selector and auto detection", () => {
  assert.match(locale, /export type AgentLocale = "auto"/);
  assert.match(locale, /const STORAGE_KEY = "hlc\.agentLocale\.v1"/);
  assert.match(locale, /export function detectAgentLocale/);
  assert.match(locale, /export function resolveAgentLocale/);
  assert.match(panel, /agentLocaleOptions/);
  assert.match(panel, /<select value=\{localePreference\}/);
  assert.match(panel, /saveAgentLocalePreference\(next\)/);
  assert.match(panel, /resolveAgentLocale\(localePreference, clean, browserLocale\)/);
  assert.match(panel, /data-agent-locale=\{activeLocale\}/);
});

test("chat presentation translates without silently rewriting canonical HLC records", () => {
  assert.match(chatApi, /buildAgentLocaleDirective\(locale\)/);
  assert.match(locale, /preserving canonical HLC record meaning/);
  assert.match(locale, /Never rewrite or imply changes to canonical records/);
  assert.match(locale, /consent, pricing, scheduling, confirmations/);
  assert.match(chatApi, /getLocalizedAgentFallback\(agentId, locale\)/);
});

test("all supported languages enforce native on-topic evidence-based HLC guidance", () => {
  assert.match(localeQuality, /"en-US"/);
  assert.match(localeQuality, /"es-US"/);
  assert.match(localeQuality, /"fr-FR"/);
  assert.match(localeQuality, /"pt-BR"/);
  assert.match(localeQuality, /"zh-CN"/);
  assert.match(localeQuality, /"ar-SA"/);
  assert.match(localeQuality, /Answer the user's actual question or objective first and stay on the same subject/);
  assert.match(localeQuality, /Keep the current HLC page, workflow stage, authorized evidence, agent role, and requested task as the center/);
  assert.match(localeQuality, /Do not pad the response with generic conversation/);
  assert.match(localeQuality, /Translate meaning, not sentence structure/);
  assert.match(localeQuality, /Never invent a fact, workflow state, customer intent, provider status, appointment, payment, message delivery, completion/);
  assert.match(localeQuality, /The language changes; their responsibility, authority, reasoning quality, and HLC knowledge do not/);
  assert.match(localeQuality, /natural, neutral Spanish appropriate for a US audience/);
  assert.match(localeQuality, /Avoid awkward literal calques, unnecessary Spanglish/);
  assert.match(chatApi, /buildAgentLocaleQualityDirective/);
  assert.match(chatApi, /buildAgentLocaleDirective\(locale\).*buildAgentLocaleQualityDirective\(locale\)/s);
  assert.match(chatApi, /body: \{ agentId, message, history: localeAwareHistory, pagePath, locale \}/);
});

test("voice input and neural playback both follow the resolved locale", () => {
  assert.match(panel, /recognition\.lang = activeLocale/);
  assert.match(panel, /speakAgentText\(agentId, text, locale, \(\) => setVoicePhase\("speaking"\)\)/);
  assert.match(voiceClient, /body: JSON\.stringify\(\{ agentId, text: cleanText, locale \}\)/);
  assert.match(voiceEdge, /Use Spanish pronunciation and rhythm/);
  assert.match(voiceEdge, /Use French pronunciation and rhythm/);
  assert.match(voiceEdge, /Use Brazilian Portuguese pronunciation and rhythm/);
  assert.match(voiceEdge, /Use Mandarin pronunciation and rhythm/);
  assert.match(voiceEdge, /Use Arabic pronunciation and rhythm/);
  assert.match(voiceEdge, /if \(locale !== "en-US"\) return text/);
});

test("Kendrell pronunciation and single authoritative playback remain launch-locked", () => {
  assert.match(voiceEdge, /pronounced Ken-Drayl/);
  assert.match(voiceEdge, /replace\(\/\\bKendrell\\b\/gi, "Ken-Drayl"\)/);
  assert.match(voiceClient, /const generation = \+\+speechGeneration/);
  assert.match(voiceClient, /activeSpeechAbortController\?\.abort\(\)/);
  assert.match(voiceClient, /stopActiveSources\(\)/);
});

test("multilingual controls remain rendered on desktop and mobile", () => {
  assert.match(styleEntry, /import "\.\/agent-multilingual\.css"/);
  assert.match(styles, /\.hlc-ai-language-control/);
  assert.match(styles, /@media \(max-width: 720px\)/);
  assert.match(styles, /\.hlc-agent-dock\.is-open \.hlc-ai-chat-head[\s\S]*display: flex !important/);
  assert.match(panel, /dir=\{activeLocale === "ar-SA" \? "rtl" : "auto"\}/);
});
