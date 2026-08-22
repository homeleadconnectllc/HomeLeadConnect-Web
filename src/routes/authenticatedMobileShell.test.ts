import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const entry = readFileSync("src/styles/app-shell-entry.ts", "utf8");
const shell = readFileSync("src/styles/authenticated-mobile-shell-authority.css", "utf8");

test("authenticated mobile shell hides inline desktop navigation and keeps mobile controls authoritative", () => {
  const mobileRelease = entry.indexOf('import "./mobile-release-fix.css";');
  const shellAuthority = entry.indexOf('import "./authenticated-mobile-shell-authority.css";');
  assert.ok(mobileRelease >= 0);
  assert.ok(shellAuthority > mobileRelease);
  assert.match(shell, /@media \(max-width: 1024px\)/);
  assert.match(shell, /\.hlc-navbar \.hlc-desktop-navigation\s*\{\s*display:\s*none\s*!important/);
  assert.match(shell, /\.hlc-navbar-toggle[\s\S]*display:\s*inline-flex\s*!important/);
  assert.match(shell, /\.hlc-signed-in-shell,[\s\S]*min-width:\s*0\s*!important/);
});
