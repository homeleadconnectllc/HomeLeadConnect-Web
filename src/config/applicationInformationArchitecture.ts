export type HlcOwner = "Kendrell" | "Dion" | "Diamond" | "Shared";

export type HlcNavItem = {
  label: string;
  route: string;
  owner: HlcOwner;
  purpose: string;
  children?: string[];
};

export type HlcNavGroup = {
  id: "home" | "work" | "network" | "community" | "more";
  label: string;
  purpose: string;
  items: HlcNavItem[];
};

export const mobilePrimaryNavigation = [
  { label: "Home", route: "/dashboard", icon: "home" },
  { label: "Work", route: "/leads", icon: "work" },
  { label: "Network", route: "/network", icon: "network" },
  { label: "Community", route: "/community-hub", icon: "community" },
  { label: "More", route: "menu", icon: "more" },
] as const;

export const applicationNavigation: HlcNavGroup[] = [
  {
    id: "home",
    label: "Home",
    purpose: "Command Center for today, attention, KPIs, quick actions, approvals and AI briefing.",
    items: [
      { label: "Command Center", route: "/dashboard", owner: "Kendrell", purpose: "Today, attention queue, KPI snapshot, quick create and agent briefing." },
      { label: "Golden Workflow", route: "/workflow", owner: "Kendrell", purpose: "Request-to-review lifecycle, pipeline state, automations, exceptions and history.", children: ["Overview", "Pipeline", "Automations", "Exceptions", "History"] },
      { label: "Ecosystem", route: "/ecosystem", owner: "Kendrell", purpose: "Executive relationship map across residents, professionals, partners, businesses and integrations.", children: ["Overview", "People", "Businesses", "Partners", "Connections", "Integrations"] },
      { label: "Automations", route: "/automations", owner: "Kendrell", purpose: "Operational automations, templates, execution history and failures.", children: ["Active", "Templates", "History", "Errors"] },
      { label: "Notifications", route: "/notifications", owner: "Shared", purpose: "Actionable alerts across work, billing, integrations, security and community." },
      { label: "Kendrell", route: "/hq", owner: "Kendrell", purpose: "Owner-level approvals, risk, summaries and cross-agent orchestration." },
    ],
  },
  {
    id: "work",
    label: "Work",
    purpose: "Operational CRM from incoming request through estimate, matching, scheduling, job and follow-up.",
    items: [
      { label: "Requests & Leads", route: "/leads", owner: "Dion", purpose: "Intake, qualification, pipeline, assignment and next action.", children: ["New", "Contacting", "Qualified", "Estimate", "Matching", "Scheduled", "Won", "Lost"] },
      { label: "Estimates", route: "/estimator", owner: "Dion", purpose: "Scope, quantities, pricing, options, send/approve and estimate-to-job conversion.", children: ["Summary", "Scope", "Pricing", "Options", "Activity"] },
      { label: "Jobs", route: "/jobs", owner: "Dion", purpose: "Assigned and unassigned work, execution, evidence, completion and financial handoff.", children: ["Active", "Upcoming", "Unassigned", "Needs Attention", "Complete"] },
      { label: "Calendar", route: "/calendar", owner: "Dion", purpose: "Appointments, visits, dispatch, availability and route-aware scheduling.", children: ["Today", "Day", "Week", "Agenda", "Map"] },
      { label: "Follow-Ups", route: "/follow-ups", owner: "Dion", purpose: "Human and automated follow-up queues with reason, due time and disposition.", children: ["Due Today", "Upcoming", "Waiting", "Overdue", "Automated", "Complete"] },
      { label: "Operations", route: "/operations", owner: "Dion", purpose: "Operational intelligence, SLA risk, queue health and recommended actions." },
    ],
  },
  {
    id: "network",
    label: "Network",
    purpose: "Discovery, provider matching, location intelligence and canonical participant profiles.",
    items: [
      { label: "Network Home", route: "/network", owner: "Diamond", purpose: "Discover, recommended providers, categories, saved providers and network activity.", children: ["Discover", "Match", "Map", "Directory", "Saved"] },
      { label: "Match", route: "/matching", owner: "Dion", purpose: "Project-fit matching with transparent eligibility, availability and evidence.", children: ["Best Match", "Fastest Available", "Closest", "Highest Rated", "Shortlist"] },
      { label: "Map", route: "/map", owner: "Dion", purpose: "Explore and dispatch views with provider pins, jobs, service areas, filters and route context.", children: ["Explore", "Dispatch"] },
      { label: "Provider Directory", route: "/providers", owner: "Diamond", purpose: "Search and filter professionals by trade, location, availability, verification and evidence." },
      { label: "Profiles", route: "/profiles", owner: "Diamond", purpose: "Canonical resident, professional, business, partner and provider profiles." },
    ],
  },
  {
    id: "community",
    label: "Community",
    purpose: "Trusted feed, discussions, events, updates, reviews, referrals and moderation.",
    items: [
      { label: "Community Home", route: "/community-hub", owner: "Diamond", purpose: "Personalized local activity, recommendations and member connections.", children: ["Feed", "Discussions", "Events", "Reviews", "Referrals"] },
      { label: "Discussions", route: "/community/discussions", owner: "Diamond", purpose: "Role-aware topics, replies, saves, reports and moderation." },
      { label: "Events & Updates", route: "/community/events", owner: "Diamond", purpose: "HLC announcements, workshops, professional networking and local events." },
      { label: "Reviews", route: "/community/reviews", owner: "Diamond", purpose: "Completion-linked reviews, responses, disputes and verified-job context." },
      { label: "Referrals", route: "/community/referrals", owner: "Diamond", purpose: "Refer professionals or people needing help with attribution and status." },
      { label: "Moderation", route: "/community/moderation", owner: "Diamond", purpose: "Reports, decisions, appeals, rules enforcement and audit history." },
    ],
  },
  {
    id: "more",
    label: "More",
    purpose: "Communications, resources, intelligence, administration, portals, billing and settings.",
    items: [
      { label: "Messages", route: "/messages", owner: "Diamond", purpose: "Context-aware conversation inbox tied to leads, jobs, providers and community." },
      { label: "Call Center", route: "/call-center", owner: "Dion", purpose: "Call queue, scripts, disposition, voicemail and lead context." },
      { label: "Calls & Texts", route: "/manual-communications", owner: "Dion", purpose: "Universal device handoff and connected communications providers." },
      { label: "Documents", route: "/documents", owner: "Shared", purpose: "My Documents, shared files, templates, generated records and archive.", children: ["My Documents", "Shared", "Templates", "Generated", "Archived"] },
      { label: "Help Center", route: "/help", owner: "Diamond", purpose: "Searchable role-based answers, troubleshooting and escalation." },
      { label: "Tutorials", route: "/tutorials", owner: "Diamond", purpose: "Guided learning paths for residents, professionals, teams and platform features." },
      { label: "Rules & Safety", route: "/rules", owner: "Kendrell", purpose: "Community rules, service safety, review policy, reporting, privacy and enforcement." },
      { label: "My Profile", route: "/profile", owner: "Diamond", purpose: "Identity, contact information, preferences, visibility, consent and notifications." },
      { label: "Resident Portal", route: "/homeowner-portal", owner: "Diamond", purpose: "Requests, estimates, matches, appointments, messages, documents and reviews." },
      { label: "Professional Portal", route: "/contractor-portal", owner: "Dion", purpose: "Profile, opportunities, matches, jobs, calendar, documents, reviews and performance." },
      { label: "Company Team", route: "/team", owner: "Kendrell", purpose: "Members, roles, permissions, invitations, locations and access review." },
      { label: "Settings", route: "/settings", owner: "Kendrell", purpose: "Central administration for account, workspace, work, matching, communications, integrations, AI, privacy and appearance." },
      { label: "Subscription & Billing", route: "/settings/billing", owner: "Kendrell", purpose: "Plan, subscription state, invoices, payment methods and billing history." },
      { label: "Diamond", route: "/customer-experience", owner: "Diamond", purpose: "Customer-experience intelligence, onboarding, recovery and community support." },
    ],
  },
];

