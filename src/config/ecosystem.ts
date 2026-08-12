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

export type EcosystemPage = {
  label: string;
  route: string;
  owner: EcosystemOwner;
  audiences: string[];
  purpose: string;
  status: EcosystemStatus;
};

export type EcosystemNavigationGroup = {
  id: string;
  label: string;
  purpose: string;
  pages: EcosystemPage[];
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

export const ecosystemNavigation: EcosystemNavigationGroup[] = [
  {
    id: "command",
    label: "Command",
    purpose: "Executive truth, daily priorities, approvals, alerts and agent coordination.",
    pages: [
      { label: "Dashboard", route: "/dashboard", owner: "Kendrell", audiences: ["Business", "Owner"], purpose: "KPIs, queues, alerts, upcoming work and quick actions.", status: "UNPROVEN" },
      { label: "Ecosystem", route: "/ecosystem", owner: "Kendrell", audiences: ["Owner", "Admin"], purpose: "Canonical map, status register, ownership and launch gates.", status: "WORKING" },
      { label: "HQ", route: "/hq", owner: "Kendrell", audiences: ["Owner"], purpose: "Approvals, risk, summaries and cross-agent orchestration.", status: "UNPROVEN" },
      { label: "Notifications", route: "/notifications", owner: "Shared", audiences: ["All signed-in roles"], purpose: "Security, workflow, messages, community and billing alerts.", status: "UNPROVEN" },
    ],
  },
  {
    id: "work",
    label: "Work",
    purpose: "Move one canonical request through CRM, evidence, matching, scheduling and completion.",
    pages: [
      { label: "Leads", route: "/leads", owner: "Dion", audiences: ["Business", "Sales", "Operations"], purpose: "Canonical request and lead records, pipeline and next actions.", status: "UNPROVEN" },
      { label: "LeadScope", route: "/estimator", owner: "Dion", audiences: ["Business", "Estimator"], purpose: "Evidence, scope, quantities, pricing and estimate-to-job transition.", status: "UNPROVEN" },
      { label: "Jobs", route: "/jobs", owner: "Dion", audiences: ["Business", "Operations", "Provider"], purpose: "Assignments, work state, checklists, media and completion.", status: "UNPROVEN" },
      { label: "Calendar", route: "/calendar", owner: "Dion", audiences: ["Business", "Provider", "Resident"], purpose: "Availability, appointments, dispatch and rescheduling.", status: "UNPROVEN" },
      { label: "Follow-ups", route: "/follow-ups", owner: "Dion", audiences: ["Business", "Sales"], purpose: "Due work, dispositions, callbacks and re-engagement.", status: "UNPROVEN" },
      { label: "Operations", route: "/operations", owner: "Dion", audiences: ["Business", "Operations"], purpose: "Operational intelligence, queues, risks and recommendations.", status: "UNPROVEN" },
    ],
  },
  {
    id: "network",
    label: "Network & Map",
    purpose: "Canonical participant profiles, service coverage, discovery and matching evidence.",
    pages: [
      { label: "Network Home", route: "/network", owner: "Diamond", audiences: ["All signed-in roles"], purpose: "Directory entry, saved providers, connections and network activity.", status: "MISSING" },
      { label: "Map", route: "/map", owner: "Diamond", audiences: ["Resident", "Business", "Provider"], purpose: "Privacy-safe entity pins, service areas, filters and canonical record cards.", status: "MISSING" },
      { label: "Profiles", route: "/profiles", owner: "Diamond", audiences: ["All signed-in roles"], purpose: "Homeowner, renter, business, contractor, subcontractor, trade and partner profiles.", status: "MISSING" },
      { label: "Provider Directory", route: "/providers", owner: "Diamond", audiences: ["Resident", "Business"], purpose: "Filter providers by trade, territory, availability and approved evidence.", status: "MISSING" },
      { label: "Matching", route: "/matching", owner: "Dion", audiences: ["Business", "Operations"], purpose: "Eligibility evidence, offer state, acceptance and assignment—without invented ranking.", status: "MISSING" },
    ],
  },
  {
    id: "community",
    label: "Community",
    purpose: "Trusted conversations, updates, reviews, referrals, events and moderation.",
    pages: [
      { label: "Community Home", route: "/community-hub", owner: "Diamond", audiences: ["All signed-in roles"], purpose: "Personalized discussions, updates, local activity and Diamond assistance.", status: "MISSING" },
      { label: "Discussions", route: "/community/discussions", owner: "Diamond", audiences: ["All signed-in roles"], purpose: "Role-aware topics, replies, saves, reports and moderation.", status: "MISSING" },
      { label: "Reviews", route: "/community/reviews", owner: "Diamond", audiences: ["Resident", "Provider", "Business"], purpose: "Completion-linked reviews, responses, disputes and moderation.", status: "MISSING" },
      { label: "Referrals", route: "/community/referrals", owner: "Diamond", audiences: ["Resident", "Provider", "Business"], purpose: "Consent-aware referral invitations, attribution and status.", status: "MISSING" },
      { label: "Events & Updates", route: "/community/events", owner: "Diamond", audiences: ["All signed-in roles"], purpose: "HLC updates, local events and service education.", status: "MISSING" },
      { label: "Moderation", route: "/community/moderation", owner: "Diamond", audiences: ["Moderator", "Admin"], purpose: "Reports, rules, decisions, appeals and audit.", status: "MISSING" },
    ],
  },
  {
    id: "connect",
    label: "Communications",
    purpose: "One consent-aware history for calls, texts, email, chat, voicemail and agent handoffs.",
    pages: [
      { label: "Call Center", route: "/call-center", owner: "Dion", audiences: ["Business", "Appointment Setter"], purpose: "Daily queue, lead context, scripts, disposition and follow-up.", status: "UNPROVEN" },
      { label: "Messages", route: "/messages", owner: "Diamond", audiences: ["All signed-in roles"], purpose: "Conversation threads, attachments, unread state and record links.", status: "UNPROVEN" },
      { label: "Calls & Texts", route: "/manual-communications", owner: "Dion", audiences: ["Business"], purpose: "Universal device handoff plus optional provider connectors.", status: "UNPROVEN" },
      { label: "Customer Experience", route: "/customer-experience", owner: "Diamond", audiences: ["Business", "CX", "Moderator"], purpose: "Onboarding, recovery, reviews, referrals and customer/community intelligence.", status: "UNPROVEN" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    purpose: "Documents, tutorials, help, policies and reusable operating knowledge.",
    pages: [
      { label: "Documents", route: "/documents", owner: "Shared", audiences: ["All signed-in roles"], purpose: "Canonical files attached to authorized records.", status: "UNPROVEN" },
      { label: "Help Center", route: "/help", owner: "Diamond", audiences: ["All roles"], purpose: "Searchable role-based help, recovery and escalation.", status: "MISSING" },
      { label: "Tutorials", route: "/tutorials", owner: "Diamond", audiences: ["All roles"], purpose: "First-run and contextual guidance for each journey.", status: "MISSING" },
      { label: "Rules & Safety", route: "/rules", owner: "Kendrell", audiences: ["All roles"], purpose: "Community, communications, provider and platform rules.", status: "MISSING" },
    ],
  },
  {
    id: "account",
    label: "Account & Portals",
    purpose: "Identity, role access, workspace settings, subscription and participant self-service.",
    pages: [
      { label: "Settings", route: "/settings", owner: "Kendrell", audiences: ["Business", "Owner", "Admin"], purpose: "Workspace, members, integrations, security and billing.", status: "UNPROVEN" },
      { label: "Homeowner / Renter Portal", route: "/homeowner-portal", owner: "Diamond", audiences: ["Homeowner", "Renter"], purpose: "Requests, estimates, appointments, messages, documents and reviews.", status: "UNPROVEN" },
      { label: "Professional Portal", route: "/contractor-portal", owner: "Dion", audiences: ["Contractor", "Subcontractor", "Trade"], purpose: "Profile, opportunities, offers, jobs, schedule and documents.", status: "UNPROVEN" },
      { label: "My Profile", route: "/profile", owner: "Diamond", audiences: ["All signed-in roles"], purpose: "Identity, contact, preferences, visibility, consent and notification controls.", status: "MISSING" },
      { label: "Subscription & Billing", route: "/settings/billing", owner: "Kendrell", audiences: ["Business", "Owner"], purpose: "HLC SaaS plan, trial, invoices, portal and entitlement state.", status: "UNPROVEN" },
    ],
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
