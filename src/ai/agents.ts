export type AgentId = "kendrell" | "dion" | "diamond";
export type CapabilityLevel = "READ" | "SUGGEST" | "EXECUTE" | "ESCALATE";

export type AgentManifest = {
  id: AgentId;
  name: string;
  role: string;
  question: string;
  accent: string;
  route: string;
};

export const agents: Record<AgentId, AgentManifest> = {
  kendrell: { id: "kendrell", name: "Kendrell", role: "Executive Command", question: "What does the owner need to know, decide, or approve?", accent: "#F59E0B", route: "/hq" },
  dion: { id: "dion", name: "Dion", role: "Operations & Business Intelligence", question: "What is happening now, what needs attention, and where is work stuck?", accent: "#6366F1", route: "/operations" },
  diamond: { id: "diamond", name: "Diamond", role: "Customer Experience & Community", question: "What does this person need next, and how do we make the experience clear and welcoming?", accent: "#10B981", route: "/customer-experience" },
};

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
