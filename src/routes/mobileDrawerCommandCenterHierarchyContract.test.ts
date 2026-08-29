import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const viewControls = readFileSync(new URL("../components/MobileViewControls.tsx", import.meta.url), "utf8");

test("mobile drawer promotes Command Center ahead of Search without duplication", () => {
  assert.match(viewControls, /const search = menu\.querySelector<HTMLElement>\("\.hlc-mobile-command-search-trigger"\)/);
  assert.match(viewControls, /const ownerHome = menu\.querySelector<HTMLElement>\("\.hlc-owner-home-link"\)/);
  assert.match(viewControls, /ownerHome && search && ownerHome\.nextElementSibling !== search/);
  assert.match(viewControls, /menu\.insertBefore\(ownerHome, search\)/);
});
