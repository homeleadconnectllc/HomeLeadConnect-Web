import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const notifications = readFileSync(new URL("../pages/dashboard/Notifications.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../styles/notifications-workspace.css", import.meta.url), "utf8");

test("notifications route uses a dedicated triage workspace instead of inline card styling", () => {
  assert.match(notifications, /import "\.\.\/\.\.\/styles\/notifications-workspace\.css";/);
  assert.match(notifications, /className="hlc-notifications-workspace"/);
  assert.match(notifications, /className="hlc-notifications-queue"/);
  assert.match(notifications, /hlc-notification-row/);
  assert.doesNotMatch(notifications, /cardStyle/);
  assert.doesNotMatch(notifications, /pageStyle/);
});

test("notification summary and queue use rails, dividers, and rows", () => {
  assert.match(styles, /\.hlc-notifications-summary \{/);
  assert.match(styles, /border-bottom: 1px solid/);
  assert.match(styles, /\.hlc-notification-row \{/);
  assert.match(styles, /grid-template-columns: 24px minmax\(0, 1fr\) auto;/);
  assert.match(styles, /\.hlc-notification-row\.is-unread/);
});

test("notifications retain a compact mobile operating layout", () => {
  assert.match(styles, /@media \(max-width: 720px\)/);
  assert.match(styles, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(styles, /\.hlc-notification-open span/);
});
