import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const placement = readFileSync("src/styles/mobile-agent-placement-contract.css", "utf8");

test("full mobile agents keep the composer inside a bounded dynamic viewport sheet", () => {
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-agent-dock-panel \{[\s\S]*top: auto !important;[\s\S]*right: max\(10px, env\(safe-area-inset-right\)\) !important;[\s\S]*bottom: max\(12px, env\(safe-area-inset-bottom\)\) !important;[\s\S]*left: max\(10px, env\(safe-area-inset-left\)\) !important;[\s\S]*height: auto !important;[\s\S]*max-height: min\(86dvh, 760px\) !important;/,
  );
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-transcript \{[\s\S]*flex: 1 1 auto !important;[\s\S]*min-height: 84px !important;[\s\S]*max-height: none !important;[\s\S]*overflow-y: auto !important;/,
  );
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-composer \{[\s\S]*position: sticky !important;[\s\S]*inset-block-end: 0 !important;[\s\S]*flex-shrink: 0 !important;[\s\S]*margin-top: 0 !important;/,
  );
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-composer textarea \{[\s\S]*min-height: 68px !important;[\s\S]*max-height: 112px !important;/,
  );
  assert.match(placement, /body\.hlc-agent-open \{[\s\S]*overflow: hidden !important;[\s\S]*overscroll-behavior: none !important;/);
});

test("full mobile agents do not reserve empty space above or below the composer", () => {
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-agent-tutorial \{[\s\S]*flex-grow: 0 !important;[\s\S]*min-height: 0 !important;[\s\S]*max-height: min\(13dvh, 92px\) !important;/,
  );
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-transcript:empty \{[\s\S]*flex: 0 0 12px !important;[\s\S]*max-height: 12px !important;/,
  );
  assert.match(
    placement,
    /\.hlc-agent-dock\.is-open:not\(\.has-briefing\) \.hlc-ai-chat \{[\s\S]*flex: 1 1 auto !important;[\s\S]*padding-bottom: 8px !important;/,
  );
});

test("visual viewport fix does not move the compact live briefing", () => {
  assert.match(
    placement,
    /\.hlc-agent-dock\.has-briefing:not\(\.is-open\) \.hlc-agent-proactive-briefing \{[\s\S]*bottom: calc\(154px \+ env\(safe-area-inset-bottom\)\) !important;[\s\S]*max-height: min\(210px, 28dvh\) !important;/,
  );
});
