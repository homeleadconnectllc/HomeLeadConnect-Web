import type { EcosystemOwner, EcosystemStatus } from "./ecosystem";

export type CanonicalMappedPage = {
  label: string;
  route: string;
  owner: EcosystemOwner;
  audience: string;
  status: EcosystemStatus;
  built: boolean;
};

export type CanonicalPageArea = {
  id: string;
  label: string;
  home: string;
  pages: CanonicalMappedPage[];
};

const page = (label: string, route: string, owner: EcosystemOwner, audience: string, status: EcosystemStatus, built = false): CanonicalMappedPage => ({ label, route, owner, audience, status, built });

export const canonicalPageMap: CanonicalPageArea[] = [
  {
    id: "public",
    label: "Public Website",
    home: "homeleadconnect.org",
    pages: [
      page("Home", "/", "Diamond", "Everyone", "WORKING", true),
      page("How It Works", "/how-it-works", "Diamond", "Everyone", "UNPROVEN", true),
      page("Services & Network", "/services", "Diamond", "Residents and professionals", "UNPROVEN", true),
      page("Pricing & Access", "/pricing", "Kendrell", "Businesses and professionals", "UNPROVEN", true),
      page("About & Trust", "/trust", "Kendrell", "Everyone", "UNPROVEN", true),
      page("Request Service", "/request-service", "Diamond", "Homeowners and renters", "UNPROVEN", true),
      page("Professional Application", "/professional-application", "Dion", "Businesses and providers", "MISSING", true),
      page("Contact", "/contact", "Diamond", "Everyone", "UNPROVEN", true),
      page("Demo", "/demo", "Diamond", "Prospective participants", "UNPROVEN", true),
      page("Sign In", "/login", "Kendrell", "All account holders", "BROKEN", true),
      page("Register", "/register", "Kendrell", "New account holders", "BROKEN", true),
      page("Account Recovery", "/forgot-password", "Kendrell", "Account holders", "BROKEN", true),
      page("Privacy", "/privacy", "Kendrell", "Everyone", "UNPROVEN", true),
      page("Terms", "/terms", "Kendrell", "Everyone", "UNPROVEN", true),
      page("Platform Disclosure", "/platform-disclosure", "Kendrell", "Everyone", "UNPROVEN", true),
      page("Accessibility", "/accessibility", "Diamond", "Everyone", "MISSING"),
    ],
  },
  {
    id: "residents",
    label: "Homeowners & Renters",
    home: "/homeowner-portal",
    pages: [
      page("Resident Dashboard", "/homeowner-portal", "Diamond", "Linked homeowner or renter", "UNPROVEN", true),
      page("Account & Profile", "/homeowner-portal/profile", "Diamond", "Linked homeowner or renter", "MISSING"),
      page("Properties", "/homeowner-portal/properties", "Diamond", "Linked homeowner or renter", "MISSING"),
      page("Service Requests", "/homeowner-portal/requests", "Diamond", "Linked homeowner or renter", "UNPROVEN", true),
      page("Provider Matches", "/homeowner-portal/matches", "Dion", "Linked homeowner or renter", "MISSING"),
      page("Appointments", "/homeowner-portal/appointments", "Dion", "Linked homeowner or renter", "UNPROVEN", true),
      page("Jobs", "/homeowner-portal/jobs", "Dion", "Linked homeowner or renter", "UNPROVEN", true),
      page("Messages", "/messages", "Diamond", "Authorized participants", "UNPROVEN", true),
      page("Documents & Photos", "/documents", "Shared", "Authorized participants", "UNPROVEN", true),
      page("Reviews", "/community/reviews", "Diamond", "Eligible customers", "MISSING", true),
      page("Referrals", "/community/referrals", "Diamond", "Eligible participants", "MISSING", true),
      page("Notifications", "/notifications", "Shared", "Signed-in participants", "UNPROVEN", true),
      page("Community + Diamond", "/community-hub", "Diamond", "Signed-in participants", "MISSING", true),
    ],
  },
  {
    id: "professionals",
    label: "Professionals",
    home: "/contractor-portal",
    pages: [
      page("Professional Dashboard", "/contractor-portal", "Dion", "Linked professional", "UNPROVEN", true),
      page("Application & Verification", "/professional-application", "Dion", "Prospective professional", "MISSING", true),
      page("Business/Provider Profile", "/contractor-portal/profile", "Diamond", "Linked professional", "UNPROVEN", true),
      page("Team & Permissions", "/contractor-portal/team", "Kendrell", "Business owner and admins", "MISSING"),
      page("Services & Service Areas", "/contractor-portal/services", "Dion", "Linked professional", "MISSING"),
      page("Leads & Matching", "/matching", "Dion", "Business operations", "MISSING", true),
      page("LeadScope & Estimates", "/estimator", "Dion", "Authorized workspace", "UNPROVEN", true),
      page("Calendar & Scheduling", "/calendar", "Dion", "Authorized workspace/provider", "UNPROVEN", true),
      page("Jobs & Customers", "/jobs", "Dion", "Authorized workspace/provider", "UNPROVEN", true),
      page("Messages", "/messages", "Diamond", "Authorized participants", "UNPROVEN", true),
      page("Call Center", "/call-center", "Dion", "Authorized workspace", "UNPROVEN", true),
      page("Documents & Photos", "/documents", "Shared", "Authorized participants", "UNPROVEN", true),
      page("Reviews & Reputation", "/community/reviews", "Diamond", "Eligible participants", "MISSING", true),
      page("Subscription & Billing", "/settings/billing", "Kendrell", "Business owner", "UNPROVEN", true),
      page("Analytics", "/analytics", "Dion", "Business owner and operations", "MISSING"),
      page("Operations + Dion", "/operations", "Dion", "Authorized workspace", "UNPROVEN", true),
    ],
  },
  {
    id: "network",
    label: "Network & Map",
    home: "/network",
    pages: [
      page("Network Home", "/network", "Diamond", "Signed-in participants", "MISSING", true),
      page("Provider Directory", "/providers", "Diamond", "Residents and businesses", "MISSING", true),
      page("Map/List", "/map", "Diamond", "Residents, businesses and providers", "MISSING", true),
      page("Participant Profiles", "/profiles", "Diamond", "Signed-in participants", "MISSING", true),
      page("Service Areas", "/network/service-areas", "Dion", "Businesses and providers", "MISSING"),
      page("Provider Record Cards", "/providers/:providerId", "Diamond", "Authorized directory audience", "MISSING"),
      page("Availability", "/network/availability", "Dion", "Providers and operations", "MISSING"),
      page("Eligibility & Verification", "/network/eligibility", "Dion", "Operations and admins", "MISSING"),
      page("Saved Providers", "/network/saved", "Diamond", "Residents and businesses", "MISSING"),
    ],
  },
  {
    id: "community",
    label: "Community",
    home: "/community-hub",
    pages: [
      page("Community Home", "/community-hub", "Diamond", "Signed-in participants", "MISSING", true),
      page("Discussions", "/community/discussions", "Diamond", "Signed-in participants", "MISSING", true),
      page("Updates & Events", "/community/events", "Diamond", "Signed-in participants", "MISSING", true),
      page("Reviews", "/community/reviews", "Diamond", "Eligible participants", "MISSING", true),
      page("Referrals", "/community/referrals", "Diamond", "Eligible participants", "MISSING", true),
      page("Groups", "/community/groups", "Diamond", "Signed-in participants", "MISSING"),
      page("Reporting & Moderation", "/community/moderation", "Diamond", "Moderators and admins", "MISSING", true),
      page("Diamond Assistance", "/customer-experience", "Diamond", "Authorized participants", "UNPROVEN", true),
    ],
  },
  {
    id: "hq",
    label: "HQ",
    home: "/hq",
    pages: [
      page("Executive Dashboard", "/dashboard", "Kendrell", "Owner and business leaders", "UNPROVEN", true),
      page("Ecosystem Control Plane", "/ecosystem", "Kendrell", "Owner and admins", "WORKING", true),
      page("Golden Workflow", "/workflow", "Kendrell", "Owner, admins and operations", "UNPROVEN", true),
      page("Automation Control Plane", "/automations", "Kendrell", "Owner, admins and operations", "UNPROVEN", true),
      page("CRM", "/leads", "Dion", "Authorized workspace", "UNPROVEN", true),
      page("LeadScope", "/estimator", "Dion", "Authorized workspace", "UNPROVEN", true),
      page("Matching & Assignments", "/matching", "Dion", "Operations", "MISSING", true),
      page("Jobs & Scheduling", "/jobs", "Dion", "Operations", "UNPROVEN", true),
      page("Call Center", "/call-center", "Dion", "Appointment setters and operations", "UNPROVEN", true),
      page("Customer Experience", "/customer-experience", "Diamond", "CX and admins", "UNPROVEN", true),
      page("Provider Network", "/network", "Diamond", "Operations and CX", "MISSING", true),
      page("Community Moderation", "/community/moderation", "Diamond", "Moderators and admins", "MISSING", true),
      page("Subscriptions & Revenue", "/settings/billing", "Kendrell", "Owner", "UNPROVEN", true),
      page("Analytics & Reports", "/analytics", "Dion", "Owner and operations", "MISSING"),
      page("Approvals, Alerts & Risks", "/hq/approvals", "Kendrell", "Owner", "MISSING"),
      page("Rules, Compliance & Audit", "/rules", "Kendrell", "Owner and admins", "MISSING", true),
      page("System Health & Integrations", "/hq/system-health", "Kendrell", "Owner and admins", "MISSING"),
      page("Kendrell Command", "/hq", "Kendrell", "Owner", "UNPROVEN", true),
      page("Kendrell Dedication", "/hq/dedication", "Kendrell", "Authorized workspace", "WORKING", true),
    ],
  },
  {
    id: "shared",
    label: "Shared System",
    home: "/settings",
    pages: [
      page("My Profile", "/profile", "Diamond", "All signed-in roles", "MISSING", true),
      page("Messages", "/messages", "Diamond", "Authorized participants", "UNPROVEN", true),
      page("Notifications", "/notifications", "Shared", "All signed-in roles", "UNPROVEN", true),
      page("Documents", "/documents", "Shared", "Authorized participants", "UNPROVEN", true),
      page("Help Center", "/help", "Diamond", "All signed-in roles", "MISSING", true),
      page("Tutorials", "/tutorials", "Diamond", "All signed-in roles", "MISSING", true),
      page("Rules & Safety", "/rules", "Kendrell", "All signed-in roles", "MISSING", true),
      page("Workspace Settings", "/settings", "Kendrell", "Business owner and admins", "UNPROVEN", true),
    ],
  },
];
