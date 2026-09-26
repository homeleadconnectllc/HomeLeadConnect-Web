import {
  ecosystemNavigation as baseNavigation,
  type EcosystemNavigationGroup,
  type EcosystemPage,
} from "./ecosystem.ts";

const page = (
  label: string,
  route: string,
  owner: EcosystemPage["owner"],
  audiences: string[],
  purpose: string,
): EcosystemPage => ({ label, route, owner, audiences, purpose, status: "WORKING" });

const additionsByGroup: Record<string, EcosystemPage[]> = {
  command: [],
  work: [
    page("Work Home", "/work", "Dion", ["Business", "Operations"], "Operational front door for active requests, jobs, scheduling, matching and next actions."),
    page("Operational Matching", "/work/matching", "Dion", ["Business", "Operations"], "Project-fit matching, eligibility review and assignment evidence inside the Work lifecycle."),
  ],
  community: [
    page("Discover People", "/community/discover", "Diamond", ["All signed-in roles"], "Find opt-in people and relationship opportunities inside the HLC community without creating CRM access."),
    page("Swipe Match", "/community/swipe", "Diamond", ["All signed-in roles"], "Community relationship discovery only; never provider assignment or operational matching."),
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
  label: "Academy",
  purpose: "Training, practice, certifications and the CONNECT conversation system.",
  pages: [
    page("Academy Home", "/academy", "Dion", ["Business", "Professional"], "Learning paths, practice, certifications and progress."),
    page("CONNECT Roleplay", "/academy/roleplay", "Dion", ["Business", "Professional"], "Practice the CONNECT conversation system with scored coaching and retryable scenarios."),
    page("CONNECT Library", "/academy/library", "Dion", ["Business", "Professional"], "Approved CONNECT scripts, scenario guidance and conversation knowledge."),
  ],
};

const messagesGroup: EcosystemNavigationGroup = {
  id: "messages",
  label: "Messages",
  purpose: "Conversation-first communication without dashboard clutter.",
  pages: [
    page("Messages", "/messages", "Diamond", ["All signed-in roles"], "Full conversation workspace with threads, attachments, unread state and record context."),
  ],
};

const analyticsGroup: EcosystemNavigationGroup = {
  id: "analytics",
  label: "Analytics",
  purpose: "Business performance and operational intelligence for authorized workspace roles.",
  pages: [
    page("Overview", "/analytics", "Dion", ["Owner", "Manager"], "Business intelligence, performance trends and evidence-backed operational insight."),
    page("Forecasting", "/analytics/forecasting", "Dion", ["Owner", "Manager"], "Forward-looking operational intelligence using available HLC evidence."),
    page("Intelligence Sandbox", "/analytics/sandbox", "Dion", ["Owner", "Manager"], "Explore analytics scenarios without changing operational records."),
  ],
};

const groupById = new Map(baseNavigation.map((group) => [group.id, group]));

const commandBase = groupById.get("command");
const workBase = groupById.get("work");
const networkBase = groupById.get("network");
const communityBase = groupById.get("community");
const connectBase = groupById.get("connect");
const resourcesBase = groupById.get("resources");
const accountBase = groupById.get("account");

const mergePages = (...lists: EcosystemPage[][]): EcosystemPage[] => {
  const seen = new Set<string>();
  return lists.flat().filter((item) => {
    if (seen.has(item.route)) return false;
    seen.add(item.route);
    return true;
  });
};

const commandGroup: EcosystemNavigationGroup | null = commandBase
  ? {
      ...commandBase,
      label: "Home & Command",
      purpose: "Daily priorities, executive truth, alerts and cross-workspace coordination.",
      pages: mergePages(additionsByGroup.command ?? [], commandBase.pages.filter((item) => item.route !== "/analytics")),
    }
  : null;

const workGroup: EcosystemNavigationGroup | null = workBase
  ? {
      ...workBase,
      label: "Work",
      pages: mergePages(additionsByGroup.work ?? [], workBase.pages),
    }
  : null;

const networkGroup: EcosystemNavigationGroup | null = networkBase
  ? {
      ...networkBase,
      label: "Network & Discovery",
      purpose: "Provider directory, profiles, privacy-safe map and saved discovery. Operational matching stays in Work; Community relationships stay in Community.",
      pages: networkBase.pages.filter((item) => item.route !== "/matching"),
    }
  : null;

const communityGroup: EcosystemNavigationGroup | null = communityBase
  ? {
      ...communityBase,
      label: "Community",
      purpose: "Opt-in people, discussions, events, reviews, referrals and relationship-based community interaction.",
      pages: mergePages(
        additionsByGroup.community ?? [],
        communityBase.pages,
      ),
    }
  : null;

const communicationGroup: EcosystemNavigationGroup | null = connectBase
  ? {
      ...connectBase,
      id: "communications",
      label: "Calls & Communication",
      purpose: "Calls, texts, voicemail and communication operations separate from the primary Messages experience.",
      pages: connectBase.pages.filter((item) => item.route !== "/messages"),
    }
  : null;

const resourcesGroup: EcosystemNavigationGroup | null = resourcesBase
  ? {
      ...resourcesBase,
      label: "Resources",
      pages: mergePages(additionsByGroup.resources ?? [], resourcesBase.pages),
    }
  : null;

const accountGroup: EcosystemNavigationGroup | null = accountBase
  ? {
      ...accountBase,
      label: "Account & Settings",
    }
  : null;

export const ecosystemNavigation: EcosystemNavigationGroup[] = [
  commandGroup,
  workGroup,
  networkGroup,
  communityGroup,
  messagesGroup,
  communicationGroup,
  resourcesGroup,
  academyGroup,
  analyticsGroup,
  accountGroup,
].filter((group): group is EcosystemNavigationGroup => Boolean(group));
