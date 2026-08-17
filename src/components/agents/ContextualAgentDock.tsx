import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { trackAnalyticsEvent } from "../../api/analytics";
import { chatWithAgent } from "../../api/agentChat";
import AgentChatPanel from "./AgentChatPanel";
import type { AgentId } from "../../ai/agents";
import { useAuth } from "../../hooks/useAuth";
import { normalizeInternalRole, type InternalRole } from "../../lib/accessPolicy";
import { getAgentVoicePreferences, isAgentAudioSupported, prepareAgentAudio, speakAgentText } from "../../lib/agentVoice";
import { supabase } from "../../lib/supabase";

type AgentConfig = {
  id: AgentId;
  name: string;
  role: string;
  accent: string;
  avatar: string;
};

type AccessContext = {
  kind: "internal" | "resident" | "professional" | null;
  role: InternalRole | null;
  userId: string | null;
};

type TabTutorial = {
  title: string;
  intro: string;
  steps: string[];
};

const agents: Record<AgentId, AgentConfig> = {
  kendrell: { id: "kendrell", name: "Kendrell", role: "Command", accent: "#3B82F6", avatar: "/brand/avatars/Kendrell_Locked_HLC.png" },
  dion: { id: "dion", name: "Dion", role: "Operations & BI", accent: "#3B82F6", avatar: "/brand/avatars/Dion_Locked_HLC.png" },
  diamond: { id: "diamond", name: "Diamond", role: "Customer Experience", accent: "#60A5FA", avatar: "/brand/avatars/Diamond_Locked_HLC.png" },
};

const hiddenRoutes = new Set(["/hq", "/operations", "/customer-experience"]);
const internalFallbackPrefixes = [
  "/dashboard", "/start-here", "/ecosystem", "/workflow", "/automations", "/activity",
  "/network", "/map", "/profiles", "/providers", "/matching", "/community-hub",
  "/community/discussions", "/community/reviews", "/community/referrals", "/community/events",
  "/community/moderation", "/community/groups", "/help", "/tutorials", "/rules", "/profile",
  "/analytics", "/settings", "/leads", "/estimator", "/jobs", "/calendar", "/team",
  "/follow-ups", "/manual-communications", "/documents", "/call-center", "/messages", "/notifications",
];

