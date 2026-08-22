import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const authShell = readFileSync("src/components/auth/AuthShell.tsx", "utf8");
const authStyles = readFileSync("src/styles/auth-methods.css", "utf8");

test("auth account center uses the approved flat shell instead of the legacy card wall", () => {
  assert.match(authShell, /hlc-auth-shell hlc-auth-shell--flat/);
  assert.match(authStyles, /\.hlc-auth-shell\.hlc-auth-shell--flat[\s\S]*border-radius:\s*12px/i);
  assert.match(authStyles, /\.hlc-auth-shell--flat \.hlc-auth-card[\s\S]*border:\s*0;[\s\S]*border-radius:\s*0;[\s\S]*box-shadow:\s*none;/i);
  assert.match(authStyles, /\.hlc-auth-shell--flat \.hlc-auth-brand[\s\S]*border-right:\s*1px solid rgba\(199, 210, 227, 0\.14\)/i);
});

test("auth methods are understated navigation and inputs use restrained professional geometry", () => {
  assert.match(authStyles, /\.hlc-auth-shell--flat \.hlc-auth-method-tabs button[\s\S]*border-bottom:\s*2px solid transparent;[\s\S]*border-radius:\s*0;[\s\S]*background:\s*transparent;/i);
  assert.match(authStyles, /\.hlc-auth-shell--flat \.hlc-auth-form input[\s\S]*border-radius:\s*7px;[\s\S]*background:\s*#101f34;/i);
  assert.match(authStyles, /\.hlc-auth-shell--flat \.hlc-auth-form > button[\s\S]*border-radius:\s*7px;[\s\S]*background:\s*#2f80ff;/i);
});

test("mobile auth becomes one continuous surface rather than another rounded card", () => {
  assert.match(authStyles, /@media \(max-width: 860px\)[\s\S]*\.hlc-auth-shell\.hlc-auth-shell--flat[\s\S]*border-radius:\s*0;[\s\S]*box-shadow:\s*none;/i);
  assert.match(authStyles, /\.hlc-auth-shell--flat \.hlc-auth-steps[\s\S]*display:\s*none;/i);
  assert.match(authStyles, /\.hlc-auth-shell--flat \.hlc-auth-form-heading[\s\S]*display:\s*none;/i);
});
