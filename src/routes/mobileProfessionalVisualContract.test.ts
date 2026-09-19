import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authenticatedEntry = readFileSync("src/styles/authenticated-entry.ts", "utf8");
const authenticatedStyles = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const shell = readFileSync("src/styles/authenticated-mobile-shell-authority.css", "utf8");
const finalDevice = readFileSync("src/styles/mobile-a-plus-final-device-corrections.css", "utf8");
const navbar = readFileSync("src/components/Navbar.tsx", "utf8");
const commandSearch = readFileSync("src/components/search/GlobalCommandSearch.tsx", "utf8");

test("retired mobile visual certification stacks stay disconnected", () => {
  for (const retired of [
    "global-readability-certification.css",
    "mobile-professional-certification.css",
    "mobile-all-screens-certification.css",
    "five-star-mobile-foundation.css",
    "five-star-mobile-routes.css",
    "five-star-mobile-physical-qa.css",
    "five-star-mobile-physical-resources.css",
    "mobile-a-plus.css",
  ]) {
    assert.ok(!authenticatedEntry.includes(retired));
    assert.ok(!authenticatedStyles.includes(retired));
  }
});

test("current mobile shell owns structural header and route geometry without theme paint", () => {
  assert.match(shell, /\.hlc-signed-in-shell > \.hlc-navbar/);
  assert.match(shell, /max-height:\s*76px !important/);
  assert.match(shell, /flex-direction:\s*row !important/);
  assert.match(shell, /\.hlc-route-content > main/);
});

test("current compact-device safety owns agent and keyboard viewport behavior", () => {
  assert.match(finalDevice, /\.hlc-agent-dock:not\(\.is-open\)/);
  assert.match(finalDevice, /width:60px!important/);
  assert.match(finalDevice, /height:60px!important/);
  assert.match(finalDevice, /body\.hlc-keyboard-open \.hlc-mobile-tabbar/);
  assert.match(finalDevice, /--hlc-visual-viewport-height/);
});

test("More keeps first-class search, alerts, profile and settings without retired portal geometry", () => {
  assert.match(navbar, /hlc-mobile-command-search-trigger/);
  assert.match(navbar, /hlc-mobile-more-quick/);
  assert.match(navbar, />Notifications</);
  assert.match(navbar, />My profile</);
  assert.match(navbar, />Settings</);
  assert.match(navbar, /dispatchEvent\(new Event\(OPEN_HLC_COMMAND_SEARCH\)\)/);
  assert.doesNotMatch(commandSearch, /querySelector<HTMLElement>\("\.hlc-mobile-portal-scroll"\)/);
  assert.doesNotMatch(commandSearch, /createPortal/);
});
