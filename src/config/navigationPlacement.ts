import {
  ecosystemNavigation as baseNavigation,
  type EcosystemNavigationGroup,
  type EcosystemPage,
} from "./ecosystem";

const page = (
  label: string,
  route: string,
  owner: EcosystemPage["owner"],
  audiences: string[],
  purpose: string,
): EcosystemPage => ({ label, route, owner, audiences, purpose, status: "WORKING" });

const additionsByGroup: Record<string, EcosystemPage[]> = {
  command: [
    page("Analytics", "/analytics", "Dion", ["Owner", "Manager"], "Business intelligence, performance trends, forecasting and evidence-backed operational insight."),
  ],
  work: [
    page("Work Home", "/work", "Dion", ["Business", "Operations"], "Operational front door for active requests, jobs, scheduling, matching and next actions."),
  ],
  community: [
    page("Discover People", "/community/discover", "Diamond", ["All signed-in roles"], "Find people and relationship opportunities inside the HLC community."),
    page("Community Messages", "/community/messages", "Diamond", ["All signed-in roles"], "Connection-gated private community conversations."),
    page("Challenges", "/community/challenges", "Diamond", ["All signed-in roles"], "Community participation challenges and progress."),
    page("Community Learning", "/community/academy", "Diamond", ["All signed-in roles"], "Community education and guided participation learning."),
    page("Groups", "/community/groups", "Diamond", ["All signed-in roles"], "Role-aware community groups and shared-interest spaces."),
  ],
  resources: [
    page("Forms & Checklists", "/resources/forms", "Shared", ["Business", "Professional"], "Reusable HLC forms and operational checklists."),
  ],
};

const academyGroup: EcosystemNavigationGroup = {
  id: "academy",
  label: "Academy & CONNECT",
  purpose: "Training, practice, certifications and the CONNECT conversation system.",
  pages: [
    page("Academy Home", "/academy", "Dion", ["Business", "Professional"], "Learning paths, practice, certifications and progress."),
    page("CONNECT Roleplay", "/academy/roleplay", "Dion", ["Business", "Professional"], "Practice the CONNECT conversation system with scored coaching and retryable scenarios."),
    page("CONNECT Library", "/academy/library", "Dion", ["Business", "Professional"], "Approved CONNECT scripts, scenario guidance and conversation knowledge."),
  ],
};

const enrichedBase = baseNavigation.map((group) => {
  const additions = additionsByGroup[group.id] ?? [];
  if (additions.length === 0) return group;
  const existing = new Set(group.pages.map((item) => item.route));
  return {
    ...group,
    pages: [...additions.filter((item) => !existing.has(item.route)), ...group.pages],
  };
});

const accountIndex = enrichedBase.findIndex((group) => group.id === "account");

export const ecosystemNavigation: EcosystemNavigationGroup[] = accountIndex >= 0
  ? [...enrichedBase.slice(0, accountIndex), academyGroup, ...enrichedBase.slice(accountIndex)]
  : [...enrichedBase, academyGroup];
