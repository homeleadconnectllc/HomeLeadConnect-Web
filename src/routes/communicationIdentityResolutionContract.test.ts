import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260921232736_harden_communication_subject_identity_resolution.sql",
  "utf8",
);
const webhook = readFileSync("supabase/functions/twilio-webhook/index.ts", "utf8");

test("inbound communication identity resolution fails closed on endpoint ambiguity", () => {
  assert.match(migration, /create or replace function public\.resolve_communication_subject/i);
  assert.match(migration, /security invoker/i);
  assert.match(migration, /set search_path to ''/i);
  assert.match(migration, /regexp_replace\(coalesce\([^)]*phone[^)]*\),'\[\^0-9\]','','g'\)/i);
  assert.match(migration, /if v_match_count>1 then[\s\S]*'status','ambiguous'[\s\S]*candidate_count/i);
  assert.match(migration, /return v_result \|\| jsonb_build_object\('status','matched'\)/i);
  assert.match(migration, /revoke all on function public\.resolve_communication_subject\(uuid,text,text\) from public,anon,authenticated/i);
  assert.match(migration, /grant execute on function public\.resolve_communication_subject\(uuid,text,text\) to service_role/i);
});

test("Twilio inbound handlers attach only when the resolver returns an explicit subject", () => {
  assert.match(webhook, /const subjectType = subject\?\.subject_type/);
  assert.match(webhook, /const subjectId = subject\?\.subject_id/);
  assert.match(webhook, /if \(subjectType && subjectId\)/);
  assert.match(webhook, /current_lead_id:subject\?\.subject_type==="lead"\?Number\(subject\.subject_id\):null/);
  assert.match(webhook, /subject_type:subject\?\.subject_type\|\|null/);
  assert.match(webhook, /if\(subject\?\.subject_type&&subject\?\.subject_id\)/);
});
