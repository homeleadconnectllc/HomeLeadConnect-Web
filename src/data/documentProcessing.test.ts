import assert from "node:assert/strict";
import test from "node:test";
import {
  documentProcessingGuardrails,
  documentProcessingKinds,
  documentProcessingStates,
  extractionReviewStates,
  invoiceExtractionFields,
  receiptExtractionFields,
  signatureEnvelopeStates,
} from "./documentProcessing";

test("document processing supports OCR invoice receipt and generic extraction without implying automatic posting", () => {
  assert.deepEqual(documentProcessingKinds, ["ocr", "invoice", "receipt", "generic_extraction"]);
  assert.ok(documentProcessingStates.includes("review_required"));
  assert.ok(extractionReviewStates.includes("corrected"));
  assert.ok(documentProcessingGuardrails.some((rule) => /never posts directly/i.test(rule)));
});

test("invoice and receipt extraction require core human-reviewed financial facts", () => {
  const invoiceRequired = invoiceExtractionFields.filter((field) => field.requiredForApproval).map((field) => field.key);
  const receiptRequired = receiptExtractionFields.filter((field) => field.requiredForApproval).map((field) => field.key);
  assert.ok(invoiceRequired.includes("total"));
  assert.ok(invoiceRequired.includes("vendor_name"));
  assert.ok(receiptRequired.includes("total"));
  assert.ok(receiptRequired.includes("merchant_name"));
  assert.ok(invoiceExtractionFields.some((field) => field.key === "line_items" && field.financial));
});

test("signature lifecycle includes final decline expiry and void states", () => {
  for (const state of ["draft", "sent", "viewed", "partially_signed", "signed", "declined", "expired", "void"] as const) {
    assert.ok(signatureEnvelopeStates.includes(state));
  }
  assert.ok(documentProcessingGuardrails.some((rule) => /signed final artifact is immutable/i.test(rule)));
  assert.ok(documentProcessingGuardrails.some((rule) => /provider evidence/i.test(rule)));
});
