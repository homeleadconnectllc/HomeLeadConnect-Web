import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const supabaseRuntime = readFileSync("src/lib/supabase.ts", "utf8");
const browserPrivileges = readFileSync("supabase/migrations/20260814143000_remove_browser_admin_table_privileges.sql", "utf8");
const providerCoordinates = readFileSync("supabase/migrations/20260814144914_secure_provider_map_coordinate_updates.sql", "utf8");
const activityLog = readFileSync("supabase/migrations/20260814145501_harden_activity_log_as_append_only.sql", "utf8");
const professionalIntake = readFileSync("supabase/migrations/20260814163950_professional_application_intake.sql", "utf8");

test("browser runtime uses only publishable Supabase credentials", () => {
  assert.match(supabaseRuntime, /VITE_SUPABASE_ANON_KEY/);
  assert.match(supabaseRuntime, /sb_publishable_/);
  assert.doesNotMatch(supabaseRuntime, /service[_-]?role|SUPABASE_SERVICE_ROLE|secret[_-]?key/i);
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
