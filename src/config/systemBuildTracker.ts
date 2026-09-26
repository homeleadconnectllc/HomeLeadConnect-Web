export type BuildReadiness =
  | "Not Started"
  | "Implemented"
  | "Integrated"
  | "Verified"
  | "Release Ready"
  | "External Blocker"
  | "Owner Decision";

export type BuildWorkstream =
  | "Whole System"
  | "Public Site"
  | "Resident Portal"
  | "Professional Portal"
  | "Partner Portal"
  | "Internal / HQ"
  | "Identity & Contact"
  | "CRM / Connected Core"
  | "Communications"
  | "Automations"
  | "Integrations"
  | "Data / Security"
  | "Documents"
  | "Pricing / Billing"
  | "AI / Agents"
  | "Mobile / Accessibility"
  | "QA / Certification"
  | "Release";

export type OwnerDecisionChoice =
  | "Pending"
  | "Approve Recommendation"
  | "Choose A"
  | "Choose B"
  | "Choose C"
  | "Merge / Promote Approved"
  | "Hold / Defer"
  | "Reject / Revise";

export type BuildTrackerItem = {
  id: string;
  title: string;
  workstream: BuildWorkstream;
  completion: number;
  readiness: BuildReadiness;
  currentActivity: string;
  route?: string;
  repository?: string;
  branch?: string;
  exactSha?: string;
  backend?: string;
  dependencies?: string[];
  evidence?: string[];
  remainingRisk?: string;
  blocker?: string;
  ownerAction?: string;
  canContinueWhilePending: boolean;
  reusableForClientBuilds: boolean;
  decisionRequired?: boolean;
  recommendation?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
};

