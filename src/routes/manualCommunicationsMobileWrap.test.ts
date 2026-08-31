import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manualCommunications = readFileSync("src/pages/dashboard/ManualCommunications.tsx", "utf8");
const mobileAuthority = readFileSync("src/styles/soft-launch-manual-communications-authority.css", "utf8");

test("manual communications keeps inactive mobile app labels intact", () => {
  assert.match(manualCommunications, /Messages app/);
  assert.match(manualCommunications, /Phone app/);
  assert.match(
    mobileAuthority,
    /button span:last-child[\s\S]*white-space: nowrap !important;[\s\S]*max-width: 100% !important;/,
  );
  assert.match(mobileAuthority, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\) !important;/);
  assert.match(mobileAuthority, /button span[\s\S]*font-size: 13px !important;/);
});
