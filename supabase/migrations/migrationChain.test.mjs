import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

const migrationFiles = readdirSync("supabase/migrations").filter((name) => /^\d+_.+\.sql$/.test(name)).sort();
const plan = readFileSync("supabase/RELEASE_MIGRATION_PLAN.md", "utf8");
const plannedFiles = [...plan.matchAll(/^\d+\. `([^`]+\.sql)`$/gm)].map((match) => match[1]);

test("release plan lists every local launch migration exactly once and in filename order", () => {
  assert.deepEqual(plannedFiles, migrationFiles);
  assert.equal(new Set(plannedFiles).size, plannedFiles.length);
});

test("all pending SQL migrations are non-empty", () => {
  for (const file of migrationFiles) {
    assert.ok(readFileSync(`supabase/migrations/${file}`, "utf8").trim().length > 0, `${file} is empty`);
  }
});
