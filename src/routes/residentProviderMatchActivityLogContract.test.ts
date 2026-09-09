import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260909220500_fix_resident_provider_match_activity_log.sql", import.meta.url),
  "utf8",
);

describe("Resident provider-match activity logging contract", () => {
  it("logs the canonical lead UUID for both proposal and resident decision events", () => {
    expect(migration).toContain("create or replace function public.create_resident_provider_match");
    expect(migration).toContain("create or replace function public.homeowner_decide_provider_match");
    expect(migration.match(/select l\.id_uuid into v_lead_uuid/g)?.length).toBe(2);
    expect(migration).toContain("values(v_workspace,'lead',v_lead_uuid,'resident.match.proposed'");
    expect(migration).toContain("values(v_match.workspace_id,'lead',v_lead_uuid,'resident.match.'||lower(p_decision)");
    expect(migration).not.toContain("p_lead_id::text");
    expect(migration).not.toContain("v_match.lead_id::text");
  });
});
