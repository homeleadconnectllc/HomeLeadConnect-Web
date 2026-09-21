export type ConnectedCoreStatus = "implemented" | "partial" | "verify" | "blocked-external" | "owner-review";

export type ConnectedCoreControl = {
  id: string;
  lifecycleStage: "identity" | "request" | "crm" | "assignment" | "communication" | "appointment" | "job" | "document" | "financial" | "follow-up" | "audit";
  record: string;
  sourceOfTruth: string;
  permissionBoundary: string;
  entitlementBoundary: string;
  consentBoundary: string;
  automation: string;
  failureBehavior: string;
  auditEvidence: string;
  mobileBehavior: string;
  status: ConnectedCoreStatus;
};

export const connectedCoreControlMatrix: ConnectedCoreControl[] = [
  {
    id: "canonical-contact-identity",
    lifecycleStage: "identity",
    record: "person/contact + phone/email endpoints",
    sourceOfTruth: "governed person/contact service; legacy lead/contractor/profile fields remain reconciliation inputs",
    permissionBoundary: "identity + workspace/organization + relationship + action",
    entitlementBoundary: "identity resolution itself is not a paid authority grant",
    consentBoundary: "endpoint identity is separate from channel consent/eligibility",
    automation: "no automatic merge on ambiguous endpoint matches",
    failureBehavior: "surface ambiguous/unmatched identity; never silently attach to a person",
    auditEvidence: "link/merge/change operations require provenance and historical association preservation",
    mobileBehavior: "same canonical endpoint resolution as desktop",
    status: "partial",
  },
  {
    id: "resident-service-request",
    lifecycleStage: "request",
    record: "service request",
    sourceOfTruth: "public intake backend and governed request/lead records",
    permissionBoundary: "public intake may create only the bounded intake record; downstream access is authorized separately",
    entitlementBoundary: "public intake does not imply professional entitlement",
    consentBoundary: "service-contact purpose is distinct from marketing enrollment",
    automation: "accepted intake may trigger governed acknowledgement/review/assignment events",
    failureBehavior: "preserve entered state where safe; do not claim provider/appointment confirmation",
    auditEvidence: "request ID + persisted intake result + downstream event evidence",
    mobileBehavior: "form must remain completable without duplicate submission or history replay",
    status: "verify",
  },
  {
    id: "governed-communications",
    lifecycleStage: "communication",
    record: "conversation/message/transmission",
    sourceOfTruth: "conversations/messages/communication_transmissions plus server communication functions",
    permissionBoundary: "workspace/resource authorization and server-side compliance decision",
    entitlementBoundary: "provider/channel availability does not manufacture resource authority",
    consentBoundary: "purpose/channel eligibility checked separately from endpoint existence",
    automation: "send/queue outcomes must be provider-backed and idempotent",
    failureBehavior: "blocked/review/queued/failed remain distinct real states; no fabricated delivery",
    auditEvidence: "transmission/compliance IDs, provider evidence, actor/system provenance and timestamps",
    mobileBehavior: "call/SMS/email actions use the same authority and association rules",
    status: "partial",
  },
  {
    id: "durable-offline-drafts",
    lifecycleStage: "follow-up",
    record: "user-scoped safe draft",
    sourceOfTruth: "IndexedDB for explicitly safe draft kinds; server remains authority for committed records",
    permissionBoundary: "drafts scoped to authenticated user; logout/account-switch cleanup still requires reconciliation",
    entitlementBoundary: "offline persistence cannot bypass server entitlement on reconnect",
    consentBoundary: "do not queue consent-sensitive or irreversible actions as drafts",
    automation: "none until reconnect reconciliation is authorized",
    failureBehavior: "Detect → Log → Preserve State → Retry → Fallback → Escalate",
    auditEvidence: "committed server action, not local draft existence, is authoritative evidence",
    mobileBehavior: "app close/reopen/offline/reconnect path is release-critical",
    status: "partial",
  },
];

export const connectedCoreLifecycle = [
  "identity", "request", "crm", "assignment", "communication", "appointment", "job", "document", "financial", "follow-up", "audit",
] as const;
