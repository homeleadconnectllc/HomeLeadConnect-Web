import { intelligentDispositions } from "./intelligentDispositions.ts";
import { objectionGuides, scriptLibrary, type HlcScript, type ScriptAudience, type ScriptChannel } from "./scriptLibrary.ts";

export const CONNECT_FRAMEWORK = [
  { key: "C", name: "Context", purpose: "Identify HLC accurately and connect the conversation to the resident, professional, request, or workflow." },
  { key: "O", name: "Open", purpose: "Use one easy, relevant open question that gets the other person talking." },
  { key: "N1", name: "Need", purpose: "Understand the actual need, desired outcome, urgency, and constraints." },
  { key: "N2", name: "Notice Impact", purpose: "Understand why the situation matters without manufacturing fear or urgency." },
  { key: "E", name: "Explore Fit", purpose: "Explain only the relevant HLC path, connection, scheduling, or support option." },
  { key: "C2", name: "Confirm", purpose: "Summarize what was heard and verify details, participants, and decision requirements." },
  { key: "T", name: "Take the Next Step", purpose: "Move to the appropriate appointment, connection, callback, request update, follow-up, or close." },
] as const;

export type ConnectVariant = "master" | "quick" | "standard" | "warm" | "professional" | "high-touch";
export type ConnectApprovalState = "approved" | "draft";
export type ConnectDifficulty = "foundation" | "intermediate" | "advanced";
export type ConnectTeacher = "kendrell" | "dion" | "diamond";

export type ConnectScriptVariant = {
  id: string;
  label: string;
  variant: ConnectVariant;
  body: string;
  approved: ConnectApprovalState;
};

export type ConnectScenario = {
  id: string;
  title: string;
  audience: ScriptAudience | "partner";
  role: "resident-care" | "operations" | "provider-success" | "leadership";
  channel: ScriptChannel | "multi-channel";
  teacher: ConnectTeacher;
  difficulty: ConnectDifficulty;
  useWhen: string[];
  doNotUseWhen: string[];
  goal: string;
  requiredInformation: string[];
  suggestedQuestions: string[];
  likelyObjections: string[];
  recommendedDispositionIds: string[];
  sourceScriptIds: string[];
  variants: ConnectScriptVariant[];
};

export type ConnectFolder = {
  id: string;
  title: string;
  summary: string;
  children?: ConnectFolder[];
  scenarios?: ConnectScenario[];
};

const residentRequestVariants: ConnectScriptVariant[] = [
  {
    id: "resident-new-request-master",
    label: "Master",
    variant: "master",
    approved: "approved",
    body: "Hi [First Name], this is [Name] with HomeLead Connect. I’m following up on the request you submitted about [project/service]. I want to make sure we understand what you actually need before we point you in the wrong direction. Tell me a little about what’s going on and what you’d like to get taken care of.",
  },
  {
    id: "resident-new-request-quick",
    label: "Quick",
    variant: "quick",
    approved: "approved",
    body: "Hi [Name], this is [Rep] with HomeLead Connect following up on your [service] request. Tell me a little about what you’re looking to have done, and I’ll help figure out the right next step.",
  },
  {
    id: "resident-new-request-standard",
    label: "Standard",
    variant: "standard",
    approved: "approved",
    body: "Hi [First Name], this is [Name] with HomeLead Connect. I’m following up on your [service] request. I’d like to understand the project, what matters most to you, and your preferred timing so we can organize the right next step. What are you looking to have done?",
  },
  {
    id: "resident-new-request-warm",
    label: "Warm",
    variant: "warm",
    approved: "approved",
    body: "Hey [Name], it’s [Rep] with HomeLead Connect. I saw your request come through for help with [service]. I wanted to reach out personally instead of just sending you somewhere blindly. What’s happening with the project?",
  },
  {
    id: "resident-new-request-professional",
    label: "Professional",
    variant: "professional",
    approved: "approved",
    body: "Hello [Name], this is [Rep] with HomeLead Connect regarding your request for [service]. I’d like to understand the project, your preferred timing, and anything important to you so we can determine the appropriate next step. Could you walk me through what you need?",
  },
  {
    id: "resident-new-request-high-touch",
    label: "High-Touch",
    variant: "high-touch",
    approved: "approved",
    body: "Hi [Name], this is [Rep] with HomeLead Connect. I’m taking a look at your request now, and before we make any connection I want to understand the situation from your side. Start wherever makes sense—what are you dealing with, what would you like changed, and what would make this a good service experience for you?",
  },
];

