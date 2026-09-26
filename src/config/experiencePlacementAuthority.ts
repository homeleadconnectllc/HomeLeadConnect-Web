export type PlacementAction = "KEEP" | "MOVE" | "MERGE" | "SPLIT" | "HIDE" | "REMOVE" | "REWIRE";
export type ExperienceDomain =
  | "home"
  | "work"
  | "messages"
  | "network"
  | "community"
  | "profile"
  | "settings"
  | "analytics"
  | "resources"
  | "growth"
  | "admin"
  | "system";

export type Audience =
  | "resident"
  | "professional"
  | "partner"
  | "community"
  | "staff"
  | "owner";

export type CapabilityPlacement = {
  id: string;
  capability: string;
  domain: ExperienceDomain;
  primaryHome: string;
  contextualEntryPoints: string[];
  visibleTo: Audience[];
  editableBy: Audience[];
  relatedRecord: string;
  relationshipRequirement: string;
  permissionRule: string;
  mobileSurface: string;
  notificationRelationship: string;
  workflowRelationship: string;
  auditRequirement: string;
  currentImplementation: string[];
  duplicateRisk: string;
  action: PlacementAction;
};

export const experiencePlacementAuthority: CapabilityPlacement[] = [
  {
    id: "daily-attention",
    capability: "Daily attention / next actions",
    domain: "home",
    primaryHome: "/dashboard",
    contextualEntryPoints: ["/work", "/notifications"],
    visibleTo: ["resident","professional","partner","staff","owner"],
    editableBy: [],
    relatedRecord: "Derived attention items from source records",
    relationshipRequirement: "Only records already visible to the viewer",
    permissionRule: "Summary cannot exceed source-record authority",
    mobileSurface: "Home; concise attention-first list",
    notificationRelationship: "May summarize actionable notifications",
    workflowRelationship: "Downstream summary only; never canonical state",
    auditRequirement: "None for read-only summary",
    currentImplementation: ["src/pages/dashboard/Dashboard.tsx"],
    duplicateRisk: "Dashboard can become a feature catalog if unrelated modules are promoted as peers",
    action: "KEEP",
  },
  {
    id: "operational-messages",
    capability: "Private operational messages",
    domain: "messages",
    primaryHome: "/messages",
    contextualEntryPoints: ["/leads", "/jobs", "/calendar", "/follow-ups"],
    visibleTo: ["resident","professional","staff","owner"],
    editableBy: ["resident","professional","staff","owner"],
    relatedRecord: "Conversation + lead/job/appointment/customer context",
    relationshipRequirement: "Authorized operational relationship",
    permissionRule: "Workspace/resource authorization and communication policy",
    mobileSurface: "Messages; conversation list → conversation detail",
    notificationRelationship: "Unread/action notifications deep-link to conversation",
    workflowRelationship: "Communication is attached to work; it does not create work authority",
    auditRequirement: "Delivery/history evidence remains distinct from audit",
    currentImplementation: ["src/pages/dashboard/Messages.tsx", "src/config/navigationPlacement.ts"],
    duplicateRisk: "Must remain distinct from /community/messages",
    action: "KEEP",
  },
  {
    id: "community-messages",
    capability: "Community private messenger",
    domain: "community",
    primaryHome: "/community/messages",
    contextualEntryPoints: ["/community/discover", "/community-hub", "/profiles"],
    visibleTo: ["resident","professional","partner","community"],
    editableBy: ["resident","professional","partner","community"],
    relatedRecord: "Accepted Community relationship",
    relationshipRequirement: "Accepted relationship or explicit messaging permission",
    permissionRule: "Community relationship does not grant CRM access",
    mobileSurface: "Community → relationship/thread detail",
    notificationRelationship: "Community-tier notification only",
    workflowRelationship: "May lead to an explicit service/referral/introduction action; never silently enters Work",
    auditRequirement: "Relationship and moderation history retained",
    currentImplementation: ["src/pages/dashboard/CommunityMessages.tsx", "docs/experience/HLC_E1_COMMUNITY_EXECUTION.md"],
    duplicateRisk: "Operational /messages must not be merged into this surface",
    action: "KEEP",
  },
  {
    id: "member-profile",
    capability: "Member/profile identity",
    domain: "profile",
    primaryHome: "/profile",
    contextualEntryPoints: ["/profiles", "/network", "/community/discover"],
    visibleTo: ["resident","professional","partner","community","staff","owner"],
    editableBy: ["resident","professional","partner","community","staff","owner"],
    relatedRecord: "Canonical person/profile with role-specific presentation",
    relationshipRequirement: "Visibility policy varies by viewer relationship",
    permissionRule: "Public/community fields separated from private CRM and internal verification data",
    mobileSurface: "Profile",
    notificationRelationship: "Verification/privacy changes may notify affected user",
    workflowRelationship: "Profile data supports workflows but does not create authority",
    auditRequirement: "Verification and visibility changes auditable",
    currentImplementation: ["src/config/applicationInformationArchitecture.ts", "docs/experience/HLC_IMPLEMENTATION_ACCEPTANCE_CONTRACT.md"],
    duplicateRisk: "/profile and /profiles have different responsibilities and must not collapse into a single all-data page",
    action: "SPLIT",
  },
  {
    id: "provider-directory",
    capability: "Professional discovery / provider directory",
    domain: "network",
    primaryHome: "/providers",
    contextualEntryPoints: ["/network", "/map", "/community-hub"],
    visibleTo: ["resident","professional","partner","staff","owner"],
    editableBy: ["staff","owner"],
    relatedRecord: "Professional/provider public profile and service availability",
    relationshipRequirement: "Discovery permission; no private relationship implied",
    permissionRule: "Only approved public/discovery fields",
    mobileSurface: "Network/Search → provider detail",
    notificationRelationship: "None by default",
    workflowRelationship: "Discovery may start explicit Request Service / Refer / Introduction",
    auditRequirement: "Admin verification edits auditable",
    currentImplementation: ["src/config/applicationInformationArchitecture.ts", "src/config/navigationPlacement.ts"],
    duplicateRisk: "Community discovery and provider directory overlap if purpose is not explicit",
    action: "KEEP",
  },
  {
    id: "saved-items",
    capability: "Saved/favorite people, providers, resources and opportunities",
    domain: "network",
    primaryHome: "/network",
    contextualEntryPoints: ["/providers", "/community/discover", "/resources"],
    visibleTo: ["resident","professional","partner","community"],
    editableBy: ["resident","professional","partner","community"],
    relatedRecord: "User-scoped save/favorite reference",
    relationshipRequirement: "None beyond visibility to source item",
    permissionRule: "Saving does not grant communication or CRM rights",
    mobileSurface: "Network → Saved; contextual Save actions",
    notificationRelationship: "No notification unless user explicitly opts into updates",
    workflowRelationship: "None; may become later explicit request/referral",
    auditRequirement: "Ordinary personal save history need not be compliance audit",
    currentImplementation: ["docs/HLC_APPLICATION_INFORMATION_ARCHITECTURE_2026-08-25.md"],
    duplicateRisk: "Favorites should not become separate dashboard cards by content type",
    action: "MERGE",
  },
  {
    id: "referrals",
    capability: "Referrals",
    domain: "work",
    primaryHome: "Contextual relationship/CRM records with Community referral discovery at /community/referrals",
    contextualEntryPoints: ["/community/referrals", "/profile", "/profiles", "/leads", "/contractor-portal", "/partner-portal"],
    visibleTo: ["resident","professional","partner","community","staff","owner"],
    editableBy: ["resident","professional","partner","community","staff","owner"],
    relatedRecord: "Referral with referrer, recipient, purpose, attribution, consent, status and outcome",
    relationshipRequirement: "Explicit referral purpose and allowed recipient context",
    permissionRule: "Referral never grants recipient CRM access or solicitation authority",
    mobileSurface: "Context action: Refer / Share; history under relevant profile/relationship",
    notificationRelationship: "Recipient/referrer status events where permitted",
    workflowRelationship: "created → sent → received → accepted/interested → converted/completed; terminal declined/expired/invalid",
    auditRequirement: "Attribution, consent, outcome and reward/credit changes auditable",
    currentImplementation: ["/community/referrals", "public.community_referrals", "docs/experience/HLC_IMPLEMENTATION_ACCEPTANCE_CONTRACT.md"],
    duplicateRisk: "Current Community route can be mistaken for the sole canonical home for all referral operations",
    action: "SPLIT",
  },
  {
    id: "reviews-reputation",
    capability: "Reviews and reputation",
    domain: "community",
    primaryHome: "/community/reviews",
    contextualEntryPoints: ["/providers", "/profiles", "/jobs", "/homeowner-portal", "/contractor-portal"],
    visibleTo: ["resident","professional","partner","community","staff","owner"],
    editableBy: ["resident","professional","staff","owner"],
    relatedRecord: "Review/recommendation linked to eligible relationship evidence",
    relationshipRequirement: "Verified-service review requires service evidence; recommendation may use separate trust context",
    permissionRule: "Review/reputation signals remain semantically distinct from licenses/compliance verification",
    mobileSurface: "Profile/job completion contextual action; Community reviews index",
    notificationRelationship: "Review created/responded/disputed notifications",
    workflowRelationship: "Completion may unlock review request; review never changes job completion truth",
    auditRequirement: "Moderation/dispute and eligibility evidence auditable",
    currentImplementation: ["/community/reviews", "public.community_reviews"],
    duplicateRisk: "Review and verification badges can become misleading if merged into one Verified signal",
    action: "KEEP",
  },
  {
    id: "community-discovery",
    capability: "Community discovery and relationship opportunities",
    domain: "community",
    primaryHome: "/community/discover",
    contextualEntryPoints: ["/community-hub", "/network"],
    visibleTo: ["resident","professional","partner","community"],
    editableBy: [],
    relatedRecord: "Opt-in community profile",
    relationshipRequirement: "Community visibility opt-in",
    permissionRule: "Discovery does not imply private messaging, CRM or exact-location access",
    mobileSurface: "Community/Search",
    notificationRelationship: "Optional connection/interest events",
    workflowRelationship: "Discover → Save/Interested → explicit request/relationship flow",
    auditRequirement: "Connection/block/report actions auditable",
    currentImplementation: ["src/pages/dashboard/CommunityDiscover.tsx"],
    duplicateRisk: "Navigation currently folds Network pages into Community; discovery purposes need explicit boundaries",
    action: "REWIRE",
  },
  {
    id: "statistics-analytics",
    capability: "Statistics / analytics",
    domain: "analytics",
    primaryHome: "/analytics",
    contextualEntryPoints: ["/dashboard", "/contractor-portal", "/partner-portal", "/leads", "/jobs"],
    visibleTo: ["professional","partner","staff","owner"],
    editableBy: [],
    relatedRecord: "Metric with traceable source records",
    relationshipRequirement: "Viewer has authority to underlying population",
    permissionRule: "Metric visibility cannot exceed row-level source access",
    mobileSurface: "Summary only; drill-down deeper",
    notificationRelationship: "Threshold/exception notifications only",
    workflowRelationship: "Analytics informs decisions but does not mutate lifecycle state",
    auditRequirement: "Metric definitions/versioning governed; reads generally not audit events",
    currentImplementation: ["src/config/navigationPlacement.ts", "docs/experience/HLC_IMPLEMENTATION_ACCEPTANCE_CONTRACT.md"],
    duplicateRisk: "Vanity metrics scattered across dashboards",
    action: "MOVE",
  },
  {
    id: "manuals-scripts",
    capability: "Manuals, scripts, playbooks and knowledge",
    domain: "resources",
    primaryHome: "/academy/library",
    contextualEntryPoints: ["/call-center", "/follow-ups", "/contractor-portal", "/help", "/tutorials"],
    visibleTo: ["professional","staff","owner"],
    editableBy: ["owner"],
    relatedRecord: "Versioned knowledge item",
    relationshipRequirement: "Role/access level on knowledge item",
    permissionRule: "Contextual display does not expose restricted manuals",
    mobileSurface: "Contextual Open guide; Academy/Resources for browsing",
    notificationRelationship: "Optional update notice for materially changed required guidance",
    workflowRelationship: "Workflow links to guidance; knowledge does not become workflow state",
    auditRequirement: "Approved/retired versions and owners traceable",
    currentImplementation: ["/academy/library", "/help", "/tutorials", "/call-center"],
    duplicateRisk: "Entire manuals can clutter operational pages if embedded instead of linked contextually",
    action: "MERGE",
  },
  {
    id: "appearance",
    capability: "Personal appearance and accessibility preferences",
    domain: "settings",
    primaryHome: "/settings",
    contextualEntryPoints: ["/profile"],
    visibleTo: ["resident","professional","partner","community","staff","owner"],
    editableBy: ["resident","professional","partner","community","staff","owner"],
    relatedRecord: "User preference",
    relationshipRequirement: "Authenticated user",
    permissionRule: "Cannot override contrast, mandatory warnings, organization rules or permissions",
    mobileSurface: "Profile/More → Settings → Appearance/Accessibility",
    notificationRelationship: "None",
    workflowRelationship: "None",
    auditRequirement: "Security-sensitive accessibility/privacy changes may be logged; ordinary theme changes need not be",
    currentImplementation: ["src/config/applicationInformationArchitecture.ts"],
    duplicateRisk: "Theme/background controls must not become arbitrary CSS/page-builder authority",
    action: "KEEP",
  },
  {
    id: "organization-branding",
    capability: "Organization branding",
    domain: "settings",
    primaryHome: "/settings",
    contextualEntryPoints: ["/contractor-portal", "/partner-portal"],
    visibleTo: ["professional","partner","staff","owner"],
    editableBy: ["professional","partner","owner"],
    relatedRecord: "Organization/business profile",
    relationshipRequirement: "Authorized organization management role",
    permissionRule: "Controlled logo/accent/profile imagery only; no arbitrary CSS or HLC impersonation",
    mobileSurface: "Settings → Organization → Branding",
    notificationRelationship: "Optional approval/review notice",
    workflowRelationship: "May require verification/approval before public publication",
    auditRequirement: "Brand identity changes auditable where externally published",
    currentImplementation: ["src/config/applicationInformationArchitecture.ts"],
    duplicateRisk: "Brand controls mixed with personal Appearance",
    action: "SPLIT",
  },
  {
    id: "growth-campaigns",
    capability: "HomeLead Connect growth / campaigns / advertising governance",
    domain: "growth",
    primaryHome: "Authorized internal Growth / Campaigns workspace (planned; not a dashboard tile)",
    contextualEntryPoints: ["/hq", "/analytics"],
    visibleTo: ["staff","owner"],
    editableBy: ["owner"],
    relatedRecord: "Campaign + audience + channel + approved creative + attribution",
    relationshipRequirement: "Internal growth/marketing authority",
    permissionRule: "Protected no-ad surfaces, consent and advertiser governance remain authoritative",
    mobileSurface: "Admin/deep settings only; not primary mobile navigation",
    notificationRelationship: "Campaign exception/approval alerts only",
    workflowRelationship: "Campaigns can create attributed intake/referral sources but cannot bypass consent",
    auditRequirement: "Approvals, active dates, advertiser/destination and attribution changes auditable",
    currentImplementation: [],
    duplicateRisk: "No demonstrated current canonical Growth/Campaign home; controls must not scatter across dashboards",
    action: "MOVE",
  },
  {
    id: "qr-system",
    capability: "QR codes / public sharing",
    domain: "growth",
    primaryHome: "Growth / Campaigns for campaign QR; contextual Profile/Document actions for owned destinations",
    contextualEntryPoints: ["/profile", "/profiles", "/documents", "/contractor-portal", "/partner-portal"],
    visibleTo: ["professional","partner","staff","owner"],
    editableBy: ["professional","partner","staff","owner"],
    relatedRecord: "QR destination record with owner, purpose, source/campaign, state and optional expiry",
    relationshipRequirement: "Authority over destination/profile/campaign",
    permissionRule: "No sensitive raw data encoded; scan never authenticates or grants authority",
    mobileSurface: "Share/QR contextual action",
    notificationRelationship: "Optional expiry/revocation alerts",
    workflowRelationship: "Scan can start a governed flow; it is not proof of identity/consent",
    auditRequirement: "Creation/revocation/destination changes auditable",
    currentImplementation: [],
    duplicateRisk: "No demonstrated canonical implementation in inspected source",
    action: "MOVE",
  },
  {
    id: "rewards-credits",
    capability: "Rewards / credits / earned progress",
    domain: "profile",
    primaryHome: "Profile/account value area; contextual referral/Academy progress",
    contextualEntryPoints: ["/academy", "/community/referrals", "/settings/billing"],
    visibleTo: ["resident","professional","partner","community"],
    editableBy: [],
    relatedRecord: "Truthful reward/credit ledger",
    relationshipRequirement: "Eligible event/award source",
    permissionRule: "Credits are not cash unless legally/financially defined as such; no authority gained",
    mobileSurface: "Profile summary; contextual earned-event detail",
    notificationRelationship: "Earned/expiring credit notification if enabled",
    workflowRelationship: "Downstream reward from verified outcome; never drives unsafe behavior or review sentiment",
    auditRequirement: "Financial/value-bearing credits require immutable ledger history",
    currentImplementation: [],
    duplicateRisk: "Gamification can leak into trust/compliance if mixed with verification",
    action: "MOVE",
  },
  {
    id: "support-onboarding",
    capability: "Help, support and onboarding",
    domain: "resources",
    primaryHome: "/help",
    contextualEntryPoints: ["/tutorials", "/customer-experience", "/profile", "/settings"],
    visibleTo: ["resident","professional","partner","community","staff","owner"],
    editableBy: ["staff","owner"],
    relatedRecord: "Help article/tutorial/support request",
    relationshipRequirement: "Role/context appropriate content",
    permissionRule: "Internal troubleshooting detail hidden from ordinary users",
    mobileSurface: "Profile/More → Help; contextual Help links",
    notificationRelationship: "Support-request updates",
    workflowRelationship: "Contextual help may explain workflow but does not become workflow state",
    auditRequirement: "Support case/history where applicable",
    currentImplementation: ["/help", "/tutorials", "/customer-experience"],
    duplicateRisk: "Help, tutorials and Academy can duplicate content without one versioned knowledge authority",
    action: "MERGE",
  },
  {
    id: "moderation-reporting",
    capability: "Community reporting / abuse / moderation",
    domain: "community",
    primaryHome: "/community/moderation",
    contextualEntryPoints: ["/community-hub", "/community/discussions", "/community/messages", "/community/reviews", "/profiles"],
    visibleTo: ["staff","owner"],
    editableBy: ["staff","owner"],
    relatedRecord: "Report + content/relationship + moderation decision",
    relationshipRequirement: "Reporter can report visible content; moderator requires authority",
    permissionRule: "Reporter cannot access moderator-only evidence/identity beyond policy",
    mobileSurface: "Contextual Report action; moderator queue for authorized staff",
    notificationRelationship: "Status/decision alerts to permitted parties",
    workflowRelationship: "Report → triage → decision → appeal where supported",
    auditRequirement: "Required",
    currentImplementation: ["/community/moderation", "public.community_reports"],
    duplicateRisk: "Moderation controls exposed to ordinary Community users",
    action: "KEEP",
  },
  {
    id: "exports-downloads",
    capability: "Exports / downloads",
    domain: "settings",
    primaryHome: "Record-specific export actions plus /settings privacy/data export",
    contextualEntryPoints: ["/documents", "/leads", "/jobs", "/analytics", "/profile"],
    visibleTo: ["resident","professional","partner","staff","owner"],
    editableBy: ["resident","professional","partner","staff","owner"],
    relatedRecord: "Specific records or user/account data bundle",
    relationshipRequirement: "Viewer already has export authority for source data",
    permissionRule: "Export authority evaluated separately from view authority",
    mobileSurface: "Record More menu / Settings",
    notificationRelationship: "Large export ready/failed",
    workflowRelationship: "Export is a side effect, not business lifecycle state",
    auditRequirement: "Sensitive/large exports auditable",
    currentImplementation: ["src/config/applicationInformationArchitecture.ts"],
    duplicateRisk: "Generic Download buttons can bypass record-specific authority",
    action: "SPLIT",
  },
  {
    id: "global-search",
    capability: "Universal search / discovery",
    domain: "home",
    primaryHome: "Global shell search",
    contextualEntryPoints: ["/network", "/community-hub", "/help"],
    visibleTo: ["resident","professional","partner","community","staff","owner"],
    editableBy: [],
    relatedRecord: "Search result pointing to canonical source",
    relationshipRequirement: "Permission evaluated at query time",
    permissionRule: "Never reveal inaccessible entity existence or sensitive metadata",
    mobileSurface: "Primary Search entry",
    notificationRelationship: "None",
    workflowRelationship: "Navigation only; contextual actions happen after opening result",
    auditRequirement: "Security-sensitive administrative searches may be logged",
    currentImplementation: ["docs/HLC_APPLICATION_INFORMATION_ARCHITECTURE_2026-08-25.md"],
    duplicateRisk: "Network discovery and Universal Search must not be treated as identical systems",
    action: "KEEP",
  },
  {
    id: "recently-viewed",
    capability: "Recently viewed / personal history",
    domain: "profile",
    primaryHome: "My HCX personal history",
    contextualEntryPoints: ["/dashboard", "global search"],
    visibleTo: ["resident","professional","partner","community","staff","owner"],
    editableBy: ["resident","professional","partner","community","staff","owner"],
    relatedRecord: "User-scoped navigation history pointer",
    relationshipRequirement: "User had access at time of view and still has access when reopened",
    permissionRule: "History entry never preserves access after source permission is revoked",
    mobileSurface: "Profile/More; optional Continue area on Home",
    notificationRelationship: "None",
    workflowRelationship: "None",
    auditRequirement: "Personal history is not compliance audit",
    currentImplementation: [],
    duplicateRisk: "Must not become a global shared activity feed",
    action: "MOVE",
  },
];

