import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  documentProcessingGuardrails,
  documentProcessingKinds,
  documentProcessingStates,
  extractionReviewStates,
  invoiceExtractionFields,
  receiptExtractionFields,
  signatureEnvelopeStates,
} from "./documentProcessing.ts";

const migrationCandidate = readFileSync("supabase/pending/20260825173000_document_processing_review_foundation.sql", "utf8");

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

test("pending document processing migration expands audit vocabulary before processing RPCs emit events", () => {
  const constraintIndex = migrationCandidate.indexOf("add constraint document_events_action_check");
  const requestFunctionIndex = migrationCandidate.indexOf("create or replace function public.request_document_processing");
  assert.ok(constraintIndex >= 0, "document event action constraint expansion is missing");
  assert.ok(requestFunctionIndex > constraintIndex, "audit vocabulary must be expanded before processing RPC creation");
  for (const action of ["processing_requested", "processing_completed", "processing_failed", "extraction_reviewed"]) {
    assert.match(migrationCandidate, new RegExp(`'${action}'`), `missing document event action: ${action}`);
  }
  assert.match(migrationCandidate, /set search_path to ''/);
  assert.match(migrationCandidate, /revoke all on function public\.request_document_processing\(uuid,text\) from public,anon/);
  assert.match(migrationCandidate, /revoke all on function public\.review_document_extraction_field\(uuid,text,jsonb\) from public,anon/);
});
