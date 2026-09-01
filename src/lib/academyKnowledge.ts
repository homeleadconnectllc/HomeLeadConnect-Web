export const ACADEMY_E3_ROUTES = {
  roleplay: "/academy/roleplay",
  library: "/academy/library",
  help: "/help",
  tutorials: "/tutorials",
  rules: "/rules",
} as const;

export type AcademyTeacher = "kendrell" | "dion" | "diamond";
export type KnowledgeKind = "guide" | "script" | "policy" | "scenario";

export type KnowledgeEntry = {
  id: string;
  title: string;
  summary: string;
  teacher: AcademyTeacher;
  kind: KnowledgeKind;
  tags: string[];
  sourceRoute: string;
};

export const ROLEPLAY_GUARDRAILS = [
  "Practice is simulation, never a real customer interaction.",
  "Scores are coaching evidence, not customer trust or external credentials.",
  "No simulation may write to leads, jobs, appointments, messages, or production workflow state.",
] as const;

export const ROLEPLAY_SCENARIOS = [
  {
    id: "resident-intake",
    title: "Resident intake conversation",
    teacher: "diamond" as const,
    audience: "resident-care",
    objective: "Practice clear, respectful discovery without promising an outcome or provider assignment.",
  },
  {
    id: "appointment-setting",
    title: "Appointment-setting fundamentals",
    teacher: "dion" as const,
    audience: "operations",
    objective: "Practice qualification, next-action clarity, and accurate handoff into the real work lifecycle.",
  },
  {
    id: "risk-escalation",
    title: "Risk and escalation judgment",
    teacher: "kendrell" as const,
    audience: "leadership",
    objective: "Practice recognizing policy, compliance, and manager-approval boundaries before acting.",
  },
] as const;

export const KNOWLEDGE_LIBRARY: KnowledgeEntry[] = [
  {
    id: "help-operating-guide",
    title: "Help & operating guide",
    summary: "Existing operational guidance remains canonical and is surfaced through the Academy library rather than duplicated.",
    teacher: "dion",
    kind: "guide",
    tags: ["help", "operations", "workflow"],
    sourceRoute: ACADEMY_E3_ROUTES.help,
  },
  {
    id: "tutorials-learning-support",
    title: "Tutorials & learning support",
    summary: "Step-by-step product learning remains available at its existing URL and feeds the Academy knowledge experience.",
    teacher: "diamond",
    kind: "guide",
    tags: ["tutorials", "onboarding", "learning"],
    sourceRoute: ACADEMY_E3_ROUTES.tutorials,
  },
  {
    id: "rules-policy-library",
    title: "Rules & policy guidance",
    summary: "Policy guidance stays distinct from coaching and is owned by Kendrell for governance and escalation context.",
    teacher: "kendrell",
    kind: "policy",
    tags: ["rules", "policy", "compliance"],
    sourceRoute: ACADEMY_E3_ROUTES.rules,
  },
];

export function filterKnowledge(query: string, teacher?: AcademyTeacher) {
  const normalized = query.trim().toLowerCase();
  return KNOWLEDGE_LIBRARY.filter((entry) => {
    if (teacher && entry.teacher !== teacher) return false;
    if (!normalized) return true;
    return [entry.title, entry.summary, entry.kind, entry.teacher, ...entry.tags]
      .join(" ")
      .toLowerCase()
      .includes(normalized);
  });
}
