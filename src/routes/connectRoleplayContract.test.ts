import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const router = readFileSync(new URL("./AppRouter.tsx", import.meta.url), "utf8");
const workspace = readFileSync(new URL("../pages/dashboard/RoleplayKnowledgeWorkspace.tsx", import.meta.url), "utf8");
const sessionUi = readFileSync(new URL("../components/academy/ConnectRoleplaySession.tsx", import.meta.url), "utf8");
const client = readFileSync(new URL("../lib/connectRoleplayData.ts", import.meta.url), "utf8");
const runtime = readFileSync(new URL("../../supabase/functions/hlc-connect-roleplay/index.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../supabase/migrations/20260901193000_connect_roleplay_runtime.sql", import.meta.url), "utf8");

test("E3 mounts canonical CONNECT library and roleplay routes", () => {
  assert.match(router, /path="\/academy\/roleplay"/);
  assert.match(router, /path="\/academy\/library"/);
  assert.match(workspace, /ConnectRoleplaySession/);
  assert.match(workspace, /CONNECT CONVERSATION SYSTEM™/);
});

test("CONNECT roleplay UI is reactive, scored, coached, retryable, and recommendation-only", () => {
  assert.match(sessionUi, /sendConnectRoleplayTurn/);
  assert.match(sessionUi, /finishConnectRoleplay/);
  assert.match(sessionUi, /Finish & score/);
  assert.match(sessionUi, /Strengths/);
  assert.match(sessionUi, /Mistakes/);
  assert.match(sessionUi, /coaching/);
  assert.match(sessionUi, /Retry this scenario/);
  assert.match(sessionUi, /No CRM disposition was applied/);
  assert.match(sessionUi, /Confirmation remains required in the authorized CRM workflow/);
});

test("CONNECT browser client invokes the dedicated authenticated roleplay runtime", () => {
  assert.match(client, /supabase\.functions\.invoke\("hlc-connect-roleplay"/);
  assert.match(client, /academy_roleplay_sessions/);
  assert.match(client, /recommended_disposition_id/);
});

test("CONNECT runtime constrains model output and never applies a CRM disposition", () => {
  assert.match(runtime, /OPENAI_API_KEY/);
  assert.match(runtime, /auth\.getUser\(\)/);
  assert.match(runtime, /https:\/\/api\.openai\.com\/v1\/responses/);
  assert.match(runtime, /allowedDispositionIds\.includes/);
  assert.match(runtime, /academy_record_roleplay_session/);
  assert.match(runtime, /academy_record_activity/);
  assert.match(runtime, /dispositionApplied: false/);
  assert.match(runtime, /requiresCrmConfirmation/);
  assert.doesNotMatch(runtime, /from\("leads"\)\.update/);
  assert.doesNotMatch(runtime, /from\("crm_jobs"\)\.update/);
});

test("CONNECT roleplay persistence is own-user readable and browser-write closed", () => {
  assert.match(migration, /alter table public\.academy_roleplay_sessions enable row level security/i);
  assert.match(migration, /grant select on public\.academy_roleplay_sessions to authenticated/i);
  assert.match(migration, /user_id = \(select auth\.uid\(\)\)/i);
  assert.match(migration, /revoke all on function public\.academy_record_roleplay_session[\s\S]*from public, anon, authenticated/i);
  assert.match(migration, /Browser roles cannot submit scores, coaching, transcripts, or CRM disposition recommendations/i);
});
