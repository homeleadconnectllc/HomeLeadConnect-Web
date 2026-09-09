import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authProvider = readFileSync("src/context/AuthContext.tsx", "utf8");
const accountAccessProvider = readFileSync("src/context/AccountAccessProvider.tsx", "utf8");
const login = readFileSync("src/pages/auth/Login.tsx", "utf8");
const register = readFileSync("src/pages/auth/Register.tsx", "utf8");
const portalInvitation = readFileSync("src/pages/portal/AcceptInvitation.tsx", "utf8");
const appShellEntry = readFileSync("src/styles/app-shell-entry.ts", "utf8");
const authSessionHardening = readFileSync("src/styles/auth-session-hardening.css", "utf8");

test("auth bootstrap cannot leave the application stuck loading after a session lookup failure", () => {
  assert.match(authProvider, /void supabase\.auth\.getSession\(\)\.then\(/);
  assert.match(authProvider, /setSession\(error \? null : data\.session\)/);
  assert.match(authProvider, /setSession\(null\);[\s\S]*setLoading\(false\);/);
});

test("invalid refresh tokens are cleared locally without weakening other sessions", () => {
  assert.match(authProvider, /invalid refresh token\|refresh token not found/i);
  assert.match(authProvider, /supabase\.auth\.signOut\(\{ scope: "local" \}\)/);
  assert.doesNotMatch(authProvider, /scope: "global"/);
});

test("auth state updates stop after provider teardown", () => {
  assert.match(authProvider, /let active = true/);
  assert.match(authProvider, /if \(!active\) return/);
  assert.match(authProvider, /active = false;[\s\S]*subscription\.unsubscribe\(\)/);
});

test("sign-in preserves a protected deep link even when the session redirect wins the form race", () => {
  assert.match(login, /const stateNext =/);
  assert.match(login, /const requestedDestination = queryNext \|\| stateNext/);
  assert.match(login, /session\) return <Navigate to=\{requestedDestination \|\| "\/app"\}/);
  assert.match(login, /return requestedDestination \|\| "\/app"/);
  assert.match(login, /register\?next=\$\{encodeURIComponent\(requestedDestination\)\}/);
});

test("professional portal invitations preserve their token through sign-in or identity creation", () => {
  assert.match(portalInvitation, /\/login\?next=\$\{encodedDestination\}/);
  assert.match(portalInvitation, /\/register\?next=\$\{encodedDestination\}/);
  assert.match(login, /queryNext\?\.startsWith\("\/portal\/accept\?"\)/);
  assert.match(register, /next\?\.startsWith\("\/portal\/accept\?"\)/);
  assert.match(register, /account_type: invitedIdentity \? "workspace_invitee" : "company_owner"/);
  assert.doesNotMatch(register, /company_name: invitedIdentity \? companyName/);
});

test("Safari autofill cannot replace the HLC auth field surface with a yellow background", () => {
  assert.match(appShellEntry, /import "\.\/auth-session-hardening\.css"/);
  assert.match(authSessionHardening, /input:-webkit-autofill/);
  assert.match(authSessionHardening, /-webkit-text-fill-color: #ffffff !important/);
  assert.match(authSessionHardening, /0 0 0 1000px #101f34 inset !important/);
});

test("account access remains fail-closed when workspace or portal resolution errors", () => {
  assert.match(accountAccessProvider, /const partnerDenied = Boolean\(partner\.error && partner\.error\.code === "42501"\)/);
  assert.match(accountAccessProvider, /const failed = Boolean\(business\.error \|\| homeowner\.error \|\| contractor\.error \|\| profile\.error \|\| \(partner\.error && !partnerDenied\)\)/);
  assert.match(accountAccessProvider, /business: !failed && Boolean\(business\.data\?\.length\)/);
  assert.match(accountAccessProvider, /homeowner: !failed && Boolean\(homeowner\.data\?\.length\)/);
  assert.match(accountAccessProvider, /contractor: !failed && Boolean\(contractor\.data\?\.length\)/);
  assert.match(accountAccessProvider, /partner: !failed && !partnerDenied && Boolean\(partner\.data\)/);
  assert.match(accountAccessProvider, /role: failed \? null : normalizeInternalRole/);
  assert.match(accountAccessProvider, /error: failed/);
});
