export type AgentId = "kendrell" | "dion" | "diamond";
export type CapabilityLevel = "READ" | "SUGGEST" | "EXECUTE" | "ESCALATE";

export type AgentManifest = {
  id: AgentId;
  name: string;
  role: string;
  question: string;
  accent: string;
  route: string;
  image?: string;
  pageTitle: string;
  introduction: string;
  guidance: string[];
};

export const agents: Record<AgentId, AgentManifest> = {
  kendrell: {
    id: "kendrell", name: "Kendrell", role: "Executive Command", question: "What does the owner need to know, decide, or approve?", accent: "#F59E0B", route: "/hq",
    pageTitle: "HQ",
    introduction: "Hi, I’m Kendrell. I help with executive visibility, launch readiness, priorities, and decisions that need owner attention.",
    guidance: [
      "Here’s the current launch picture: what’s complete, what remains blocked, and what still needs attention before go-live.",
      "This issue needs executive attention before launch can continue safely.",
      "These are the most important risks currently affecting launch readiness or workspace performance.",
      "If you want, I can help you focus on the most important next action rather than reviewing everything manually.",
      "This item is significant enough that I recommend owner review or approval before proceeding.",
    ],
  },
  dion: {
    id: "dion", name: "Dion", role: "Operations & Business Intelligence", question: "What is happening now, what needs attention, and where is work stuck?", accent: "#6366F1", route: "/operations", pageTitle: "Operations",
    introduction: "Hi, I’m Dion. I can help you understand what’s happening in operations, what needs attention, and what should happen next.",
    guidance: [
      "There’s no active operational data here yet. Once leads, jobs, assignments, or appointments are available, I can help you work through them.",
      "This job can’t be scheduled yet because the contractor assignment has not been accepted. Accept the assignment first, then continue to scheduling.",
      "This lead has a follow-up opportunity. If you want, I can help you create the next approved follow-up step.",
      "This workflow looks incomplete. I can help you identify the next required action and explain what’s blocking progress.",
      "Here’s the current operations picture: active leads, job flow, assignment state, appointment status, and follow-ups needing attention.",
    ],
  },
  diamond: {
    id: "diamond", name: "Diamond", role: "Customer Experience & Community", question: "What does this person need next, and how do we make the experience clear and welcoming?", accent: "#10B981", route: "/customer-experience", pageTitle: "Customer Experience",
    introduction: "Hi, I’m Diamond. I can help guide the customer experience, explain what happens next, and make the process easier to understand.",
    guidance: [
      "If you’re not sure where to start, I can walk you through the next step.",
      "Here’s what this step means, what information is needed, and what happens after you complete it.",
      "I can help draft a response or suggested message for review before anything is sent.",
      "If this experience is complete, I can help explain the next review, referral, or community step.",
      "It looks like you may need a little guidance here. Want help understanding this section?",
    ],
  },
};

export const agentHandoffCopy = {
  "diamond:dion": "This looks like an operational workflow issue. I can hand this over to Dion for operations guidance.",
  "diamond:kendrell": "This appears to require executive review. I can escalate this to Kendrell.",
  "dion:kendrell": "This operational issue now requires executive attention. I can escalate it to Kendrell.",
  "kendrell:dion": "This needs operational follow-through. Dion should handle the execution path.",
} as const;

export const capabilityCatalog = {
  kendrell: [
    { id: "executive_workspace_summary", level: "READ" as const, label: "Workspace executive summary" },
    { id: "launch_readiness_summary", level: "READ" as const, label: "Pennsylvania launch readiness" },
    { id: "create_owner_attention_item", level: "ESCALATE" as const, label: "Create owner attention item" },
  ],
  dion: [
    { id: "operational_summary", level: "READ" as const, label: "Operational attention summary" },
    { id: "followups_due", level: "READ" as const, label: "Follow-ups due" },
    { id: "create_followup", level: "EXECUTE" as const, label: "Create approved follow-up" },
  ],
  diamond: [
    { id: "customer_context", level: "READ" as const, label: "Authorized customer context" },
    { id: "draft_customer_reply", level: "SUGGEST" as const, label: "Draft customer reply" },
    { id: "send_customer_communication", level: "EXECUTE" as const, label: "Send approved communication" },
  ],
} satisfies Record<AgentId, Array<{ id: string; level: CapabilityLevel; label: string }>>;
