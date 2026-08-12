export type EcosystemStatus = "WORKING" | "BROKEN" | "MISSING" | "UNDEFINED" | "UNPROVEN";
export type EcosystemOwner = "Kendrell" | "Dion" | "Diamond" | "Shared";

export type EcosystemArea = {
  id: string;
  label: string;
  summary: string;
  owner: EcosystemOwner;
  routes: string[];
  status: EcosystemStatus;
  nextGate: string;
};

export const ecosystemAreas: EcosystemArea[] = [
  { id: "identity", label: "Identity & Access", summary: "Login, invitations, roles, workspace membership, portals, sessions and recovery.", owner: "Kendrell", routes: ["/login", "/register", "/portal/accept", "/settings"], status: "UNPROVEN", nextGate: "Audit every auth method, role link, recovery path and cross-workspace denial." },
  { id: "crm", label: "CRM & LeadScope", summary: "Requests, leads, evidence, estimates, follow-ups and activity history.", owner: "Dion", routes: ["/request-service", "/leads", "/estimator", "/follow-ups"], status: "UNPROVEN", nextGate: "Verify request-to-lead idempotency and the complete Lead → Estimate → Job transition." },
  { id: "operations", label: "Jobs, Matching & Scheduling", summary: "Provider eligibility, offers, assignments, appointments, jobs and operational BI.", owner: "Dion", routes: ["/operations", "/jobs", "/calendar", "/dashboard"], status: "UNPROVEN", nextGate: "Implement and verify eligibility, acceptance and one-active-assignment scheduling gates." },
  { id: "communications", label: "Communications & Audio", summary: "Device phone, text and email handoff; connected providers, messages, calling, voicemail and transcripts.", owner: "Dion", routes: ["/manual-communications", "/call-center", "/messages"], status: "UNPROVEN", nextGate: "Make device handoff universal and audit provider receipts, consent and suppression." },
  { id: "agents", label: "Agent Team", summary: "Kendrell command, Dion operations and Diamond CX with scoped context, handoffs and audited actions.", owner: "Shared", routes: ["/hq", "/operations", "/customer-experience"], status: "UNPROVEN", nextGate: "Add real threaded contextual chat and verify capability confirmation and audit." },
  { id: "experience", label: "Customer Experience", summary: "Onboarding, help, tutorials, feedback, recovery, brand, creative and growth systems.", owner: "Diamond", routes: ["/customer-experience"], status: "MISSING", nextGate: "Build role tutorials, help registry and CX queues on canonical participant records." },
  { id: "network", label: "Network, Map & Community", summary: "Provider discovery, profiles, map/list, discussions, reviews, referrals, events and moderation.", owner: "Diamond", routes: ["/community"], status: "MISSING", nextGate: "Approve visibility and moderation rules, then implement canonical directory and Community routes." },
  { id: "alerts", label: "Alerts & Notifications", summary: "Security, workflow, communication, Community and billing events with safe deep links.", owner: "Shared", routes: ["/notifications"], status: "UNPROVEN", nextGate: "Verify event coverage, recipients, preferences, quiet hours, privacy and delivery states." },
  { id: "billing", label: "Subscription & Billing", summary: "$99/month SaaS, 14-day trial, Checkout, portal, webhooks and database entitlement.", owner: "Kendrell", routes: ["/settings"], status: "UNPROVEN", nextGate: "Audit live Stripe configuration and verify signed idempotent webhook entitlement end to end." },
  { id: "protection", label: "Rules, Protection & Compliance", summary: "Privacy, security, communications consent, Community rules, provider evidence and audit.", owner: "Kendrell", routes: ["/privacy", "/terms", "/platform-disclosure", "/settings"], status: "UNPROVEN", nextGate: "Complete counsel-approved policy set and verify controls in code and operations." },
];

export const workflowSpine = [
  "Request",
  "Lead",
  "LeadScope / Estimate",
  "Job",
  "Eligible providers",
  "Offer",
  "Accepted assignment",
  "Appointment",
  "Work",
  "Completion",
  "Review / Community",
] as const;

export function statusPriority(status: EcosystemStatus) {
  return { BROKEN: 0, MISSING: 1, UNDEFINED: 2, UNPROVEN: 3, WORKING: 4 }[status];
}
