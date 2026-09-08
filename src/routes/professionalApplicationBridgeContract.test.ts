import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260908050000_professional_application_contractor_bridge.sql",
  "utf8",
);
const api = readFileSync("src/api/professionalApplications.ts", "utf8");

test("professional approval resolves one canonical contractor identity", () => {
  assert.match(migration, /create or replace function public\.approve_professional_application/i);
  assert.match(migration, /from public\.contractors c[\s\S]*c\.workspace_id = v_app\.workspace_id/i);
  assert.match(migration, /nullif\(lower\(btrim\(c\.email\)\), ''\) = v_email/i);
  assert.match(migration, /insert into public\.contractors/i);
  assert.match(migration, /returning id into v_contractor_id/i);
  assert.doesNotMatch(migration, /create\s+table\s+(if\s+not\s+exists\s+)?public\.provider_profiles/i);
});

test("professional approval fails closed instead of guessing ambiguous dedupe", () => {
  assert.match(migration, /v_match_count > 1/i);
  assert.match(migration, /same company name or phone may already exist/i);
  assert.match(migration, /pg_advisory_xact_lock/i);
  assert.match(migration, /workspace_id::text \|\| '\|' \|\| v_email/i);
});

test("professional approval uses membership authority and closes direct approval bypass", () => {
  assert.match(migration, /from public\.workspace_members wm/i);
  assert.match(migration, /lower\(coalesce\(wm\.role, ''\)\) in \('owner','manager'\)/i);
  assert.match(migration, /drop policy if exists professional_applications_management_update/i);
  assert.match(migration, /revoke update on table public\.professional_applications from authenticated/i);
  assert.match(migration, /set_professional_application_review_status/i);
  assert.match(migration, /Use the professional approval operation to approve an application/i);
});

test("approved application carries the same contractor id into portal access", () => {
  assert.match(migration, /contractor_id = v_contractor_id/i);
  assert.match(migration, /insert into public\.portal_invitations[\s\S]*v_contractor_id/i);
  assert.match(migration, /from public\.contractor_portal_links cpl[\s\S]*cpl\.contractor_id = v_contractor_id/i);
  assert.match(migration, /portal_role[\s\S]*'contractor'/i);
  assert.match(migration, /lower\(pi\.intended_email\) = v_email/i);
});

test("professional application API exposes review and canonical approval operations", () => {
  assert.match(api, /listProfessionalApplications/);
  assert.match(api, /setProfessionalApplicationReviewStatus/);
  assert.match(api, /approveProfessionalApplication/);
  assert.match(api, /approve_professional_application/);
  assert.match(api, /contractor_id: number/);
});
