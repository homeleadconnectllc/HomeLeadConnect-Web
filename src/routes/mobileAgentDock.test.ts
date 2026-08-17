import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const dockCss = readFileSync("src/styles/contextual-agent-dock.css", "utf8");
const widthContract = readFileSync("src/styles/agent-panel-width-contract.css", "utf8");
const finalReleaseGuard = readFileSync("src/styles/final-release-guard.css", "utf8");
const mainEntry = readFileSync("src/main.tsx", "utf8");

test("mobile contextual AI uses one compact route-resolved avatar above the work dock", () => {
  assert.match(dock, /const agent = useMemo\(\(\) => resolveAgent\(location\.pathname, access\)/);
  assert.match(dock, /data-agent=\{agent\.id\}/);
  assert.match(dock, /aria-label=\{`\$\{open \? "Close" : "Open"\} \$\{agent\.name\} contextual assistant`\}/);
  assert.match(dock, /className="hlc-agent-panel-avatar"/);
  assert.match(dockCss, /bottom: calc\(154px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(dockCss, /\.hlc-agent-dock-trigger span \{ display: none; \}/);
  assert.match(dockCss, /\.hlc-agent-greeting \{ display: none; \}/);
  assert.match(dockCss, /width: 52px;/);
  assert.match(dockCss, /inset: auto 12px calc\(154px \+ env\(safe-area-inset-bottom\)\) 12px;/);
});

test("closed mobile agent rail cannot constrain the open viewport agent", () => {
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock:not\(\.is-open\) \{[\s\S]*width: 54px !important;[\s\S]*max-width: 54px !important;/);
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock\.is-open \{[\s\S]*inset: 0 !important;[\s\S]*width: 100vw !important;[\s\S]*max-width: none !important;/);
  assert.match(finalReleaseGuard, /\.hlc-signed-in-shell \.hlc-agent-dock\.is-open \.hlc-agent-dock-panel \{[\s\S]*left: 0 !important;[\s\S]*right: 0 !important;[\s\S]*width: 100vw !important;/);
});

test("agent width contract provides a full mobile sheet and substantial desktop command panel", () => {
  assert.match(mainEntry, /import "\.\/styles\/agent-panel-width-contract\.css";/);
  assert.match(widthContract, /@media \(min-width: 721px\)[\s\S]*\.hlc-agent-dock\.is-open \{[\s\S]*width: min\(620px, calc\(100vw - 48px\)\)/);
  assert.match(widthContract, /\.hlc-agent-dock\.is-open \.hlc-agent-dock-panel \{[\s\S]*min-width: min\(520px, calc\(100vw - 48px\)\)/);
  assert.match(widthContract, /@media \(max-width: 720px\)[\s\S]*\.hlc-agent-dock\.is-open \{[\s\S]*width: 100vw !important;[\s\S]*min-width: 100vw !important;[\s\S]*max-width: none !important;/);
  assert.match(widthContract, /\.hlc-agent-dock\.is-open \.hlc-agent-dock-panel \{[\s\S]*left: 0 !important;[\s\S]*right: 0 !important;[\s\S]*width: 100vw !important;/);
});
