import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const state = readFileSync("src/lib/durableOfflineState.ts", "utf8");
const status = readFileSync("src/components/connectivity/ConnectivityStatus.tsx", "utf8");
const layout = readFileSync("src/routes/AppLayout.tsx", "utf8");

test("durable offline state uses IndexedDB rather than volatile memory", () => {
  assert.match(state, /indexedDB\.open/);
  assert.match(state, /message-draft/);
  assert.match(state, /note-draft/);
  assert.match(state, /form-draft/);
  assert.match(state, /event-draft/);
});

test("durable records are scoped to the signed-in user", () => {
  assert.match(state, /userId\.trim\(\)/);
  assert.match(state, /scopedKey\(userId/);
});

test("workspace shell exposes connection loss without blocking public intake", () => {
  assert.match(status, /navigator\.onLine/);
  assert.match(status, /role="status"/);
  assert.match(layout, /ConnectivityStatus/);
  assert.match(layout, /signedInWorkspaceShell && <ConnectivityStatus/);
});