function isInternalOnlyRoute(pathname: string) {
  return internalFallbackPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function resolveAgent(pathname: string, access: AccessContext): AgentConfig | null {
  if (access.kind === "resident") return agents.diamond;
  if (access.kind === "professional") return agents.dion;
  if (access.kind === null && isInternalOnlyRoute(pathname)) return agents.dion;
  if (access.kind !== "internal") return null;

  if (
    pathname.startsWith("/leads") || pathname.startsWith("/estimator") || pathname.startsWith("/jobs") ||
    pathname.startsWith("/calendar") || pathname.startsWith("/follow-ups") || pathname.startsWith("/call-center") ||
    pathname.startsWith("/manual-communications") || pathname.startsWith("/documents") || pathname.startsWith("/workflow") ||
    pathname.startsWith("/network") || pathname.startsWith("/map") || pathname.startsWith("/providers") ||
    pathname.startsWith("/matching") || pathname.startsWith("/operations")
  ) return agents.dion;

  if (
    pathname.startsWith("/messages") || pathname.startsWith("/notifications") || pathname.startsWith("/community") ||
    pathname.startsWith("/customer-experience")
  ) return agents.diamond;

  if (access.role === "owner") return agents.kendrell;
  return agents.dion;
}

function tutorialFor(pathname: string, agent: AgentConfig): TabTutorial {
  if (pathname === "/dashboard") return {
    title: "How to use Dashboard",
    intro: `${agent.name} can walk you through what needs attention now.`,
    steps: ["Scan priorities, overdue work, recent activity, and today’s schedule.", "Use the mobile Call, Text, Schedule, Follow Up, and Voice Note actions for fast work on the go.", "Open the underlying lead, job, message, or appointment before making a major change so the team keeps one source of truth."],
  };
  if (pathname.startsWith("/leads")) return {
    title: "How to work Leads",
    intro: `${agent.name} helps move each lead from first contact to a clear next action.`,
    steps: ["Open the lead and review contact, service need, source, status, and history.", "Call or text from the lead context and record the outcome.", "Set the next follow-up or move the lead forward so another employee immediately knows what happens next."],
  };
  if (pathname.startsWith("/jobs")) return {
    title: "How to work Jobs",
    intro: `${agent.name} helps coordinate accepted work from assignment through completion.`,
    steps: ["Review the customer, estimate, provider assignment, status, and schedule.", "Use the explicit offer and acceptance workflow before treating a provider as assigned.", "Keep appointments, completion, documents, and follow-up tied to the same job record."],
  };
  if (pathname.startsWith("/messages")) return {
    title: "How to use Messages",
    intro: `${agent.name} helps keep customer and provider communication organized.`,
    steps: ["Choose the correct conversation before sending or recording anything.", "Review recent history so remote employees do not duplicate outreach.", "Use text, attachments, or voice notes and keep the next action tied to the conversation."],
  };
  if (pathname.startsWith("/calendar")) return {
    title: "How to use Schedule",
    intro: `${agent.name} helps coordinate appointments, callbacks, and field work.`,
    steps: ["Open the scheduled item and confirm the linked customer, job, provider, and time.", "Use reschedule only when the underlying assignment remains valid.", "From mobile, jump straight into call, text, or follow-up when timing changes."],
  };
  if (pathname.startsWith("/follow-ups")) return {
    title: "How to work Follow Ups",
    intro: `${agent.name} treats this as the team callback and next-action queue.`,
    steps: ["Handle overdue and due-now items first.", "Open the linked lead, job, customer, or conversation before contacting them.", "Complete or reschedule the follow-up with a clear outcome so the queue stays trustworthy."],
  };
  if (pathname.startsWith("/call-center") || pathname.startsWith("/manual-communications")) return {
    title: "How to use the Communications Hub",
    intro: `${agent.name} helps HLC act as the customer-context layer around the active carrier.`,
    steps: ["Choose the correct company line and contact before starting or logging communication.", "For Google Voice, HLC can launch Call, Text, and Open Google Voice while ringing and live controls remain in Google Voice.", "After the interaction, record the outcome and next follow-up so the remote team has accurate history."],
  };
  if (pathname.startsWith("/network") || pathname.startsWith("/providers") || pathname.startsWith("/map") || pathname.startsWith("/matching")) return {
    title: "How to use the Provider Network",
    intro: `${agent.name} helps interpret provider records without inventing rank or availability.`,
    steps: ["Review provider profiles, services, service areas, and recorded availability.", "Treat approximate map locations and unverified records as approximate or unverified.", "Use the explicit offer and acceptance workflow before treating a provider as assigned."],
  };
  if (pathname.startsWith("/community")) return {
    title: "How to use Community",
    intro: `${agent.name} helps keep community activity useful and separated from private workspace data.`,
    steps: ["Choose the correct area: discussions, events, reviews, referrals, groups, or moderation.", "Keep private customer and job details inside authorized workspace records.", "Use moderation tools to report content instead of editing another participant’s record."],
  };
  if (pathname.startsWith("/homeowner-portal")) return {
    title: "How to use your Resident Portal",
    intro: `${agent.name} helps explain requests, appointments, messages, documents, and progress.`,
    steps: ["Open the active request or job to see its current status.", "Use portal messaging for questions or updates tied to that request.", "Keep documents and private information inside the authorized portal."],
  };
  if (pathname.startsWith("/contractor-portal")) return {
    title: "How to use your Professional Portal",
    intro: `${agent.name} helps with offers, accepted work, schedules, documents, and completion.`,
    steps: ["Review the full work details before accepting an offer.", "After acceptance, use the linked job and appointment instead of creating a separate record.", "Keep availability, documents, and completion updates current for the workspace team."],
  };
  return {
    title: "How to use this area",
    intro: `${agent.name} is your guide for this HLC workspace tab.`,
    steps: ["Start with the page summary and the records that need action.", "Open the relevant HLC record before changing status, scheduling, or communication.", "Ask the agent below for page-specific help, a summary, or the next recommended workflow step."],
  };
}

export default function ContextualAgentDock() {
  const { session } = useAuth();
  const location = useLocation();
  const [access, setAccess] = useState<AccessContext>({ kind: null, role: null, userId: null });
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [briefing, setBriefing] = useState("");
  const [dismissedBriefingFor, setDismissedBriefingFor] = useState<string | null>(null);
  const [briefingBusy, setBriefingBusy] = useState(false);
  const voicedBriefingRef = useRef("");

  useEffect(() => {
    if (!session) return;
    let active = true;
    const userId = session.user.id;
    Promise.all([
      supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1),
      supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle(),
      supabase.from("homeowner_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
      supabase.from("contractor_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
    ]).then(([workspace, profile, resident, professional]) => {
      if (!active) return;
      const internal = !workspace.error && Boolean(workspace.data?.length);
      const role = profile.error ? null : normalizeInternalRole(profile.data?.role);
      const residentAccess = !resident.error && Boolean(resident.data?.length);
      const professionalAccess = !professional.error && Boolean(professional.data?.length);
      setAccess({
        kind: internal || role ? "internal" : professionalAccess ? "professional" : residentAccess ? "resident" : null,
        role,
        userId,
      });
    }).catch(() => {
      if (active) setAccess({ kind: null, role: null, userId });
    });
    return () => { active = false; };
  }, [session]);

  const agent = useMemo(() => resolveAgent(location.pathname, access), [location.pathname, access]);
  const open = Boolean(agent && openFor === location.pathname);
  const tutorial = agent ? tutorialFor(location.pathname, agent) : null;

  useEffect(() => {
    document.body.classList.toggle("hlc-agent-open", open);
    return () => document.body.classList.remove("hlc-agent-open");
  }, [open]);

  useEffect(() => {
    if (!agent || !session || hiddenRoutes.has(location.pathname)) return;
    let active = true;
    const cacheKey = `hlc.agentBriefing.v1:${agent.id}:${location.pathname}`;
    const cached = window.sessionStorage.getItem(cacheKey);
    voicedBriefingRef.current = "";

    if (cached) {
      queueMicrotask(() => {
        if (active) setBriefing(cached);
      });
      return () => { active = false; };
    }

    queueMicrotask(() => {
      if (!active) return;
      setBriefing("");
      setBriefingBusy(true);
    });
    void chatWithAgent(
      agent.id,
      "Open this HLC page proactively. Greet me naturally, then give me a concise verified workspace briefing: what needs attention now, the most important risk or queue item, and the single best next action. Use only authorized HLC facts. Prioritize overdue/SLA-exposed work, high-priority leads, pending assignments, scheduled appointments, unread notifications or messages, and blocked workflow items when those facts are available. Do not invent anything and do not wait for me to ask first.",
      [],
    ).then((response) => {
      if (!active) return;
      setBriefing(response.reply);
      window.sessionStorage.setItem(cacheKey, response.reply);
      void trackAnalyticsEvent("agent_proactive_briefing_loaded", { agent: agent.id, page: location.pathname, access: access.kind });
    }).catch(() => {
      if (active) setBriefing(`${agent.name} is online. Open this panel for the current workspace summary and next action.`);
    }).finally(() => {
      if (active) setBriefingBusy(false);
    });

    return () => { active = false; };
  }, [access.kind, agent, location.pathname, session]);

  useEffect(() => {
    if (!agent || !briefing || voicedBriefingRef.current === briefing) return;
    const desktop = window.matchMedia("(min-width: 721px)").matches;
    const preferences = getAgentVoicePreferences();
    if (!desktop || !preferences.enabled || !preferences.autoSpeak || !isAgentAudioSupported()) return;

    let cancelled = false;
    const play = async () => {
      try {
        await prepareAgentAudio();
        if (cancelled) return;
        await speakAgentText(agent.id, briefing);
        voicedBriefingRef.current = briefing;
      } catch {
        // Desktop browsers may require a user gesture. The first normal interaction
        // with HLC retries the same proactive briefing without requiring agent input.
      }
    };

    void play();
    const unlock = () => {
      if (!cancelled && voicedBriefingRef.current !== briefing) void play();
    };
    document.addEventListener("pointerdown", unlock, { once: true, capture: true });
    document.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      cancelled = true;
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
  }, [agent, briefing]);

  if (!agent || hiddenRoutes.has(location.pathname)) return null;

  return (
    <aside
      className={`hlc-agent-dock ${open ? "is-open" : ""}`}
      data-agent={agent.id}
      aria-label={`${agent.name} contextual assistant and tutorial coach`}
    >
      {dismissedBriefingFor !== location.pathname && !open && (
        <section className="hlc-agent-proactive-briefing" aria-live="polite" aria-label={`${agent.name} proactive workspace briefing`}>
          <div className="hlc-agent-proactive-briefing-head">
            <img src={agent.avatar} alt="" aria-hidden="true" />
            <div><strong>{agent.name}</strong><small>{agent.role} · live briefing</small></div>
            <button type="button" onClick={() => setDismissedBriefingFor(location.pathname)} aria-label={`Dismiss ${agent.name} briefing`}>×</button>
          </div>
          <p>{briefingBusy ? `${agent.name} is checking the workspace…` : briefing}</p>
          <button type="button" className="hlc-agent-proactive-open" onClick={() => setOpenFor(location.pathname)}>Open {agent.name}</button>
        </section>
      )}

      {open && tutorial && (
        <div className="hlc-agent-dock-panel">
          <div className="hlc-agent-dock-panel-head">
            <img className="hlc-agent-panel-avatar" src={agent.avatar} alt="" aria-hidden="true" />
            <div><strong>{agent.name}</strong><small>{agent.role} · tutorial coach</small></div>
            <button type="button" onClick={() => setOpenFor(null)} aria-label={`Close ${agent.name} assistant`}>Close</button>
          </div>

          <section className="hlc-agent-tutorial" aria-label={`${tutorial.title} tutorial`}>
            <small className="hlc-agent-tutorial-kicker">Learn this tab</small>
            <h3>{tutorial.title}</h3>
            <p>{tutorial.intro}</p>
            <ol>{tutorial.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>

          <div className="hlc-agent-chat-divider"><span>Ask {agent.name} about this tab</span></div>
          <AgentChatPanel agentId={agent.id} agentName={agent.name} accent={agent.accent} />
        </div>
      )}

      <button
        type="button"
        className="hlc-agent-dock-trigger"
        aria-expanded={open}
        aria-label={`${open ? "Close" : "Open"} ${agent.name} tab tutorial and assistant`}
        title={`${agent.name} · ${agent.role} · Learn this tab`}
        onClick={() => {
          const nextOpen = !open;
          setOpenFor(nextOpen ? location.pathname : null);
          if (nextOpen) void trackAnalyticsEvent("agent_tutorial_opened", { agent: agent.id, page: location.pathname, access: access.kind });
        }}
      >
        <img src={agent.avatar} alt="" aria-hidden="true" />
        <span><strong>{agent.name}</strong><small>{agent.role}</small></span>
      </button>
    </aside>
  );
}
