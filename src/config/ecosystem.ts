export type EcosystemStatus = "WORKING" | "BROKEN" | "MISSING" | "UNDEFINED" | "UNPROVEN";
export type EcosystemOwner = "Kendrell" | "Dion" | "Diamond" | "Shared";

export type AgentPlacement = {
  id: "kendrell" | "dion" | "diamond";
  name: string;
  title: string;
  avatar: string;
  route: string;
  owns: string[];
  presentOn: string[];
  handoff: string;
  status: EcosystemStatus;
  nextGate: string;
};

export type EcosystemArea = {
  id: string;
  label: string;
  summary: string;
  owner: EcosystemOwner;
  routes: string[];
  status: EcosystemStatus;
  nextGate: string;
};

export const agentTeam: AgentPlacement[] = [
  {
    id: "kendrell",
    name: "Kendrell",
    title: "Owner Command · Master Orchestrator",
    avatar: "/brand/avatars/Kendrell_Locked_HLC.png",
    route: "/hq",
    owns: ["Executive dashboard", "Approvals", "Risk", "System health", "Billing oversight", "Cross-agent handoffs"],
    presentOn: ["HQ", "Dashboard", "Ecosystem", "Settings", "Alerts"],
    handoff: "Routes operational work to Dion and customer/community work to Diamond; receives escalations from both.",
    status: "UNPROVEN",
    nextGate: "Add persistent contextual chat, approval previews, audited actions and verified cross-agent handoffs.",
  },
  {
    id: "dion",
    name: "Dion",
    title: "Operations & Business Intelligence",
    avatar: "/brand/avatars/Dion_Locked_HLC.png",
    route: "/operations",
    owns: ["Leads", "LeadScope", "Jobs", "Provider matching", "Calendar", "Call Center", "Operational reporting"],
    presentOn: ["Dashboard", "Leads", "LeadScope", "Jobs", "Contractors", "Calendar", "Call Center"],
    handoff: "Escalates approvals and risk to Kendrell; sends onboarding, message, review and recovery work to Diamond.",
    status: "UNPROVEN",
    nextGate: "Add Ask Dion chat across operational records with safe action previews, outcomes and handoff evidence.",
  },
  {
    id: "diamond",
    name: "Diamond",
    title: "Customer Experience & Community",
    avatar: "/brand/avatars/Diamond_Locked_HLC.png",
    route: "/customer-experience",
    owns: ["Onboarding", "Help", "Messages", "Community", "Reviews", "Referrals", "Brand experience", "Customer recovery"],
    presentOn: ["Public website", "Portals", "Messages", "Community", "Network/Map", "Help", "Notifications"],
    handoff: "Escalates operational blockers to Dion and policy, risk or executive decisions to Kendrell.",
    status: "UNPROVEN",
    nextGate: "Add Ask Diamond chat across customer and community surfaces with moderation and recovery workflows.",
  },
];

export const ecosystemAreas: EcosystemArea[] = [
  { id: "public-front-door", label: "Public Website & Acquisition", summary: "homeleadconnect.org, persona journeys, service taxonomy, public trust, campaign attribution and canonical intake.", owner: "Diamond", routes: ["/", "/homeowners", "/contractors", "/how-it-works", "/request-service", "/contact"], status: "BROKEN", nextGate: "Consolidate the Carrd page family, split resident/professional/partner CTAs and prove every form reaches one canonical CRM intake." },
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
  { id: "help", label: "Help, Tutorials & Support", summary: "Role onboarding, searchable help, contextual tutorials, support requests, service status and recovery guidance.", owner: "Diamond", routes: ["/contact", "/customer-experience"], status: "MISSING", nextGate: "Create the help registry, role tutorials, escalation ownership and support response states." },
  { id: "reliability", label: "Reliability, Data & Launch Operations", summary: "Analytics, audit review, monitoring, backups, restore tests, incident response, accessibility and rollback.", owner: "Kendrell", routes: ["/hq", "/ecosystem", "/settings"], status: "UNPROVEN", nextGate: "Capture deployment-candidate evidence for monitoring, backup/restore, browser/mobile acceptance and rollback." },
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
