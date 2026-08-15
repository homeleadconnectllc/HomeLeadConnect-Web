import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dock = readFileSync("src/components/agents/ContextualAgentDock.tsx", "utf8");
const dockCss = readFileSync("src/styles/contextual-agent-dock.css", "utf8");

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