export const systemBuildTrackerItems: BuildTrackerItem[] = [
  {
    id: "whole-system",
    title: "HCX whole-system reconciliation",
    workstream: "Whole System",
    completion: 24,
    readiness: "Integrated",
    currentActivity: "Reconcile current code, current backend authority, route families, permissions, connected workflows and release evidence into one governed system.",
    repository: "homeleadconnectllc/HomeLeadConnect-Web",
    branch: "sprint/hcx-reconciliation-01-20260921",
    exactSha: "fab495aa6dba42ef4e97f7ffc2f94b494bf08af2",
    dependencies: ["Identity & Contact", "Connected Core", "Communications", "Security", "QA"],
    evidence: ["125 explicit route patterns", "Acceptance gate passing at baseline", "Build passing at baseline"],
    remainingRisk: "The full application has not yet completed route-by-route E2E certification under the new reconciliation authority.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "public-site",
    title: "Public website and account-entry family",
    workstream: "Public Site",
    completion: 82,
    readiness: "Verified",
    currentActivity: "Preserve certified visual family while reconciling current intake, application, auth and public navigation behavior.",
    route: "/",
    evidence: ["Public visual contracts", "Current route inventory", "Certified production visual lineage"],
    remainingRisk: "Current reconciliation branch still requires final integrated release certification.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "resident-portal",
    title: "Resident / homeowner portal",
    workstream: "Resident Portal",
    completion: 64,
    readiness: "Integrated",
    currentActivity: "Connect request, LeadScope, appointments, jobs, documents, profile, settings and property context through canonical identity.",
    route: "/homeowner-portal",
    dependencies: ["Identity & Contact", "CRM / Connected Core", "Documents", "Communications"],
    remainingRisk: "Portal identity currently does not prove a full persistent canonical Person/contact-endpoint relation.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "professional-portal",
    title: "Professional portal",
    workstream: "Professional Portal",
    completion: 66,
    readiness: "Integrated",
    currentActivity: "Reconcile profile, services, opportunities, jobs, documents, team expectations, billing and communications.",
    route: "/contractor-portal",
    dependencies: ["Identity & Contact", "CRM / Connected Core", "Pricing / Billing"],
    remainingRisk: "Legacy contractor identity remains part of communication subject resolution.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "partner-portal",
    title: "Partner portal",
    workstream: "Partner Portal",
    completion: 48,
    readiness: "Implemented",
    currentActivity: "Verify referral, resource, management and permission boundaries.",
    route: "/partner-portal",
    remainingRisk: "Partner surface is smaller and needs broader E2E evidence than resident/professional families.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "internal-hq",
    title: "Internal owner / manager / technician workspace",
    workstream: "Internal / HQ",
    completion: 61,
    readiness: "Integrated",
    currentActivity: "Reconcile HQ, operations, customer experience, team, settings, analytics and system control surfaces.",
    route: "/hq",
    evidence: ["WorkspaceLayout centralized access enforcement", "Role-path contract tests"],
    remainingRisk: "Control-plane routes are not yet all expressed as capability-based owner/manager/technician contracts.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "identity",
    title: "Canonical identity and contact core",
    workstream: "Identity & Contact",
    completion: 38,
    readiness: "Integrated",
    currentActivity: "Canonical phone/email helpers exist; staged fail-closed communication-subject resolver is under reconciliation.",
    backend: "contactIdentity.ts + contactTargets.ts + staged communication resolver migration",
    evidence: ["Canonical contact identity contract", "Ambiguity handling contract"],
    remainingRisk: "Persistent canonical Person/contact endpoint model has not been proven in production.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "connected-core",
    title: "Request → CRM → assignment → workflow connected core",
    workstream: "CRM / Connected Core",
    completion: 47,
    readiness: "Integrated",
    currentActivity: "Trace resident request through lead, assignment, appointment, job, communication, history, automation and audit.",
    backend: "leads + jobs + assignments + appointments + workflow events",
    dependencies: ["Identity & Contact", "Communications", "Automations", "Data / Security"],
    remainingRisk: "Legacy lead-centered identity still participates in multiple downstream workflows.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "communications",
    title: "Phone / SMS / email communications",
    workstream: "Communications",
    completion: 72,
    readiness: "Integrated",
    currentActivity: "Server-authoritative destination resolution, compliance, provider dispatch, callbacks and truthful delivery state are being reconciled.",
    backend: "send-communication + twilio-webhook + resend-webhook + communication transmissions",
    evidence: ["Portal email state contract", "Provider-neutral routing migrations", "Idempotent provider event infrastructure"],
    remainingRisk: "Production inbound endpoint ambiguity remains active until owner-approved staged resolver promotion.",
    decisionRequired: true,
    recommendation: "Promote the already-tested fail-closed ambiguity resolver only after exact-candidate certification and production approval.",
    optionA: "Promote the staged resolver after exact-build certification.",
    optionB: "Hold production resolver change and continue non-production reconciliation.",
    optionC: "Replace the staged resolver with a broader canonical Person model before any production resolver change.",
    ownerAction: "Production promotion remains owner-controlled.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "automations",
    title: "Workflow automations and triggers",
    workstream: "Automations",
    completion: 58,
    readiness: "Integrated",
    currentActivity: "Inventory persisted automation runtime, trigger behavior, hourly execution, failure visibility and permissions.",
    route: "/automations",
    backend: "automation runtime + workflow trigger migrations",
    remainingRisk: "Full automation-to-audit E2E coverage still needs reconciliation by workflow family.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "integrations",
    title: "Connected applications and provider integrations",
    workstream: "Integrations",
    completion: 43,
    readiness: "Implemented",
    currentActivity: "Reconcile communications, calendar, billing, notifications and connected provider states without reviving retired runtimes.",
    dependencies: ["Communications", "Pricing / Billing", "Data / Security"],
    remainingRisk: "Provider readiness must be verified from runtime evidence rather than configuration assumptions.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "security",
    title: "Data security, permissions and RLS",
    workstream: "Data / Security",
    completion: 71,
    readiness: "Integrated",
    currentActivity: "Preserve tenant isolation, role authority, browser privilege restrictions, service-only paths and audit boundaries.",
    evidence: ["RLS certification tests", "Membership role authority migrations", "Browser admin grant revocations"],
    remainingRisk: "Every new tracker persistence surface must use owner-only server-enforced policy before production.",
    canContinueWhilePending: true,
    reusableForClientBuilds: false,
  },
  {
    id: "documents",
    title: "Documents, forms and agreements",
    workstream: "Documents",
    completion: 49,
    readiness: "Implemented",
    currentActivity: "Reconcile document ownership, processing, portal relationships, exports and future executed-record requirements.",
    route: "/documents",
    remainingRisk: "Full immutable/versioned executed agreement model is not yet proven end to end.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "billing",
    title: "Pricing, subscriptions and entitlements",
    workstream: "Pricing / Billing",
    completion: 62,
    readiness: "Integrated",
    currentActivity: "Preserve provider-backed subscription truth, trial entitlement and owner-only billing authority while separating catalog governance from Stripe.",
    route: "/settings/billing",
    backend: "Stripe checkout + billing portal + webhook-confirmed subscription state",
    remainingRisk: "Future commercial offers and add-ons still require owner-approved catalog values before provider pricing is created.",
    decisionRequired: true,
    recommendation: "Keep commercial catalog authority separate from Stripe and only create live prices after offer scope and amount are owner-approved.",
    optionA: "Approve catalog-first commercial architecture.",
    optionB: "Use custom quotes only until client-build packaging is mature.",
    optionC: "Defer new commercial offers and preserve only current membership billing.",
    ownerAction: "Future new prices require owner approval.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "agents",
    title: "Kendrell, Dion and Diamond",
    workstream: "AI / Agents",
    completion: 68,
    readiness: "Integrated",
    currentActivity: "Preserve identity assets, multilingual spoken addressing, page knowledge, permission boundaries and one-launcher behavior.",
    dependencies: ["Data / Security", "Communications"],
    remainingRisk: "Agent action authority must continue to inherit user permissions and auditable workflow boundaries.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "mobile",
    title: "Mobile, offline, accessibility and recovery",
    workstream: "Mobile / Accessibility",
    completion: 63,
    readiness: "Integrated",
    currentActivity: "Mobile A+ work is present through Sprint 7 contracts; durable offline primitives exist but full reconciliation remains incomplete.",
    evidence: ["Mobile A+ blueprint", "Sprint 4-7 contracts", "Durable offline state contract"],
    remainingRisk: "Offline conflict resolution and full physical iPhone route certification remain incomplete.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "qa",
    title: "QA, E2E and exact-candidate certification",
    workstream: "QA / Certification",
    completion: 57,
    readiness: "Verified",
    currentActivity: "Local baseline lint, acceptance and build pass; exact-head CI and broader route-family certification continue.",
    exactSha: "fab495aa6dba42ef4e97f7ffc2f94b494bf08af2",
    evidence: ["lint=0", "test:acceptance=0", "build=0"],
    remainingRisk: "Local pass is not production promotion authority and is not a substitute for exact-candidate CI and rendered/device evidence.",
    canContinueWhilePending: true,
    reusableForClientBuilds: true,
  },
  {
    id: "release",
    title: "Release and production verification",
    workstream: "Release",
    completion: 18,
    readiness: "Owner Decision",
    currentActivity: "Production remains protected while reconciliation proceeds on the dedicated branch.",
    dependencies: ["QA / Certification", "Data / Security"],
    decisionRequired: true,
    recommendation: "Do not promote until the exact candidate has completed required CI, visual/device verification and production migration review.",
    optionA: "Approve exact certified candidate when all release gates pass.",
    optionB: "Hold promotion and continue reconciliation.",
    optionC: "Split unresolved backend migration from UI release if certification proves the split is safe.",
    ownerAction: "Final merge / production promotion requires explicit owner approval.",
    canContinueWhilePending: true,
    reusableForClientBuilds: false,
  },
];

export const buildWorkstreamOrder: BuildWorkstream[] = [
  "Whole System",
  "Public Site",
  "Resident Portal",
  "Professional Portal",
  "Partner Portal",
  "Internal / HQ",
  "Identity & Contact",
  "CRM / Connected Core",
  "Communications",
  "Automations",
  "Integrations",
  "Data / Security",
  "Documents",
  "Pricing / Billing",
  "AI / Agents",
  "Mobile / Accessibility",
  "QA / Certification",
  "Release",
];

export const ownerDecisionChoices: OwnerDecisionChoice[] = [
  "Pending",
  "Approve Recommendation",
  "Choose A",
  "Choose B",
  "Choose C",
  "Merge / Promote Approved",
  "Hold / Defer",
  "Reject / Revise",
];
