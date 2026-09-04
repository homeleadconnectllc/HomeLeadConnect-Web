import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const contractorsApi = readFileSync(new URL("../api/contractors.ts", import.meta.url), "utf8");

test("provider browser queries only deployed contractor columns", () => {
  const selectContract = contractorsApi.match(/const contractorColumns =\s*\n?\s*"([^"]+)";/)?.[1] || "";
  assert.ok(selectContract, "contractor select contract should be explicit");
  assert.doesNotMatch(selectContract, /(?:^|,)latitude(?:,|$)/);
  assert.doesNotMatch(selectContract, /(?:^|,)longitude(?:,|$)/);
  assert.doesNotMatch(selectContract, /coordinate_accuracy|coordinate_source/);
});

test("provider coordinate mutation remains RPC-backed rather than direct table writes", () => {
  assert.match(contractorsApi, /supabase\.rpc\("set_provider_map_coordinates"/);
});
