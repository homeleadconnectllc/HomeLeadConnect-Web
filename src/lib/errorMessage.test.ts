import assert from "node:assert/strict";
import test from "node:test";
import { errorMessage } from "./errorMessage.ts";

test("database diagnostics and missing schema details never reach the UI", () => {
  for (const reason of [
    { code: "42703", message: 'column "internal_lead_score" does not exist' },
    { code: "PGRST204", message: "Could not find the 'secret_field' column of 'leads' in the schema cache" },
    new Error('relation "private.workspace_accounts" does not exist'),
    new Error("Invalid API key for VITE_SUPABASE_ANON_KEY"),
  ]) {
    assert.equal(errorMessage(reason, "Unable to load your workspace."), "Service temporarily unavailable. Please try again.");
  }
});

test("known permission and validation outcomes keep actionable public wording", () => {
  assert.equal(errorMessage({ code: "42501", message: "permission denied for relation private.users" }, "Failed"), "You do not have permission to perform this action.");
  assert.equal(errorMessage({ code: "23505", message: "duplicate key value violates unique constraint" }, "Failed"), "A matching active record already exists.");
  assert.equal(errorMessage(new Error("Please choose a date in the future."), "Failed"), "Please choose a date in the future.");
});
