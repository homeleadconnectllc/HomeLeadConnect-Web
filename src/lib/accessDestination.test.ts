import assert from "node:assert/strict";
import test from "node:test";
import { chooseAccessDestination } from "./accessDestination.ts";

test("workspace membership keeps the internal dashboard as highest-precedence destination", () => {
  assert.equal(chooseAccessDestination({
    hasWorkspace: true,
    hasHomeownerPortal: true,
    hasContractorPortal: true,
    hasPartnerPortal: true,
  }), "/dashboard");
});

test("homeowner and contractor portal precedence remains unchanged", () => {
  assert.equal(chooseAccessDestination({
    hasWorkspace: false,
    hasHomeownerPortal: true,
    hasContractorPortal: true,
    hasPartnerPortal: true,
  }), "/homeowner-portal");

  assert.equal(chooseAccessDestination({
    hasWorkspace: false,
    hasHomeownerPortal: false,
    hasContractorPortal: true,
    hasPartnerPortal: true,
  }), "/contractor-portal");
});

test("an active partner reaches the real partner portal before invitation fallback", () => {
  assert.equal(chooseAccessDestination({
    hasWorkspace: false,
    hasHomeownerPortal: false,
    hasContractorPortal: false,
    hasPartnerPortal: true,
  }), "/partner-portal");
});

test("users without an assigned destination still fall back to portal acceptance", () => {
  assert.equal(chooseAccessDestination({
    hasWorkspace: false,
    hasHomeownerPortal: false,
    hasContractorPortal: false,
    hasPartnerPortal: false,
  }), "/portal/accept");
});