export type RelationshipDirection =
  | "resident->resident"
  | "resident->professional"
  | "professional->resident"
  | "resident->partner"
  | "partner->resident"
  | "professional->professional"
  | "professional->partner"
  | "partner->professional"
  | "partner->partner"
  | "resident->community"
  | "professional->community"
  | "partner->community"
  | "internal->authorized-context";

export type RelationshipRule = {
  direction: RelationshipDirection;
  discovery: boolean;
  profileView: boolean;
  followOrSave: boolean;
  referral: boolean;
  request: string[];
  directMessage: "no" | "relationship-gated" | "operational-context" | "authorized";
  serviceRequest: boolean;
  collaboration: boolean;
  documentSharing: "no" | "relationship-gated" | "record-scoped";
  contactVisibility: string;
  consent: string;
  resultingRecord: string;
  audit: string;
};

export const relationshipMatrix: RelationshipRule[] = [
  { direction:"resident->resident", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Community invitation","Share resource","Request introduction"], directMessage:"relationship-gated", serviceRequest:false, collaboration:false, documentSharing:"relationship-gated", contactVisibility:"Community/public fields only unless separately shared", consent:"Required for private contact/messaging", resultingRecord:"Community relationship/referral/introduction", audit:"Relationship/referral/moderation events" },
  { direction:"resident->professional", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Request Service","Request Callback","Request Consultation","Request Estimate","Request Appointment","Ask a Question"], directMessage:"operational-context", serviceRequest:true, collaboration:false, documentSharing:"record-scoped", contactVisibility:"Public professional contact + relationship-authorized channels", consent:"Service-contact purpose; marketing separate", resultingRecord:"Service request/lead/appointment/referral as appropriate", audit:"Consequential request/communication history" },
  { direction:"professional->resident", discovery:false, profileView:true, followOrSave:false, referral:false, request:["Respond to Request","Appointment Proposal","Follow-Up","Estimate/Proposal","Document Request","Project Update"], directMessage:"operational-context", serviceRequest:false, collaboration:false, documentSharing:"record-scoped", contactVisibility:"Only within authorized service/CRM relationship", consent:"Existing request/relationship plus channel policy", resultingRecord:"Communication/appointment/estimate/document action", audit:"Required for consequential outreach and record changes" },
  { direction:"resident->partner", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Request Resource","Request Program Information","Benefit/Service Interest"], directMessage:"relationship-gated", serviceRequest:false, collaboration:false, documentSharing:"relationship-gated", contactVisibility:"Approved partner/public contact only", consent:"Explicit request/interest", resultingRecord:"Resource/program request/referral", audit:"Request/outcome where consequential" },
  { direction:"partner->resident", discovery:false, profileView:true, followOrSave:false, referral:false, request:["Program Response","Authorized Resource Offer"], directMessage:"relationship-gated", serviceRequest:false, collaboration:false, documentSharing:"relationship-gated", contactVisibility:"Only within authorized program/referral context", consent:"Required; no uncontrolled marketing", resultingRecord:"Program/referral relationship communication", audit:"Required for outreach basis and outcome" },
  { direction:"professional->professional", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Subcontract Request","Collaboration Request","Introduction","Team Invitation","Professional Recommendation"], directMessage:"relationship-gated", serviceRequest:false, collaboration:true, documentSharing:"relationship-gated", contactVisibility:"Public professional + relationship-authorized fields", consent:"Recipient may decline; scope-specific", resultingRecord:"Professional relationship/referral/collaboration/team invitation", audit:"Consequential relationship actions" },
  { direction:"professional->partner", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Partnership Request","Supplier/Resource Relationship","Campaign Inquiry","Service Relationship"], directMessage:"relationship-gated", serviceRequest:false, collaboration:true, documentSharing:"relationship-gated", contactVisibility:"Approved business contact", consent:"Required by purpose", resultingRecord:"Partner relationship/request/referral", audit:"Relationship/campaign actions" },
  { direction:"partner->professional", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Send Opportunity","Partnership Request","Resource Offer","Campaign Participation"], directMessage:"relationship-gated", serviceRequest:false, collaboration:true, documentSharing:"relationship-gated", contactVisibility:"Approved professional/business contact", consent:"Required by purpose", resultingRecord:"Opportunity/relationship/referral", audit:"Opportunity/relationship actions" },
  { direction:"partner->partner", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Introduction","Collaboration","Program/Resource Relationship"], directMessage:"relationship-gated", serviceRequest:false, collaboration:true, documentSharing:"relationship-gated", contactVisibility:"Approved organization contact", consent:"Required by purpose", resultingRecord:"Partner relationship/introduction", audit:"Consequential relationship events" },
  { direction:"resident->community", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Express Interest","Request Introduction","Participate","Report"], directMessage:"relationship-gated", serviceRequest:false, collaboration:false, documentSharing:"no", contactVisibility:"Opt-in Community profile only", consent:"Community visibility + relationship rules", resultingRecord:"Community relationship/save/referral/report", audit:"Connection/report/moderation events" },
  { direction:"professional->community", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Express Interest","Request Introduction","Participate","Report","Share Approved Project Example"], directMessage:"relationship-gated", serviceRequest:false, collaboration:true, documentSharing:"no", contactVisibility:"Opt-in Community/professional public fields only", consent:"Community visibility + relationship rules", resultingRecord:"Community relationship/referral/report", audit:"Connection/report/moderation events" },
  { direction:"partner->community", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Express Interest","Request Introduction","Participate","Report","Share Approved Resource"], directMessage:"relationship-gated", serviceRequest:false, collaboration:true, documentSharing:"no", contactVisibility:"Opt-in Community/partner public fields only", consent:"Community visibility + relationship rules", resultingRecord:"Community relationship/referral/report", audit:"Connection/report/moderation events" },
  { direction:"internal->authorized-context", discovery:true, profileView:true, followOrSave:true, referral:true, request:["Authorized operational action"], directMessage:"authorized", serviceRequest:true, collaboration:true, documentSharing:"record-scoped", contactVisibility:"Only fields allowed by role, workspace, relationship and purpose", consent:"System + organization + role + relationship + consent", resultingRecord:"Domain-specific canonical record", audit:"Required for consequential/admin actions" },
];

export const experienceDomainsMustRemainDistinct = [
  ["messages", "community"],
  ["profile", "admin"],
  ["community", "work"],
  ["analytics", "audit"],
  ["settings", "admin"],
  ["growth", "work"],
] as const;