export const settingsArchitecture = [
  { id: "account", label: "Account", items: ["My Profile", "Sign-In & Password", "Email", "Phone", "Devices", "Sessions"] },
  { id: "workspace", label: "Workspace", items: ["Company", "Business Profile", "Workspace", "Team", "Roles & Permissions", "Locations", "Service Areas"] },
  { id: "work", label: "Work", items: ["Lead Settings", "Request Settings", "Estimate Settings", "Job Settings", "Calendar Settings", "Follow-Up Settings"] },
  { id: "matching", label: "Matching", items: ["Matching Rules", "Provider Criteria", "Distance", "Trade Categories", "Availability", "Ranking Preferences"] },
  { id: "communications", label: "Communications", items: ["Calling", "SMS", "Email", "Templates", "Sender Identities", "Consent", "Suppression", "Quiet Hours"] },
  { id: "notifications", label: "Notifications", items: ["Push", "Email", "SMS", "In-App", "Lead Alerts", "Appointment Alerts", "Job Alerts", "Community Alerts", "Billing Alerts", "Integration Alerts"] },
  { id: "automation", label: "Automation", items: ["Workflow Permissions", "Sending Limits", "Business Hours", "AI Approval Rules", "Failure Handling"] },
  { id: "integrations", label: "Integrations", items: ["Connected Apps", "Available Apps", "Activity", "Issues", "API", "Webhooks", "Sync Rules"] },
  { id: "billing", label: "Payments & Billing", items: ["Plan", "Subscription", "Payment Method", "Invoices", "Billing History"] },
  { id: "ai", label: "AI", items: ["Kendrell", "Dion", "Diamond", "Permissions", "Autonomy", "Approval Requirements", "Context", "Notifications", "Audit Logs"] },
  { id: "community", label: "Community", items: ["Profile Visibility", "Messaging Permissions", "Moderation", "Blocked Users", "Review Settings", "Referral Preferences"] },
  { id: "privacy", label: "Privacy & Security", items: ["MFA", "Device Sessions", "Data Access", "Privacy Controls", "Consent", "Export Data", "Delete Account", "Audit History"] },
  { id: "appearance", label: "Appearance", items: ["Theme", "Accessibility", "Text Size", "Motion"] },
  { id: "help", label: "Help", items: ["Tutorials", "Help Center", "Documentation", "Contact Support", "Report Issue", "System Status"] },
] as const;

