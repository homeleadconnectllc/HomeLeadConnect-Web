import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
  kendrell: {
    id: "kendrell",
    name: "Kendrell",
    role: "Command",
    accent: "#2563eb",
    avatar: "/brand/avatars/Kendrell_Locked_HLC.png",
  },
  dion: {
    id: "dion",
    name: "Dion",
    role: "Operations & BI",
    accent: "#0f766e",
    avatar: "/brand/avatars/Dion_Locked_HLC.png",
  },
  diamond: {
    id: "diamond",
    name: "Diamond",
    role: "Customer Experience",
    accent: "#b45309",
    avatar: "/brand/avatars/Diamond_Locked_HLC.png",
  },
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

export default function ContextualAgentDock() {
  const location = useLocation();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const agent = useMemo(() => resolveAgent(location.pathname), [location.pathname]);
  const open = openFor === location.pathname;

  if (hiddenRoutes.has(location.pathname)) return null;

  return (
    <aside className={`hlc-agent-dock ${open ? "is-open" : ""}`} aria-label={`${agent.name} contextual assistant`}>
      {open && (
        <div className="hlc-agent-dock-panel">
          <div className="hlc-agent-dock-panel-head">
            <div>
              <strong>{agent.name}</strong>
              <small>{agent.role} · this page</small>
            </div>
            <button type="button" onClick={() => setOpenFor(null)} aria-label={`Close ${agent.name} assistant`}>Close</button>
          </div>
          <AgentChatPanel agentId={agent.id} agentName={agent.name} accent={agent.accent} />
        </div>
      )}

      <button
        type="button"
        className="hlc-agent-dock-trigger"
        aria-expanded={open}
        onClick={() => setOpenFor(open ? null : location.pathname)}
      >
        <img src={agent.avatar} alt="" aria-hidden="true" />
        <span><strong>Ask {agent.name}</strong><small>{agent.role}</small></span>
      </button>
    </aside>
  );
}
