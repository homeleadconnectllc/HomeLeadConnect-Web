export type RuntimeConnectVariant = "master" | "quick" | "standard" | "warm" | "professional" | "high-touch";
export type RuntimeConnectTeacher = "kendrell" | "dion" | "diamond";

export const RUNTIME_CONNECT_FRAMEWORK = [
  { key: "C", name: "Context", purpose: "Identify HLC accurately and connect the conversation to the resident, professional, request, or workflow." },
  { key: "O", name: "Open", purpose: "Use one easy, relevant open question that gets the other person talking." },
  { key: "N1", name: "Need", purpose: "Understand the actual need, desired outcome, urgency, and constraints." },
  { key: "N2", name: "Notice Impact", purpose: "Understand why the situation matters without manufacturing fear or urgency." },
  { key: "E", name: "Explore Fit", purpose: "Explain only the relevant HLC path, connection, scheduling, or support option." },
  { key: "C2", name: "Confirm", purpose: "Summarize what was heard and verify details, participants, and decision requirements." },
  { key: "T", name: "Take the Next Step", purpose: "Move to the appropriate appointment, connection, callback, request update, follow-up, or close." },
] as const;

export const RUNTIME_CONNECT_SCORING_RUBRIC = [
  { id: "listening", label: "Listening", weight: 20 },
  { id: "discovery", label: "Discovery", weight: 20 },
  { id: "qualification", label: "Qualification", weight: 15 },
  { id: "accuracy", label: "Accuracy", weight: 15 },
  { id: "next-step", label: "Appropriate next step", weight: 15 },
  { id: "compliance", label: "Compliance & boundaries", weight: 10 },
  { id: "experience", label: "Customer experience", weight: 5 },
] as const;

export type RuntimeConnectScenario = {
  id: string;
  title: string;
  audience: string;
  teacher: RuntimeConnectTeacher;
  goal: string;
  requiredInformation: string[];
  suggestedQuestions: string[];
  recommendedDispositionIds: string[];
  variants: Array<{ variant: RuntimeConnectVariant; label: string; body: string }>;
};

const residentNewRequest: RuntimeConnectScenario = {
  id: "resident-new-request",
  title: "New service request",
  audience: "resident",
  teacher: "diamond",
  goal: "Understand the request, desired outcome, timing, and constraints without overselling or promising a provider outcome.",
  requiredInformation: ["service/project", "property or service location", "desired outcome", "timing/urgency", "contact preference", "important constraints"],
  suggestedQuestions: ["What are you looking to have done?", "How long has this been something you wanted to handle?", "What would a good outcome look like?", "Is there a timeframe you are trying to meet?"],
  recommendedDispositionIds: ["connected-qualified", "callback-requested", "ready-for-matching", "do-not-contact"],
  variants: [
    { variant: "master", label: "Master", body: "Hi [First Name], this is [Name] with HomeLead Connect. I’m following up on the request you submitted about [project/service]. I want to make sure we understand what you actually need before we point you in the wrong direction. Tell me a little about what’s going on and what you’d like to get taken care of." },
    { variant: "quick", label: "Quick", body: "Hi [Name], this is [Rep] with HomeLead Connect following up on your [service] request. Tell me a little about what you’re looking to have done, and I’ll help figure out the right next step." },
    { variant: "standard", label: "Standard", body: "Hi [First Name], this is [Name] with HomeLead Connect. I’m following up on your [service] request. I’d like to understand the project, what matters most to you, and your preferred timing so we can organize the right next step. What are you looking to have done?" },
    { variant: "warm", label: "Warm", body: "Hey [Name], it’s [Rep] with HomeLead Connect. I saw your request come through for help with [service]. I wanted to reach out personally instead of just sending you somewhere blindly. What’s happening with the project?" },
    { variant: "professional", label: "Professional", body: "Hello [Name], this is [Rep] with HomeLead Connect regarding your request for [service]. I’d like to understand the project, your preferred timing, and anything important to you so we can determine the appropriate next step. Could you walk me through what you need?" },
    { variant: "high-touch", label: "High-Touch", body: "Hi [Name], this is [Rep] with HomeLead Connect. I’m taking a look at your request now, and before we make any connection I want to understand the situation from your side. Start wherever makes sense—what are you dealing with, what would you like changed, and what would make this a good service experience for you?" },
  ],
};

export const RUNTIME_CONNECT_SCENARIOS: RuntimeConnectScenario[] = [residentNewRequest];

export function getRuntimeConnectScenario(id: string) {
  return RUNTIME_CONNECT_SCENARIOS.find((scenario) => scenario.id === id);
}