const residentNewRequest: ConnectScenario = {
  id: "resident-new-request",
  title: "New service request",
  audience: "resident",
  role: "resident-care",
  channel: "call",
  teacher: "diamond",
  difficulty: "foundation",
  useWhen: ["A resident submitted a new service request", "An inbound resident needs help identifying the right next step"],
  doNotUseWhen: ["The resident has opted out of the channel", "An emergency requires immediate emergency-service guidance instead of routine intake"],
  goal: "Understand the request, desired outcome, timing, and constraints without overselling or promising a provider outcome.",
  requiredInformation: ["service/project", "property or service location", "desired outcome", "timing/urgency", "contact preference", "important constraints"],
  suggestedQuestions: ["What are you looking to have done?", "How long has this been something you wanted to handle?", "What would a good outcome look like?", "Is there a timeframe you are trying to meet?"],
  likelyObjections: ["not-ready", "need-to-think", "already-have-provider", "dont-want-calls"],
  recommendedDispositionIds: ["connected-qualified", "callback-requested", "ready-for-matching", "do-not-contact"],
  sourceScriptIds: ["resident-inbound-intake", "resident-outbound-new-request"],
  variants: residentRequestVariants,
};

export const CONNECT_SCRIPT_FOLDERS: ConnectFolder[] = [
  {
    id: "residents",
    title: "Residents",
    summary: "Resident request, follow-up, scheduling, support, completion, review, and referral conversations.",
    children: [
      { id: "residents-new-request", title: "New Request", summary: "Understand the need before choosing the next HLC path.", scenarios: [residentNewRequest] },
      { id: "residents-follow-up", title: "Follow-Up", summary: "No-answer, callback, reactivation, and respectful closeout conversations." },
      { id: "residents-appointment", title: "Appointment Setting", summary: "Booking, qualification, confirmation, reschedule, and no-show recovery conversations." },
      { id: "residents-after-service", title: "After Service", summary: "Completion check-ins, issue recovery, reviews, and referrals." },
    ],
  },
  {
    id: "providers",
    title: "Providers & Contractors",
    summary: "Recruitment, onboarding, opportunity, availability, assignment, and follow-up conversations.",
    children: [
      { id: "providers-recruitment", title: "Recruitment", summary: "Introduce HLC, understand the provider business, and determine network fit." },
      { id: "providers-opportunities", title: "Opportunities", summary: "Present opportunities without implying guaranteed work." },
    ],
  },
  {
    id: "partners",
    title: "Partners",
    summary: "Business-development, discovery, demo, pilot, follow-up, and dormant-relationship conversations.",
  },
  {
    id: "objections",
    title: "Objections",
    summary: "Clarify concerns, reduce pressure, protect customer choice, and select an appropriate next action.",
  },
  {
    id: "channels",
    title: "Channel Templates",
    summary: "Approved call, voicemail, text, email, and in-app patterns.",
  },
  {
    id: "internal",
    title: "Internal HLC",
    summary: "Agent handoffs, escalations, qualification summaries, CRM notes, and callback preparation.",
  },
];

export function flattenConnectFolders(folders: ConnectFolder[] = CONNECT_SCRIPT_FOLDERS): ConnectFolder[] {
  return folders.flatMap((folder) => [folder, ...flattenConnectFolders(folder.children ?? [])]);
}

export function getConnectScenario(id: string): ConnectScenario | undefined {
  return flattenConnectFolders().flatMap((folder) => folder.scenarios ?? []).find((scenario) => scenario.id === id);
}

export function searchConnectLibrary(query: string): Array<{ folder: ConnectFolder; scenario?: ConnectScenario }> {
  const normalized = query.trim().toLowerCase();
  const results: Array<{ folder: ConnectFolder; scenario?: ConnectScenario }> = [];
  for (const folder of flattenConnectFolders()) {
    const folderText = `${folder.title} ${folder.summary}`.toLowerCase();
    if (!normalized || folderText.includes(normalized)) results.push({ folder });
    for (const scenario of folder.scenarios ?? []) {
      const text = [scenario.title, scenario.goal, scenario.audience, scenario.role, scenario.channel, scenario.teacher, ...scenario.useWhen, ...scenario.suggestedQuestions, ...scenario.likelyObjections]
        .join(" ")
        .toLowerCase();
      if (!normalized || text.includes(normalized)) results.push({ folder, scenario });
    }
  }
  return results;
}

export function resolveConnectScenarioEvidence(scenario: ConnectScenario) {
  return {
    sourceScripts: scenario.sourceScriptIds.map((id) => scriptLibrary.find((script) => script.id === id)).filter((script): script is HlcScript => Boolean(script)),
    objections: scenario.likelyObjections.map((id) => objectionGuides.find((guide) => guide.id === id)).filter(Boolean),
    dispositions: scenario.recommendedDispositionIds.map((id) => intelligentDispositions.find((item) => item.id === id)).filter(Boolean),
  };
}

export const CONNECT_SCORING_RUBRIC = [
  { id: "listening", label: "Listening", weight: 20 },
  { id: "discovery", label: "Discovery", weight: 20 },
  { id: "qualification", label: "Qualification", weight: 15 },
  { id: "accuracy", label: "Accuracy", weight: 15 },
  { id: "next-step", label: "Appropriate next step", weight: 15 },
  { id: "compliance", label: "Compliance & boundaries", weight: 10 },
  { id: "experience", label: "Customer experience", weight: 5 },
] as const;

export const CONNECT_BEHAVIOR_RULE = "Scripts are guardrails, not speeches." as const;
