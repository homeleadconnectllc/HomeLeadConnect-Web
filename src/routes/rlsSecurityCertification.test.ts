import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const supabaseRuntime = readFileSync("src/lib/supabase.ts", "utf8");
const browserPrivileges = readFileSync("supabase/migrations/20260814143000_remove_browser_admin_table_privileges.sql", "utf8");
const providerCoordinates = readFileSync("supabase/migrations/20260814144914_secure_provider_map_coordinate_updates.sql", "utf8");
const activityLog = readFileSync("supabase/migrations/20260814145501_harden_activity_log_as_append_only.sql", "utf8");
const professionalIntake = readFileSync("supabase/migrations/20260814163950_professional_application_intake.sql", "utf8");
const activePerformanceBatch = readFileSync(
  "supabase/migrations/20260822114000_optimize_active_rls_and_communication_fk_indexes.sql",
  "utf8",
);

test("browser runtime uses only publishable Supabase credentials", () => {
  assert.match(supabaseRuntime, /VITE_SUPABASE_ANON_KEY/);
  assert.match(supabaseRuntime, /sb_publishable_/);
  const elevatedCredentialMarkers = [
    ["service", "role"].join("_"),
    ["SUPABASE", "SERVICE", "ROLE"].join("_"),
    ["secret", "key"].join("_"),
  ];
  for (const marker of elevatedCredentialMarkers) {
    assert.equal(supabaseRuntime.toLowerCase().includes(marker.toLowerCase()), false);
  }
  assert.match(supabaseRuntime, /app\.homeleadconnect\.org/);
  assert.doesNotMatch(supabaseRuntime, /Netlify/i);
});

test("browser roles cannot self-promote or gain administration-like table privileges", () => {
  assert.match(browserPrivileges, /REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLE/i);
  assert.match(browserPrivileges, /REVOKE UPDATE ON TABLE public\.profiles FROM authenticated/i);
  assert.match(browserPrivileges, /GRANT UPDATE\(full_name, avatar_url, onboarding_completed, onboarding_step, updated_at\)/i);
  assert.match(browserPrivileges, /workspace_members_insert_management/);
  assert.match(browserPrivileges, /workspace_members_delete_management/);
  assert.match(browserPrivileges, /existing\.workspace_id=workspace_members\.workspace_id/);
  assert.match(browserPrivileges, /IN \('owner','manager'\)|IN \('owner', 'manager'\)/i);
});

test("management-only provider coordinates stay workspace and role constrained", () => {
  assert.match(providerCoordinates, /workspace_id/i);
  assert.match(providerCoordinates, /owner/i);
  assert.match(providerCoordinates, /manager/i);
  assert.match(providerCoordinates, /auth\.uid\(\)/i);
});

test("activity history remains append-only to authenticated browser clients", () => {
  assert.match(activityLog, /revoke update, delete on public\.activity_log from authenticated/i);
});

test("anonymous professional intake cannot directly read or mutate its backing table", () => {
  assert.match(professionalIntake, /enable row level security/i);
  assert.match(professionalIntake, /security definer/i);
  assert.match(professionalIntake, /revoke all on table public\.professional_applications from public, anon, authenticated/i);
});

test("active performance batch preserves RLS authority while optimizing caller evaluation", () => {
  for (const policy of [
    "workspace members can insert sessions",
    "workspace members can select sessions",
    "workspace members can update sessions",
    "public_forms_select_workspace",
    "public_forms_insert_workspace",
    "public_forms_update_workspace",
    "public_forms_delete_workspace",
    "subscriptions_select_own_workspace",
  ]) {
    assert.match(activePerformanceBatch, new RegExp(policy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(activePerformanceBatch, /where wm\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(activePerformanceBatch, /where p\.user_id = \(select auth\.uid\(\)\)/);
  assert.doesNotMatch(activePerformanceBatch, /drop policy[^\n]*telephony_call_sessions_member_select/i);
  assert.doesNotMatch(activePerformanceBatch, /drop index/i);
});

test("active communication FK batch adds only evidence-backed covering indexes", () => {
  for (const indexName of [
    "business_phone_numbers_provider_connection_id_idx",
    "call_sessions_business_phone_id_idx",
    "call_sessions_compliance_check_id_idx",
    "call_sessions_conversation_id_idx",
    "call_sessions_requested_by_idx",
    "communication_compliance_checks_actor_user_id_idx",
    "communication_provider_events_call_session_id_idx",
    "communication_provider_events_transmission_id_idx",
  ]) {
    assert.match(activePerformanceBatch, new RegExp(`create index if not exists ${indexName}`, "i"));
  }
});
