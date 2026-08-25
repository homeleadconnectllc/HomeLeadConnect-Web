export const documentProcessingKinds = ["ocr", "invoice", "receipt", "generic_extraction"] as const;
export type DocumentProcessingKind = (typeof documentProcessingKinds)[number];

export const documentProcessingStates = [
  "queued",
  "processing",
  "review_required",
  "approved",
  "rejected",
  "failed",
  "cancelled",
] as const;
export type DocumentProcessingState = (typeof documentProcessingStates)[number];

export type ExtractionFieldDefinition = {
  key: string;
  label: string;
  requiredForApproval?: boolean;
  financial?: boolean;
};

export const invoiceExtractionFields: ExtractionFieldDefinition[] = [
  { key: "vendor_name", label: "Vendor / provider", requiredForApproval: true },
  { key: "invoice_number", label: "Invoice number" },
  { key: "invoice_date", label: "Invoice date", requiredForApproval: true },
  { key: "due_date", label: "Due date" },
  { key: "subtotal", label: "Subtotal", financial: true },
  { key: "tax", label: "Tax", financial: true },
  { key: "total", label: "Total", requiredForApproval: true, financial: true },
  { key: "line_items", label: "Line items", financial: true },
  { key: "payment_status", label: "Payment status" },
  { key: "job_reference", label: "Job / project reference" },
];

export const receiptExtractionFields: ExtractionFieldDefinition[] = [
  { key: "merchant_name", label: "Merchant", requiredForApproval: true },
  { key: "transaction_date", label: "Transaction date", requiredForApproval: true },
  { key: "subtotal", label: "Subtotal", financial: true },
  { key: "tax", label: "Tax", financial: true },
  { key: "total", label: "Total", requiredForApproval: true, financial: true },
  { key: "line_items", label: "Line items", financial: true },
  { key: "payment_method_hint", label: "Payment method hint" },
  { key: "job_reference", label: "Job / project reference" },
];

export const extractionReviewStates = ["pending", "approved", "corrected", "rejected"] as const;
export type ExtractionReviewState = (typeof extractionReviewStates)[number];

export const signatureEnvelopeStates = [
  "draft",
  "sent",
  "viewed",
  "partially_signed",
  "signed",
  "declined",
  "expired",
  "void",
] as const;
export type SignatureEnvelopeState = (typeof signatureEnvelopeStates)[number];

export type SignatureEnvelopeDefinition = {
  sourceDocumentId: string;
  linkedEntityType: "lead" | "estimate" | "job" | "appointment" | "contractor";
  linkedEntityId: string;
  title: string;
  signerOrderRequired: boolean;
  expiresAt?: string;
};

export type SignatureSignerDefinition = {
  name: string;
  email: string;
  role: "resident" | "professional" | "internal" | "other";
  order: number;
};

export const documentProcessingGuardrails = [
  "The original source document remains immutable evidence; processing output is a proposal, not a replacement.",
  "Low-confidence fields require human review before becoming canonical business data.",
  "Financial extraction never posts directly to Finance, a Job, or payment state without an approved review step.",
  "Duplicate invoice or receipt candidates must be surfaced for review rather than silently merged.",
  "A signed final artifact is immutable; later changes create a new version or amendment rather than rewriting the signed file.",
  "Signature state must come from signer/provider evidence and may not be inferred from a button click alone.",
] as const;
