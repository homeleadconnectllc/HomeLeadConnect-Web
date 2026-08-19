import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/styles/mobile-dashboard-certification.css", "utf8");
const main = readFileSync("src/main.tsx", "utf8");

test("mobile dashboard certification layer is mounted last", () => {
  const desktopIndex = main.indexOf("./styles/desktop-dashboard-certification.css");
  const mobileIndex = main.indexOf("./styles/mobile-dashboard-certification.css");
  assert.ok(desktopIndex >= 0);
  assert.ok(mobileIndex > desktopIndex);
});

test("AI team controls retain readable contrast", () => {
  assert.match(css, /\.hlc-agent-team-chip[\s\S]*background:\s*#1d4ed8 !important/);
  assert.match(css, /\.hlc-agent-team-chip[\s\S]*color:\s*#ffffff !important/);
  assert.match(css, /\.hlc-agent-card \.hlc-agent-open[\s\S]*color:\s*#bfdbfe !important/);
});

test("phone AI team layout stays single-column and removes redundant chip", () => {
  assert.match(css, /@media \(max-width:\s*720px\)/);
  assert.match(css, /\.hlc-agent-grid[\s\S]*grid-template-columns:\s*1fr !important/);
  assert.match(css, /\.hlc-agent-card[\s\S]*grid-template-columns:\s*1fr !important/);
  assert.match(css, /\.hlc-agent-team-chip[\s\S]*display:\s*none !important/);
});
