import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const placement = readFileSync("src/styles/mobile-agent-placement-contract.css", "utf8");

test("full mobile agents keep the composer inside the dynamic visual viewport", () => {
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-agent-dock-panel \{[\s\S]*top: max\(8px, env\(safe-area-inset-top\)\) !important;[\s\S]*bottom: max\(12px, env\(safe-area-inset-bottom\)\) !important;[\s\S]*height: calc\(100dvh - max\(8px, env\(safe-area-inset-top\)\) - max\(12px, env\(safe-area-inset-bottom\)\)\) !important;/,
  );
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-transcript \{[\s\S]*min-height: 0 !important;[\s\S]*overflow-y: auto !important;/,
  );
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-composer \{[\s\S]*position: sticky !important;[\s\S]*inset-block-end: 0 !important;[\s\S]*flex-shrink: 0 !important;/,
  );
  assert.match(placement, /body\.hlc-agent-open \{[\s\S]*overflow: hidden !important;[\s\S]*overscroll-behavior: none !important;/);
});

test("visual viewport fix does not move the compact live briefing", () => {
  assert.match(
    placement,
    /\.hlc-agent-dock\.has-briefing:not\(\.is-open\) \.hlc-agent-proactive-briefing \{[\s\S]*bottom: calc\(154px \+ env\(safe-area-inset-bottom\)\) !important;[\s\S]*max-height: min\(210px, 28dvh\) !important;/,
  );
});
