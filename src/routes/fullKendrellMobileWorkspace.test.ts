import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/styles/mobile-agent-placement-contract.css", "utf8");

test("full Kendrell uses near-full-height mobile workspace geometry", () => {
  assert.match(css, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-agent-dock-panel \{[\s\S]*top: max\(12px, env\(safe-area-inset-top\)\) !important;[\s\S]*bottom: calc\(112px \+ env\(safe-area-inset-bottom\)\) !important;/);
  assert.match(css, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-chat \{[\s\S]*display: flex !important;[\s\S]*flex: 1 1 auto !important;[\s\S]*min-height: 0 !important;/);
  assert.match(css, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-transcript \{[\s\S]*flex: 1 1 auto !important;[\s\S]*min-height: 180px !important;[\s\S]*overflow-y: auto !important;/);
  assert.match(css, /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-composer \{[\s\S]*position: sticky !important;[\s\S]*bottom: 0 !important;[\s\S]*margin-top: auto !important;/);
});

test("briefing Kendrell keeps compact placement unchanged", () => {
  assert.match(css, /\.hlc-agent-dock\.has-briefing:not\(\.is-open\) \.hlc-agent-proactive-briefing \{[\s\S]*top: auto !important;[\s\S]*bottom: calc\(154px \+ env\(safe-area-inset-bottom\)\) !important;[\s\S]*max-height: min\(210px, 28dvh\) !important;/);
});
