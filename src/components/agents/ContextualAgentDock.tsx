import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { trackAnalyticsEvent } from "../../api/analytics";
import AgentChatPanel from "./AgentChatPanel";
import type { AgentId } from "../../ai/agents";

type AgentConfig = {
  id: AgentId;
  name: string;
  role: string;
  accent: string;
  avatar: string;
};

const agents: Record<"kendrell" | "dion" | "diamond", AgentConfig> = {
  kendrell: { id: "kendrell", name: "Kendrell", role: "Command", accent: "#2563eb", avatar: "/brand/avatars/Kendrell_Locked_HLC.png" },
  dion: { id: "dion", name: "Dion", role: "Operations & BI", accent: "#0f766e", avatar: "/brand/avatars/Dion_Locked_HLC.png" },
  diamond: { id: "diamond", name: "Diamond", role: "Customer Experience", accent: "#b45309", avatar: "/brand/avatars/Diamond_Locked_HLC.png" },
};

const hiddenRoutes = new Set(["/hq", "/operations", "/customer-experience"]);

function resolveAgent(pathname: string): AgentConfig {
  if (
    pathname.startsWith("/leads") || pathname.startsWith("/estimator") || pathname.startsWith("/jobs") ||
    pathname.startsWith("/calendar") || pathname.startsWith("/follow-ups") || pathname.startsWith("/call-center") ||
    pathname.startsWith("/manual-communications") || pathname.startsWith("/documents") || pathname.startsWith("/workflow")
  ) return agents.dion;
  if (
    pathname.startsWith("/messages") || pathname.startsWith("/notifications") || pathname.startsWith("/community") ||
    pathname.startsWith("/network") || pathname.startsWith("/map") || pathname.startsWith("/providers") ||
    pathname.startsWith("/profiles") || pathname.startsWith("/matching") || pathname.startsWith("/homeowner-portal") ||
    pathname.startsWith("/contractor-portal")
  ) return agents.diamond;
  return agents.kendrell;
}

function greeting(agent: AgentConfig, pathname: string) {
  if (agent.id === "dion" && pathname.startsWith("/estimator")) return "I’m here if you want help checking the LeadScope numbers, materials, or next workflow step.";
  if (agent.id === "dion" && pathname.startsWith("/jobs")) return "I can help spot what is blocking this job, assignment, or schedule.";
  if (agent.id === "diamond" && pathname.startsWith("/messages")) return "I can help draft a clear customer or provider response before anything is sent.";
  if (agent.id === "diamond" && pathname.startsWith("/community")) return "I can help keep the community experience useful, welcoming, and on-brand.";
  if (agent.id === "kendrell" && pathname === "/dashboard") return "Command Center is ready. I can summarize risks, priorities, KPIs, and the next decision that matters.";
  return `${agent.name} is available for guidance on this HLC area.`;
}

export default function ContextualAgentDock() {
  const location = useLocation();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [greetingVisible, setGreetingVisible] = useState(false);
  const agent = useMemo(() => resolveAgent(location.pathname), [location.pathname]);
  const open = openFor === location.pathname;

  useEffect(() => {
    if (hiddenRoutes.has(location.pathname)) return;
    const key = `hlc-agent-greeted-${agent.id}`;
    if (sessionStorage.getItem(key)) {
      setGreetingVisible(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setGreetingVisible(true);
      sessionStorage.setItem(key, "1");
      trackAnalyticsEvent("agent_greeting_shown", { agent: agent.id });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [agent.id, location.pathname]);

  if (hiddenRoutes.has(location.pathname)) return null;

  return (
    <aside className={`hlc-agent-dock ${open ? "is-open" : ""}`} aria-label={`${agent.name} contextual assistant`}>
      {!open && greetingVisible && (
        <div className="hlc-agent-greeting" role="status">
          <button type="button" onClick={() => setGreetingVisible(false)} aria-label={`Dismiss ${agent.name} greeting`}>×</button>
          <strong>{agent.name}</strong>
          <span>{greeting(agent, location.pathname)}</span>
        </div>
      )}

      {open && (
        <div className="hlc-agent-dock-panel">
          <div className="hlc-agent-dock-panel-head">
            <div><strong>{agent.name}</strong><small>{agent.role} · this page</small></div>
            <button type="button" onClick={() => setOpenFor(null)} aria-label={`Close ${agent.name} assistant`}>Close</button>
          </div>
          <AgentChatPanel agentId={agent.id} agentName={agent.name} accent={agent.accent} />
        </div>
      )}

      <button
        type="button"
        className="hlc-agent-dock-trigger"
        aria-expanded={open}
        onClick={() => {
          const nextOpen = !open;
          setOpenFor(nextOpen ? location.pathname : null);
          setGreetingVisible(false);
          if (nextOpen) trackAnalyticsEvent("agent_chat_opened", { agent: agent.id });
        }}
      >
        <img src={agent.avatar} alt="" aria-hidden="true" />
        <span><strong>Ask {agent.name}</strong><small>{agent.role}</small></span>
      </button>
    </aside>
  );
}
