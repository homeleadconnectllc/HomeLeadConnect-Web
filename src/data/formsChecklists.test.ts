import assert from "node:assert/strict";
import test from "node:test";
import { checklistRegistry, checklistsForContext, formRegistry, formsForContext } from "./formsChecklists";

test("forms registry covers core HLC work contexts", () => {
  for (const context of ["lead", "estimate", "job", "provider"]) {
    assert.ok(formsForContext(context as never).length > 0, `missing forms for ${context}`);
  }
});

test("every form has fields and record-link rules", () => {
  for (const form of formRegistry) {
    assert.ok(form.fields.length > 0, `${form.id} has no fields`);
    assert.equal(typeof form.recordLinkRequired, "boolean");
    assert.ok(form.fields.some((field) => field.required), `${form.id} has no required field`);
  }
});

test("checklist registry covers lead, estimate, job, and provider contexts", () => {
  for (const context of ["lead", "estimate", "job", "provider"]) {
    assert.ok(checklistsForContext(context as never).length > 0, `missing checklist for ${context}`);
  }
});

test("every checklist has at least one required item", () => {
  for (const checklist of checklistRegistry) {
    assert.ok(checklist.items.length > 0, `${checklist.id} has no items`);
    assert.ok(checklist.items.some((item) => item.required), `${checklist.id} has no required item`);
  }
});
