export type AgentId = "kendrell" | "dion" | "diamond";

export type HlcPageKnowledge = {
  id: string;
  title: string;
  routes: string[];
  purpose: string;
  authoritativeData: string[];
  prerequisites: string[];
  workflowSteps: string[];
  allowedActions: string[];
  prohibitedAssumptions: string[];
  completionCriteria: string[];
  nextPages: string[];
  commonQuestions: string[];
  primaryAgent: AgentId;
  supportingAgents: Partial<Record<AgentId, string[]>>;
  handoffs: Array<{
    to: AgentId;
    when: string[];
    includeEvidence: string[];
  }>;
  escalationRules: string[];
};

export const HLC_GLOBAL_AGENT_BOUNDARIES = [
  "Canonical HLC records beat conversational assumptions.",
  "Knowledge does not grant authority; authorization is enforced independently by the authenticated user, workspace or portal relationship, role, capability, and channel.",
  "Discovery, liking, saving, or browsing a provider does not equal assignment, endorsement, pricing, dispatch, or scheduling.",
  "Eligibility or fit evidence does not equal assignment.",
  "Assignment does not equal provider acceptance.",
  "Provider acceptance does not equal scheduling.",
  "A scheduled appointment does not equal completion.",
  "An internal message does not prove external delivery.",
  "A carrier or device handoff does not prove a call or text occurred, was answered, transferred, recorded, delivered, or synchronized.",
  "Portal access never expands beyond the authenticated linked relationship and its authorized records.",
  "Billing state comes from authoritative billing records and must not be inferred from UI intent or conversation.",
  "A route parameter identifies a requested page shape only; it is never trusted as record evidence until an authorized lookup verifies it.",
  "Missing, conflicting, stale, or unavailable evidence must be described as unknown or escalated rather than invented.",
] as const;

export const HLC_CORE_LIFECYCLE = [
  "Lead",
  "Contact / Follow-up",
  "LeadScope",
  "Estimate Sent",
  "Accepted",
  "Job",
  "Provider eligibility evidence",
  "Assignment / acceptance",
  "Scheduling",
  "Appointment",
  "Work execution",
  "Completion",
  "Completion-linked review / follow-up",
] as const;

const sharedEvidenceHandoff = ["objective", "verified current state", "blocker", "urgency or impact", "attempted steps", "recommended next action", "definition of done"];

