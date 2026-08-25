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
const processorSource = readFileSync("supabase/functions/process-document/index.ts", "utf8");

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

test("document processor requires signed user context and keeps provider credentials server-side", () => {
  assert.match(processorSource, /request\.headers\.get\("Authorization"\)/);
  assert.match(processorSource, /userClient\.auth\.getUser\(\)/);
  assert.match(processorSource, /Deno\.env\.get\("OPENAI_API_KEY"\)/);
  assert.match(processorSource, /Deno\.env\.get\("SUPABASE_SERVICE_ROLE_KEY"\)/);
  assert.doesNotMatch(processorSource, /sk-[A-Za-z0-9_-]{12,}/);
});

test("document processor is explicit queued-only review workflow rather than automatic posting", () => {
  assert.match(processorSource, /job\.status !== "queued"/);
  assert.match(processorSource, /status: "processing"/);
  assert.match(processorSource, /status: "review_required"/);
  assert.match(processorSource, /status: "failed"/);
  assert.match(processorSource, /processing_completed/);
  assert.match(processorSource, /processing_failed/);
  assert.doesNotMatch(processorSource, /from\("(?:estimates|estimate_lines|subscriptions|payments)"\)/);
});

test("document processor constrains source files and uses multimodal structured extraction", () => {
  for (const mime of ["application/pdf", "image/jpeg", "image/png", "image/webp"]) {
    assert.ok(processorSource.includes(mime));
  }
  assert.match(processorSource, /25 \* 1024 \* 1024/);
  assert.match(processorSource, /type: "input_file"/);
  assert.match(processorSource, /type: "input_image"/);
  assert.match(processorSource, /type: "json_schema"/);
  assert.match(processorSource, /strict: true/);
  assert.match(processorSource, /document_extraction_fields/);
});
