import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const chatRuntime = readFileSync("supabase/functions/hlc-agent-chat/index.ts", "utf8");

test("agent follow-up snapshot metrics are scoped to the active workspace", () => {
  const scopedFollowUpQueries = chatRuntime.match(
    /admin\.from\("follow_ups"\)[^\n]+\.eq\("workspace_id", workspaceId\)/g,
  ) ?? [];

  assert.equal(
    scopedFollowUpQueries.length,
    2,
    "Both due and overdue follow-up aggregate queries must be filtered by workspace_id.",
  );
});