export const HLC_PAGE_KNOWLEDGE: HlcPageKnowledge[] = [
  {
    id: "command-center",
    title: "Dashboard / Command Center",
    routes: ["/dashboard", "/app"],
    purpose: "Provide one operating view of live HLC work, priorities, network activity, communications, analytics, and agent workspaces.",
    authoritativeData: ["leads", "follow_ups", "crm_jobs", "appointments", "notifications", "authorized workspace membership"],
    prerequisites: ["Authenticated internal HLC account", "Authorized workspace membership"],
    workflowSteps: ["Load live operating signals", "Identify overdue or time-sensitive work", "Route into the canonical operating surface", "Verify completion in the source record"],
    allowedActions: ["Review live metrics", "Open priority work", "Navigate to canonical workflow surfaces", "Open authorized agent workspaces"],
    prohibitedAssumptions: ["Dashboard summaries are not substitutes for source records", "A displayed priority does not authorize a restricted action"],
    completionCriteria: ["Priority is tied to canonical evidence", "Next owner and next surface are clear", "Any action is verified in its source record"],
    nextPages: ["/leads", "/follow-ups", "/jobs", "/calendar", "/messages", "/network/eligibility"],
    commonQuestions: ["What needs attention?", "What is blocked?", "What should happen next?"],
    primaryAgent: "kendrell",
    supportingAgents: { dion: ["Operational drill-down and queue pressure"], diamond: ["Customer and community impact"] },
    handoffs: [
      { to: "dion", when: ["Operational execution or workflow bottleneck"], includeEvidence: sharedEvidenceHandoff },
      { to: "diamond", when: ["Customer, message, community, review, or recovery work"], includeEvidence: sharedEvidenceHandoff },
    ],
    escalationRules: ["Leadership judgment, risk acceptance, or policy exception remains with the authorized human owner or manager."],
  },
  {
    id: "leads",
    title: "Leads",
    routes: ["/leads"],
    purpose: "Qualify incoming resident and customer opportunities and move ready requests toward contact, follow-up, and LeadScope estimating.",
    authoritativeData: ["lead status", "stage", "priority", "SLA status", "contact data", "notes", "source", "lead code"],
    prerequisites: ["Authorized workspace access"],
    workflowSteps: ["Receive or create lead", "Validate contact and service context", "Prioritize and assess SLA pressure", "Communicate or schedule follow-up", "Move ready request into LeadScope"],
    allowedActions: ["Create lead through canonical control", "Search and review leads", "Open lead detail", "Prepare follow-up", "Open communication", "Start LeadScope"],
    prohibitedAssumptions: ["A lead is not qualified merely because it exists", "A contact attempt is not a completed conversation", "A lead route or ID is not trusted record evidence by itself"],
    completionCriteria: ["Lead state is recorded", "Priority or SLA is understood when present", "Next owner is known", "Next action is scheduled or workflow stage advanced"],
    nextPages: ["/leads/:leadId", "/follow-ups", "/manual-communications", "/estimator"],
    commonQuestions: ["Who needs follow-up?", "Which leads are high priority?", "Is this lead ready for LeadScope?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer communication and expectation-setting"], kendrell: ["Material SLA, risk, or policy exceptions"] },
    handoffs: [
      { to: "diamond", when: ["Participant-facing communication or recovery is needed"], includeEvidence: sharedEvidenceHandoff },
      { to: "kendrell", when: ["Material SLA exposure, policy exception, or unresolved cross-functional blocker"], includeEvidence: sharedEvidenceHandoff },
    ],
    escalationRules: ["Do not invent customer intent, qualification, or completion when the record is incomplete."],
  },
  {
    id: "lead-detail",
    title: "Lead Detail",
    routes: ["/leads/:leadId"],
    purpose: "Review one verified lead record and route its next operational work.",
    authoritativeData: ["authorized lead lookup", "contact information", "status", "stage", "priority", "SLA", "appointment", "next follow-up", "notes"],
    prerequisites: ["Valid route shape", "Authorized lookup must verify the lead exists in the current workspace"],
    workflowSteps: ["Verify lead record", "Review current pipeline state", "Choose communication, follow-up, LeadScope, or job path", "Verify resulting state in the destination record"],
    allowedActions: ["Open communication", "Open follow-up", "Open LeadScope", "Open related jobs"],
    prohibitedAssumptions: ["The URL leadId is not evidence until an authorized lookup returns the record", "Displayed appointment or follow-up data must not be extrapolated"],
    completionCriteria: ["Record identity is verified", "Next action is tied to the lead", "Destination workflow state is recorded"],
    nextPages: ["/follow-ups", "/manual-communications", "/estimator", "/jobs"],
    commonQuestions: ["What happened with this lead?", "What is the next step?", "Is there a follow-up or appointment?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer communication"], kendrell: ["Risk and executive exception"] },
    handoffs: [{ to: "diamond", when: ["A customer explanation or response is needed"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Escalate missing or conflicting authoritative lead state rather than guessing."],
  },
  {
    id: "leadscope",
    title: "LeadScope",
    routes: ["/estimator", "/leadscope"],
    purpose: "Build, save, send, and manage a customer estimate, then convert an accepted estimate into a job.",
    authoritativeData: ["estimates", "estimate_lines", "lead relationship", "estimate status", "subtotal", "markup", "total", "conversion result"],
    prerequisites: ["Authorized account to save", "Verified lead context when a lead is supplied"],
    workflowSteps: ["Draft estimate", "Save estimate", "Mark sent when actually delivered through canonical workflow", "Record accepted or rejected decision", "Convert accepted estimate to job"],
    allowedActions: ["Edit draft/sent/accepted/rejected estimate through canonical controls", "Save estimate", "Convert only an accepted estimate"],
    prohibitedAssumptions: ["Draft is not sent", "Sent is not accepted", "Accepted is not converted", "A route query parameter is not verified lead or estimate evidence"],
    completionCriteria: ["Estimate totals and lines are stored", "Status reflects the real recorded state", "Accepted estimate conversion creates a canonical job", "Converted estimate remains locked"],
    nextPages: ["/jobs", "/jobs/:jobId"],
    commonQuestions: ["Can this estimate become a job?", "What is the current estimate status?", "What must happen before conversion?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer explanation of estimate status"], kendrell: ["Pricing or policy exception escalation"] },
    handoffs: [{ to: "diamond", when: ["Customer-facing estimate explanation is needed"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Only recorded accepted status permits conversion; never infer acceptance from conversation."],
  },
  {
    id: "follow-ups",
    title: "Follow-ups",
    routes: ["/follow-ups"],
    purpose: "Keep promised callbacks and next touches visible, timed, and tied to the correct lead.",
    authoritativeData: ["follow_ups", "linked lead", "scheduled_for", "status", "notes"],
    prerequisites: ["Authorized workspace", "Verified linked lead to create a follow-up"],
    workflowSteps: ["Identify required next touch", "Schedule date/time", "Record useful context", "Work overdue and due items", "Mark complete only after the follow-up is actually completed"],
    allowedActions: ["Create follow-up", "Review queue", "Mark completed through canonical control"],
    prohibitedAssumptions: ["Scheduled does not mean contacted", "Past due does not reveal why the follow-up was missed"],
    completionCriteria: ["Lead is linked", "Due time is recorded", "Status accurately reflects pending or completed", "Next action is known if work remains"],
    nextPages: ["/leads/:leadId", "/manual-communications"],
    commonQuestions: ["What is overdue?", "Who needs a callback today?", "Was this follow-up completed?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer-facing follow-up communication"], kendrell: ["Repeated SLA misses or material exception"] },
    handoffs: [{ to: "kendrell", when: ["Repeated overdue work creates material SLA or customer risk"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Repeated or high-impact misses should be escalated with evidence instead of normalized."],
  },
  {
    id: "jobs",
    title: "Jobs",
    routes: ["/jobs", "/jobs/:jobId"],
    purpose: "Operate accepted work from job creation through active execution and recorded completion.",
    authoritativeData: ["crm_jobs", "source estimate", "lead relationship", "job status", "contract value", "assignments", "appointments"],
    prerequisites: ["Canonical job record", "For converted work, an accepted estimate must have produced the job"],
    workflowSteps: ["Review pending work", "Verify provider assignment evidence", "Advance to active only through canonical controls", "Coordinate scheduling", "Record completion when evidence supports it"],
    allowedActions: ["Review job", "Update supported job status", "Open assignment/scheduling context", "Open related lead"],
    prohibitedAssumptions: ["Job creation does not prove provider assignment", "Assignment does not prove acceptance", "Active does not prove completion"],
    completionCriteria: ["Job state is canonical", "Required provider/schedule evidence is linked", "Completion is explicitly recorded"],
    nextPages: ["/network/eligibility", "/calendar", "/documents", "/community/reviews"],
    commonQuestions: ["What is blocking this job?", "Is a provider accepted?", "Is this job complete?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer status explanation"], kendrell: ["Material operational or policy exception"] },
    handoffs: [{ to: "diamond", when: ["Customer needs a verified status explanation"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Do not collapse job, assignment, appointment, and completion into one implied state."],
  },
  {
    id: "provider-network",
    title: "Provider Network",
    routes: ["/network", "/profiles", "/providers", "/providers/:providerId", "/map", "/network/map", "/matching", "/network/service-areas", "/network/availability", "/network/eligibility", "/network/saved"],
    purpose: "Explore canonical provider records and factual service-area, availability, location, eligibility, and saved-provider evidence without blurring discovery into assignment.",
    authoritativeData: ["contractors", "service-area records", "availability records", "provider status", "verified or approximate coordinates", "saved-provider decisions", "eligibility evidence"],
    prerequisites: ["Authorized workspace or permitted portal context", "Authorized provider lookup for dynamic provider detail"],
    workflowSteps: ["Discover provider", "Review canonical profile", "Review service area and availability", "Review eligibility and fit evidence", "Record save/pass decision if desired", "Use separate assignment workflow for actual work"],
    allowedActions: ["Browse directory", "Review map evidence", "Review service areas and availability", "Like/save/pass provider", "Open provider record"],
    prohibitedAssumptions: ["Discovery is not dispatch", "Saved is not selected", "Eligibility is not assignment", "Map evidence does not prove distance, ETA, routing, dispatch, or live location", "providerId in the URL is not trusted record evidence until authorized lookup"],
    completionCriteria: ["Provider facts are tied to canonical records", "Fit limitations are explicit", "Any assignment occurs through a separate recorded workflow"],
    nextPages: ["/jobs", "/calendar", "/community-hub"],
    commonQuestions: ["Who serves this area?", "Who is available?", "Is this provider eligible?", "Does saved mean assigned?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer-facing provider explanation and discovery experience"], kendrell: ["Management, safety, compliance, or provider-policy exception"] },
    handoffs: [{ to: "diamond", when: ["Participant needs a plain-language provider explanation"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Never imply endorsement or guarantee from presence in the network."],
  },
  {
    id: "calendar",
    title: "Calendar / Schedule",
    routes: ["/calendar"],
    purpose: "Operate recorded job appointments and meetings across the HLC workspace.",
    authoritativeData: ["appointments", "linked job", "linked provider", "appointment start/end", "status", "notes"],
    prerequisites: ["Canonical job", "Accepted job assignment before scheduling work"],
    workflowSteps: ["Review scheduled work", "Verify job/provider relationship", "Reschedule when necessary", "Record completed, cancelled, or no-show outcome"],
    allowedActions: ["Review schedule", "Reschedule", "Complete appointment", "Cancel appointment", "Mark no-show"],
    prohibitedAssumptions: ["Accepted assignment is not automatically scheduled", "Scheduled is not completed", "No-show must be explicitly recorded"],
    completionCriteria: ["Appointment state is explicit", "Any reschedule preserves history", "Next job action follows the recorded outcome"],
    nextPages: ["/jobs/:jobId", "/follow-ups", "/messages"],
    commonQuestions: ["What is scheduled today?", "Can this be rescheduled?", "What happened at this appointment?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer scheduling explanation"], kendrell: ["Sensitive exception or repeated schedule failure"] },
    handoffs: [{ to: "diamond", when: ["Customer-facing schedule communication is needed"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Never promise appointment availability or completion without canonical evidence."],
  },
  {
    id: "communications",
    title: "Messages & Communications",
    routes: ["/messages", "/manual-communications", "/notifications"],
    purpose: "Preserve HLC conversation history, deliberate communication actions, notifications, and voice-note evidence.",
    authoritativeData: ["conversations", "messages", "portal recipients", "voice notes", "communication records", "notifications"],
    prerequisites: ["Authorized participant or workspace context", "Explicit recipient and channel for outbound communication"],
    workflowSteps: ["Review conversation history", "Confirm recipient and intended channel", "Create internal message or deliberate external communication", "Record evidence", "Create follow-up if further action is required"],
    allowedActions: ["Post canonical internal message", "Start portal conversation", "Send email only when explicitly selected through canonical control", "Store voice note", "Review notifications"],
    prohibitedAssumptions: ["Internal message is not external delivery", "Voice note is not a telephone recording", "Drafted or recommended text is not sent communication"],
    completionCriteria: ["Message state is persisted", "External delivery is claimed only when provider/canonical evidence supports it", "Follow-up is created when needed"],
    nextPages: ["/follow-ups", "/leads/:leadId", "/customer-experience"],
    commonQuestions: ["What was said?", "Was this sent externally?", "What response should we give?"],
    primaryAgent: "diamond",
    supportingAgents: { dion: ["Operational state behind the conversation"], kendrell: ["Sensitive legal, privacy, safety, payment, discrimination, or repeated unresolved issue"] },
    handoffs: [
      { to: "dion", when: ["Conversation depends on an unresolved workflow state"], includeEvidence: sharedEvidenceHandoff },
      { to: "kendrell", when: ["Sensitive or repeated unresolved issue requires executive/risk review"], includeEvidence: sharedEvidenceHandoff },
    ],
    escalationRules: ["Do not claim delivery, resolution, refund, appointment, or other state change without evidence."],
  },
  {
    id: "community",
    title: "Community",
    routes: ["/community-hub", "/community/discussions", "/community/reviews", "/community/referrals", "/community/events", "/community/moderation", "/community/groups", "/community"],
    purpose: "Support provider discovery, durable conversations, groups, events, completion-linked reviews, referrals, rules, and moderation.",
    authoritativeData: ["canonical provider records", "community records", "completed-work eligibility for reviews", "referral attribution", "moderation records"],
    prerequisites: ["Authorized context for protected community surfaces", "Completed eligible HLC work before a completion-linked review"],
    workflowSteps: ["Participate or discover", "Keep trust signals tied to recorded HLC activity", "Report or moderate through canonical controls", "Route operational questions to the source workflow"],
    allowedActions: ["Browse community", "Participate in discussions/groups", "Review dated events", "Use eligible review/referral/moderation controls"],
    prohibitedAssumptions: ["Community discovery is not dispatch or endorsement", "Referral attribution does not automatically enroll or contact another person", "A review is not eligible without required completed-work evidence"],
    completionCriteria: ["Activity is recorded in the correct community record", "Trust claims remain evidence-linked", "Moderation follows authorized path"],
    nextPages: ["/providers", "/network/eligibility", "/rules", "/workflow"],
    commonQuestions: ["Can I review this work?", "Does this provider appear assigned?", "How do I report something?"],
    primaryAgent: "diamond",
    supportingAgents: { dion: ["Provider and workflow facts"], kendrell: ["Moderation, safety, privacy, or policy exception"] },
    handoffs: [{ to: "kendrell", when: ["Safety, privacy, moderation, discrimination, or material policy issue"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Do not turn community reputation or discovery into unsupported operational guarantees."],
  },
  {
    id: "documents",
    title: "Documents & Media",
    routes: ["/documents"],
    purpose: "Attach useful evidence to the correct HLC record with explicit sharing scope.",
    authoritativeData: ["document metadata", "storage path", "entity type", "entity ID", "sharing scope", "authorized record relationship"],
    prerequisites: ["Authorized related HLC record", "Relevant file", "Explicit sharing scope"],
    workflowSteps: ["Choose related record", "Choose sharing scope", "Upload relevant evidence", "Verify storage and relationship", "Open through authorized URL when needed"],
    allowedActions: ["Attach evidence to lead, estimate, job, appointment, contractor, or conversation", "Choose workspace/resident/professional sharing scope", "Open authorized stored evidence"],
    prohibitedAssumptions: ["Uploaded evidence is not automatically shared beyond its recorded scope", "Media content should not be interpreted beyond what is actually visible and relevant"],
    completionCriteria: ["File is stored", "Entity relationship is correct", "Sharing scope is explicit", "Sensitive unrelated material is avoided"],
    nextPages: ["/leads", "/jobs", "/messages", "/providers"],
    commonQuestions: ["Who can see this?", "Which record should this attach to?", "What evidence is useful?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer-facing sharing explanation"], kendrell: ["Privacy/security exception"] },
    handoffs: [{ to: "kendrell", when: ["Potential privacy, security, legal, or sensitive-data issue"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Avoid unnecessary faces, IDs, payment information, passwords, security codes, children, and unrelated private areas."],
  },
  {
    id: "call-center",
    title: "Call Center",
    routes: ["/call-center"],
    purpose: "Coordinate carrier/device handoffs, connected company lines, persisted call history, operator outcomes, and follow-up evidence.",
    authoritativeData: ["business phone records", "provider readiness", "call sessions", "operator dispositions", "communication subject links"],
    prerequisites: ["Authorized workspace", "Configured provider/device path for the intended action"],
    workflowSteps: ["Review provider readiness", "Prepare customer/compliance context", "Use carrier or device for live interaction when required", "Record outcome", "Create follow-up if needed"],
    allowedActions: ["Open configured carrier/device surface", "Prepare call/text workflow", "Record inbound/outbound evidence", "Record or update call disposition"],
    prohibitedAssumptions: ["Carrier handoff does not prove call occurrence", "HLC must not claim answer, transfer, hangup, recording, delivery, or synchronization without evidence", "Provider capabilities must not be invented"],
    completionCriteria: ["Call/session evidence is recorded accurately", "Disposition reflects operator/provider evidence", "Any follow-up is linked"],
    nextPages: ["/manual-communications", "/follow-ups", "/leads"],
    commonQuestions: ["Which phone path is ready?", "Was this call actually completed?", "What outcome was recorded?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer communication guidance"], kendrell: ["Compliance, security, provider-policy exception"] },
    handoffs: [{ to: "diamond", when: ["Participant-facing wording or recovery is needed"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Provider or device limitations must be stated plainly; never simulate unavailable telephony controls."],
  },
  {
    id: "account-control",
    title: "Settings / Billing / Account Control",
    routes: ["/settings", "/settings/billing", "/team", "/profile", "/analytics", "/automations", "/activity", "/workflow", "/start-here", "/ecosystem", "/help", "/tutorials", "/rules", "/hq/approvals", "/hq/system-health", "/hq/dedication"],
    purpose: "Manage authorized workspace identity, membership-backed workspace selection, business profile, telephony readiness, alerts, billing, governance, resources, and system operating views.",
    authoritativeData: ["profiles", "workspace_members", "business_profile", "business phones", "notification settings", "authoritative billing status and offer", "system/approval records"],
    prerequisites: ["Authenticated account", "Required role for restricted controls", "Explicit billing consent before enrollment"],
    workflowSteps: ["Load authoritative account state", "Apply only role-allowed changes", "Keep credentials server-side", "Use authoritative billing and provider readiness", "Verify changed state"],
    allowedActions: ["Switch among linked workspaces", "Edit allowed personal/business profile fields", "Review telephony readiness", "Manage alerts", "Start billing enrollment only with explicit consent", "Open billing portal when available"],
    prohibitedAssumptions: ["Workspace role is not client-editable", "Unverified billing is not active billing", "Provider credentials never belong in client settings", "Understanding an owner-only action does not authorize it"],
    completionCriteria: ["Updated account state is persisted", "Role boundaries remain server-controlled", "Billing state is authoritative", "Sensitive credentials remain in trusted environment"],
    nextPages: ["/dashboard", "/call-center", "/hq", "/operations", "/customer-experience"],
    commonQuestions: ["Which workspace am I in?", "What can my role change?", "Is billing active?", "Is telephony ready?"],
    primaryAgent: "kendrell",
    supportingAgents: { dion: ["Operational readiness and telephony state"], diamond: ["Plain-language account guidance"] },
    handoffs: [{ to: "dion", when: ["Settings issue is operational rather than governance/risk"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Owner, manager, billing, security, and policy controls require their existing authorization path."],
  },
  {
    id: "resident-portal",
    title: "Resident Portal",
    routes: ["/homeowner-portal", "/homeowner-portal/requests", "/homeowner-portal/appointments", "/homeowner-portal/jobs", "/homeowner-portal/documents", "/homeowner-portal/profile", "/homeowner-portal/settings", "/homeowner-portal/properties", "/homeowner-portal/matches"],
    purpose: "Show estimates, jobs, appointments, documents, profile, property, and match information explicitly authorized through the authenticated resident relationship.",
    authoritativeData: ["homeowner portal link", "linked lead", "shared estimates", "shared jobs", "shared appointments", "shared documents", "resident profile"],
    prerequisites: ["Authenticated resident portal relationship", "Record must be linked and authorized for that relationship"],
    workflowSteps: ["Load linked resident context", "Explain verified project state", "Allow eligible sent estimate decision", "Show shared jobs/appointments/evidence", "Escalate missing or sensitive issues"],
    allowedActions: ["View authorized shared records", "Accept or reject eligible sent estimate through canonical control", "Open shared evidence", "Update supported resident profile fields"],
    prohibitedAssumptions: ["Portal access does not expose workspace-wide internal data", "A resident cannot infer provider assignment or completion beyond shared canonical state"],
    completionCriteria: ["Resident sees only linked authorized records", "Any estimate decision is persisted", "Status explanations match canonical data"],
    nextPages: ["/messages", "/homeowner-portal/appointments", "/homeowner-portal/jobs"],
    commonQuestions: ["What is my project status?", "Can I accept this estimate?", "What is scheduled?", "Which files were shared?"],
    primaryAgent: "diamond",
    supportingAgents: { dion: ["Operational state explanation"], kendrell: ["Sensitive authorization or policy exception"] },
    handoffs: [{ to: "dion", when: ["Resident question depends on unresolved workflow state"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Never disclose other leads, providers, workspaces, or internal-only metrics to a resident portal user."],
  },
  {
    id: "professional-portal",
    title: "Professional Portal",
    routes: ["/contractor-portal", "/contractor-portal/profile", "/contractor-portal/services", "/contractor-portal/documents", "/contractor-portal/team"],
    purpose: "Show offers, assigned work, appointments, shared customer context, documents, and professional profile data authorized through the linked company relationship.",
    authoritativeData: ["contractor portal link", "contractor record", "job assignments", "linked job", "authorized customer context", "appointments", "shared documents"],
    prerequisites: ["Authenticated professional portal relationship", "Record must be linked and authorized for that professional company"],
    workflowSteps: ["Load linked professional identity", "Review offered or assigned work", "Accept or reject offered assignment", "Review appointments and shared evidence", "Operate only within linked professional scope"],
    allowedActions: ["View authorized offers and assignments", "Accept/reject offered assignment through canonical control", "View shared appointments and documents", "Manage supported profile/services fields"],
    prohibitedAssumptions: ["Offer is not acceptance", "Acceptance is not scheduling", "Portal access does not grant workspace-wide internal access"],
    completionCriteria: ["Assignment decision is persisted", "Professional sees only linked authorized records", "Scheduling state is explicit"],
    nextPages: ["/messages", "/contractor-portal/documents", "/contractor-portal/services"],
    commonQuestions: ["What work was offered?", "Has this assignment been accepted?", "What is scheduled?", "What files were shared?"],
    primaryAgent: "dion",
    supportingAgents: { diamond: ["Customer-facing communication guidance"], kendrell: ["Authorization, business, policy, or sensitive exception"] },
    handoffs: [{ to: "diamond", when: ["Professional needs customer-communication guidance"], includeEvidence: sharedEvidenceHandoff }],
    escalationRules: ["Never disclose unrelated workspace, customer, or provider data to a professional portal user."],
  },
  {
    id: "agent-workspaces",
    title: "HLC Agent Workspaces",
    routes: ["/hq", "/operations", "/customer-experience"],
    purpose: "Provide the three existing HLC agent workspaces with shared ecosystem knowledge while preserving distinct responsibilities and authorization boundaries.",
    authoritativeData: ["authenticated context", "workspace or portal relationship", "current page knowledge", "authorized record context", "agent capability catalog", "conversation history"],
    prerequisites: ["Authenticated authorized context", "Agent-specific access policy must pass"],
    workflowSteps: ["Resolve current context", "Use shared HLC knowledge", "Stay within agent identity and capability boundaries", "Recommend or route exact canonical control", "Verify completion in source records"],
    allowedActions: ["Explain authorized HLC state", "Recommend next steps", "Use existing deterministic agent capabilities", "Create existing handoffs where authorized"],
    prohibitedAssumptions: ["Shared knowledge does not broaden capability permissions", "Chat is advisory-only unless an existing deterministic capability explicitly performs a permitted action", "No fourth agent is introduced"],
    completionCriteria: ["Response is grounded in authorized evidence", "Agent identity remains intact", "Next action or handoff is clear", "No unauthorized action is implied"],
    nextPages: ["/dashboard", "/leads", "/jobs", "/messages", "/community-hub"],
    commonQuestions: ["What can you help with here?", "What should happen next?", "Which agent owns this work?"],
    primaryAgent: "kendrell",
    supportingAgents: { dion: ["Operations ownership"], diamond: ["Customer experience ownership"] },
    handoffs: [
      { to: "dion", when: ["Operational execution belongs to Dion"], includeEvidence: sharedEvidenceHandoff },
      { to: "diamond", when: ["Customer/community work belongs to Diamond"], includeEvidence: sharedEvidenceHandoff },
    ],
    escalationRules: ["All three agents share knowledge; primary ownership never changes authorization."],
  },
];

function normalizePathname(pathname: string) {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] || "/";
  const prefixed = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  if (prefixed === "/") return prefixed;
  return prefixed.replace(/\/+$/, "");
}

function routePatternMatches(pattern: string, pathname: string) {
  const normalizedPattern = normalizePathname(pattern);
  const normalizedPath = normalizePathname(pathname);
  const patternParts = normalizedPattern.split("/").filter(Boolean);
  const pathParts = normalizedPath.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every((part, index) => part.startsWith(":") || part === pathParts[index]);
}

export function resolveHlcPageKnowledge(pathname: string): HlcPageKnowledge | null {
  const normalized = normalizePathname(pathname);
  return HLC_PAGE_KNOWLEDGE.find((page) => page.routes.some((route) => routePatternMatches(route, normalized))) ?? null;
}

export function serializeHlcPageKnowledge(page: HlcPageKnowledge | null) {
  if (!page) return "HLC page knowledge: unmapped route. Do not infer workflow meaning from the pathname alone.";
  return [
    `HLC page: ${page.title} (${page.id})`,
    `Purpose: ${page.purpose}`,
    `Authoritative data: ${page.authoritativeData.join("; ")}`,
    `Prerequisites: ${page.prerequisites.join("; ")}`,
    `Workflow steps: ${page.workflowSteps.join(" -> ")}`,
    `Allowed page actions: ${page.allowedActions.join("; ")}`,
    `Prohibited assumptions: ${page.prohibitedAssumptions.join("; ")}`,
    `Completion criteria: ${page.completionCriteria.join("; ")}`,
    `Next pages: ${page.nextPages.join("; ")}`,
    `Primary responsibility: ${page.primaryAgent}`,
    `Escalation rules: ${page.escalationRules.join("; ")}`,
  ].join("\n");
}
