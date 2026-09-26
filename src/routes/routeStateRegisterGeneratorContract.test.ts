import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const register = readFileSync("docs/sprints/route-state-register-current.md", "utf8");

test("route inventory preserves composed route elements and separate route rows", () => {
  assert.match(register, /`\/contact`[^\n]+`<MainSiteOnly><ContactPage\/><\/MainSiteOnly>`/);
  assert.match(register, /`\/request-service`[^\n]+`<RequestService\/>`/);
  assert.match(register, /`\/residents`[^\n]+`<Navigate to="\/homeowners" replace\/>`/);
  assert.doesNotMatch(register, /<Route path=/);
});

test("every declared route has one audience, family owner, and page type", () => {
  const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
  const paths = [...router.matchAll(/<Route path="([^"]+)" element=\{/g)].map((match) => match[1]);
  const rows = register.split("\n").filter((line) => /^\| \d+ \|/.test(line));
  assert.equal(rows.length, paths.length);
  assert.equal(new Set(paths).size, paths.length);
  for (const [index, row] of rows.entries()) {
    const columns = row.split(" | ");
    assert.equal(columns[1], `\`${paths[index]}\``, `route ${index + 1}`);
    assert.ok(columns[2] && columns[3] && columns[4], `missing classification for ${paths[index]}`);
  }
  for (const [path, audience, family] of [
    ["/homeowner-portal/documents", "Resident portal", "Resident"],
    ["/contractor-portal/services", "Professional portal", "Professional"],
    ["/partner-portal/resources", "Partner portal", "Partner"],
    ["/hq/approvals", "Internal workspace", "HQ and agents"],
  ]) assert.ok(rows.some((row) => row.includes(`\`${path}\` | ${audience} | ${family} |`)), path);
});