export const automationTemplateLibrary = {
  leads: ["New lead acknowledgment", "Lead assignment", "No-response escalation", "Follow-up sequence", "Stale lead reminder"],
  estimates: ["Estimate sent", "Unopened reminder", "Estimate follow-up", "Approval to job", "Rejected estimate follow-up"],
  matching: ["Qualified project to matching", "Provider decline to next provider", "No match operations alert"],
  scheduling: ["Appointment confirmation", "Appointment reminder", "Provider notification", "Reschedule notification", "Missed appointment"],
  jobs: ["On my way", "Job started", "Job completed", "Issue escalation"],
  customerExperience: ["Thank you", "Review request", "Referral request", "Community invitation", "Repeat-service reminder"],
  billing: ["Payment succeeded", "Payment failed", "Overdue invoice", "Subscription issue"],
  operations: ["Integration disconnected", "Workflow failed", "SLA violation", "High-value opportunity", "Low-rating escalation"],
} as const;

export const goldenWorkflowStages = [
  "Request",
  "Qualify",
  "Estimate",
  "Match",
  "Schedule",
  "Job",
  "Complete",
  "Payment",
  "Review",
  "Referral / Repeat",
] as const;

export const carrdPublicSites = [
  { id: "home", title: "HomeLead Connect | Smarter Connections. Better Service Experiences.", url: "https://homeleadconnect.org/", purpose: "Primary overview and conversion front door." },
  { id: "about", title: "About HomeLead Connect", url: "https://homeleadconnectabout.carrd.co/", purpose: "Mission, audiences, local/community story and why HLC exists." },
  { id: "platform", title: "HomeLead Connect Platform", url: "https://homeleadconnectplatform.carrd.co/", purpose: "Estimator, matching, scheduling, communication, map/network and platform workflow." },
  { id: "innovation", title: "HomeLead Connect Innovation", url: "https://homeleadconnectinnovation.carrd.co/", purpose: "Kendrell, Dion, Diamond, automation, intelligence and future-facing technology." },
  { id: "professionals", title: "HomeLead Connect for Professionals", url: "https://homeleadconnectprofessionals.carrd.co/", purpose: "Opportunity flow, professional workspace, profiles, jobs, availability and reviews." },
  { id: "welcome", title: "Welcome to HomeLead Connect", url: "https://homeleadconnectwelcome.carrd.co/", purpose: "Simple audience choice and onboarding entry." },
  { id: "demo", title: "Request a HomeLead Connect Demo", url: "https://homeleadconnectdemo.carrd.co/", purpose: "Product preview and demo conversion." },
  { id: "contact", title: "Contact HomeLead Connect", url: "https://contacthomeleadconnect.carrd.co/", purpose: "Low-friction contact and support entry." },
  { id: "privacy", title: "HomeLead Connect Privacy Policy", url: "https://homeleadconnectprivacy.carrd.co/", purpose: "Approved privacy policy only." },
  { id: "terms", title: "HomeLead Connect Terms of Use", url: "https://homeleadconnectterms.carrd.co/", purpose: "Approved terms of use only." },
] as const;
