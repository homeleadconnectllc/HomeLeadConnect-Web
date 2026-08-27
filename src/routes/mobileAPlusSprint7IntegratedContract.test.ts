import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const styles = readFileSync("src/styles/mobile-a-plus-sprint-7-integrated-accessibility.css", "utf8");
const styleEntry = readFileSync("src/styles/AuthenticatedStyles.tsx", "utf8");
const router = readFileSync("src/routes/AppRouter.tsx", "utf8");

const sprintAuthorities = [
  "./mobile-a-plus-sprint-3-network.css",
  "./mobile-a-plus-sprint-4-community-messages.css",
  "./mobile-a-plus-sprint-5-community-participation.css",
  "./mobile-a-plus-sprint-6-account-portals-resources.css",
  "./mobile-a-plus-sprint-7-integrated-accessibility.css",
];

test("Sprint 7 integrated authority mounts after all prior Mobile A+ sprint authorities", () => {
  let previous = -1;
  for (const authority of sprintAuthorities) {
    const index = styleEntry.indexOf(authority);
    assert.ok(index > previous, `${authority} must mount after the prior sprint authority`);
    previous = index;
  }
});

test("Sprint 7 encodes iPhone touch and WCAG focus safeguards", () => {
  assert.match(styles, /button,[\s\S]*summary,[\s\S]*\[role="button"\][\s\S]*min-height: 44px/);
  assert.match(styles, /:focus-visible[\s\S]*outline: 3px solid/);
  assert.match(styles, /scroll-margin-bottom: calc\(128px \+ env\(safe-area-inset-bottom\)\)/);
  assert.match(styles, /scroll-padding-bottom: calc\(120px \+ env\(safe-area-inset-bottom\)\)/);
});

test("Sprint 7 protects text enlargement, mobile forms and viewport containment", () => {
  assert.match(styles, /-webkit-text-size-adjust: 100%/);
  assert.match(styles, /input:not\(\[type="checkbox"\]\):not\(\[type="radio"\]\),[\s\S]*font-size: 16px/);
  assert.match(styles, /body[\s\S]*overflow-x: clip/);
  assert.match(styles, /\[role="dialog"\],[\s\S]*max-height: calc\(100dvh/);
});

test("Sprint 7 provides non-color state reinforcement and accessibility preference handling", () => {
  assert.match(styles, /\[aria-pressed="true"\],[\s\S]*\[aria-current="page"\]/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(styles, /@media \(forced-colors: active\)/);
  assert.match(styles, /@media \(prefers-contrast: more\)/);
});

test("Sprint 7 integrated route sweep includes every major Mobile A+ acceptance surface", () => {
  for (const route of [
    "/dashboard", "/leads", "/jobs", "/follow-ups", "/messages", "/network", "/map",
    "/community-hub", "/community/discussions", "/community/reviews", "/community/referrals",
    "/homeowner-portal", "/contractor-portal", "/settings", "/settings/billing", "/documents",
    "/help", "/tutorials", "/rules", "/call-center",
  ]) {
    assert.ok(router.includes(`path="${route}"`), `${route} must remain in the integrated acceptance route set`);
  }
});
