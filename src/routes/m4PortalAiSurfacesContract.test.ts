import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const resident = readFileSync("src/pages/portal/HomeownerPortal.tsx","utf8");
const partner = readFileSync("src/pages/portal/PartnerPortal.tsx","utf8");
const portalBoundary = readFileSync("src/routes/PortalAccessBoundary.tsx","utf8");
const portalContract = readFileSync("src/routes/accountPortalsApplicationWorkspace.test.ts","utf8");
const aiLauncher = readFileSync("src/components/agents/UniversalAITeamLauncher.tsx","utf8");
const aiContract = readFileSync("src/routes/agentPresenceMount.test.ts","utf8");
const portalCss = readFileSync("src/styles/account-portals-application-workspace.css","utf8");
const aiCss = readFileSync("src/styles/universal-ai-team-launcher.css","utf8");

test("M4 preserves fail-closed role portal boundaries", () => {
  assert.match(portalBoundary,/fail|denied|unauthor/i);
  assert.match(portalContract,/resident|professional|partner/i);
  assert.match(resident,/getHomeownerPortalData/);
  assert.match(partner,/getPartnerPortalData/);
});

test("M4 preserves resident portal decisions and protected actions", () => {
  for (const token of ["Accept estimate","Reject estimate","Accept provider","Decline provider","secure checkout","Publish review"]) {
    assert.ok(resident.includes(token),"Missing resident action "+token);
  }
});

test("M4 preserves partner referral boundaries", () => {
  assert.match(partner,/createPartnerReferral/);
  assert.match(partner,/does not send a message or enroll/);
  assert.match(partner,/Referrals/);
});

test("M4 keeps portal presentation flat and responsive at the shared authority", () => {
  assert.match(portalCss,/border-radius:0!important/);
  assert.match(portalCss,/box-shadow:none!important/);
  assert.match(portalCss,/@media\(max-width:720px\)/);
  assert.match(portalCss,/min-height:46px/);
});

test("M4 keeps one universal AI Team launcher and one active agent surface", () => {
  assert.match(aiLauncher,/UniversalAITeamLauncher/);
  assert.match(aiLauncher,/Kendrell/);
  assert.match(aiLauncher,/Dion/);
  assert.match(aiLauncher,/Diamond/);
  assert.match(aiContract,/agent switch|agent tab|identity/i);
  assert.match(aiCss,/hlc-ai-team-launcher/);
  assert.match(aiCss,/repeat\(3, minmax\(0, 1fr\)\)/);
});

test("M4 preserves explicit voice opt-in and isolated agent identity", () => {
  assert.match(aiContract,/enabled: false/);
  assert.match(aiContract,/speechGeneration/);
  assert.match(aiContract,/cancelNativeSpeech/);
});
