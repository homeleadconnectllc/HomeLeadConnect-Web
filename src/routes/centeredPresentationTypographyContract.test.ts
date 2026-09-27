import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entry = readFileSync(new URL("../styles/AuthenticatedStyles.tsx", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles/centered-presentation-typography.css", import.meta.url), "utf8");
const docs = readFileSync(new URL("../../docs/VISUAL_SYSTEM_REFERENCE.md", import.meta.url), "utf8");

test("centered presentation typography follows the authenticated family authority", () => {
  assert.match(entry, /import "\.\/centered-presentation-typography\.css";/);
  assert.ok(
    entry.indexOf('import "./connected-app-family-20260923.css";') <
      entry.indexOf('import "./centered-presentation-typography.css";'),
  );
});

test("presentation typography is centered across authenticated sections", () => {
  assert.match(css, /\.hlc-signed-in-shell > \.hlc-route-content main/);
  assert.match(css, /\.hlc-section-heading/);
  assert.match(css, /\.hlc-command-copy/);
  assert.match(css, /\.hlc-pulse-copy/);
  assert.match(css, /\.hlc-workspace-copy/);
  assert.match(css, /\.hlc-empty-state/);
  assert.doesNotMatch(css, /\.hlc-route-content main,\s*\.hlc-signed-in-shell/);
  assert.match(css, /text-align: center !important/);
});

test("functional reading and entry surfaces remain left aligned", () => {
  assert.match(css, /form/);
  assert.match(css, /label/);
  assert.match(css, /textarea/);
  assert.match(css, /table/);
  assert.match(css, /\.hlc-messages-thread/);
  assert.match(css, /\.hlc-chat-history-item/);
  assert.match(css, /\.hlc-lead-card-copy/);
  assert.match(css, /\.hlc-job-card-copy/);
  assert.match(css, /\.hlc-record-detail/);
  assert.match(css, /text-align: left !important/);
});

test("canonical visual reference records centered presentation typography and usability exceptions", () => {
  assert.match(docs, /## Typography alignment/);
  assert.match(docs, /Presentation typography is centered/);
  assert.match(docs, /Functional reading and entry surfaces remain left-aligned/);
  assert.match(docs, /forms? fields and labels/i);
  assert.match(docs, /data tables and record grids/i);
  assert.match(docs, /long-form messages and chat threads/i);
});
