import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const launchSurface = fs.readFileSync(new URL("../pages/dashboard/LaunchSurface.tsx", import.meta.url), "utf8");
const ecosystemRecords = fs.readFileSync(new URL("../api/ecosystemRecords.ts", import.meta.url), "utf8");

test("community moderation selects real content instead of requiring an internal post ID", () => {
  assert.doesNotMatch(launchSurface, /<label>Post ID<input/);
  assert.match(launchSurface, /<label>Community item<select/);
  assert.match(launchSurface, /listCommunityPosts\(\)/);
  assert.match(launchSurface, /posts\.map\(post=>/);
  assert.match(launchSurface, /Internal post IDs are never required from the operator\./);
});

test("moderation report submission remains wired to the existing report API", () => {
  assert.match(launchSurface, /createReport\(\{postId,reason\}\)/);
  assert.match(launchSurface, /resolveReport\(id,status\)/);
  assert.match(launchSurface, /disabled=\{busy\|\|posts\.length===0\}/);
});

test("community moderation resolution is explicitly scoped to the current workspace", () => {
  assert.match(ecosystemRecords, /resolveReport\(id:string,status:"resolved"\|"dismissed"\)\{const\{workspaceId,userId\}=await context\(\)/);
  assert.match(ecosystemRecords, /from\("community_reports"\)\.update\(\{status,resolved_at:new Date\(\)\.toISOString\(\),resolved_by:userId\}\)\.eq\("workspace_id",workspaceId\)\.eq\("id",id\)/);
});
