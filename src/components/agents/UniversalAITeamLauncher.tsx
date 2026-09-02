import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { AgentId } from "../../ai/agents";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import { canAccessWorkspacePath } from "../../lib/accessPolicy";
import AgentChatPanel from "./AgentChatPanel";

type AgentConfig = {
  id: AgentId;
  name: string;
  role: string;
  route: string;
  avatar: string;
  accent: string;
};

const AGENTS: AgentConfig[] = [
  {
    id: "kendrell",
    name: "Kendrell",
    role: "Command",
    route: "/hq",
    avatar: "/brand/avatars/Kendrell_Locked_HLC.png",
    accent: "#3B82F6",
  },
  {
    id: "dion",
    name: "Dion",
    role: "Operations & BI",
    route: "/operations",
    avatar: "/brand/avatars/Dion_Locked_HLC.png",
    accent: "#3B82F6",
  },
  {
    id: "diamond",
    name: "Diamond",
    role: "Customer Experience",
    route: "/customer-experience",
    avatar: "/brand/avatars/Diamond_Locked_HLC.png",
    accent: "#60A5FA",
  },
];

const DEDICATED_AGENT_ROUTES = new Set(["/hq", "/operations", "/customer-experience"]);

export default function UniversalAITeamLauncher() {
  const account = useAccountAccess();
  const location = useLocation();
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<AgentId | null>(null);

  const visibleAgents = useMemo(() => {
    if (account.business && account.role) {
      return AGENTS.filter((agent) => canAccessWorkspacePath(account.role!, agent.route));
    }
    if (account.contractor) return AGENTS.filter((agent) => agent.id === "dion");
    if (account.homeowner) return AGENTS.filter((agent) => agent.id === "diamond");
    return [];
  }, [account.business, account.contractor, account.homeowner, account.role]);

  const activeAgent = visibleAgents.find((agent) => agent.id === activeAgentId) ?? null;
  const onDedicatedAgentPage = DEDICATED_AGENT_ROUTES.has(location.pathname);

  useEffect(() => {
    document.body.classList.toggle("hlc-agent-open", Boolean(activeAgent));
    return () => document.body.classList.remove("hlc-agent-open");
  }, [activeAgent]);

  if (account.loading || account.error || !visibleAgents.length || onDedicatedAgentPage) return null;

  return (
    <aside className={`hlc-ai-team-launcher${launcherOpen ? " is-open" : ""}${activeAgent ? " has-agent" : ""}`} aria-label="HLC AI Team">
      {launcherOpen && (
        <div className="hlc-ai-team-menu" role="dialog" aria-modal="false" aria-label="Choose an HLC AI Team agent">
          <div className="hlc-ai-team-menu-head">
            <div>
              <small>HLC AI TEAM</small>
              <strong>{activeAgent ? activeAgent.name : "Choose your agent"}</strong>
            </div>
            <button
              type="button"
              className="hlc-ai-team-close"
              aria-label="Close AI Team"
              onClick={() => {
                setActiveAgentId(null);
                setLauncherOpen(false);
              }}
            >
              ×
            </button>
          </div>

          <div className="hlc-ai-team-agent-tabs" role="tablist" aria-label="AI Team agents">
            {visibleAgents.map((agent) => {
              const selected = activeAgentId === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={selected ? "is-active" : ""}
                  onClick={() => setActiveAgentId(agent.id)}
                >
                  <img src={agent.avatar} alt="" aria-hidden="true" />
                  <span><strong>{agent.name}</strong><small>{agent.role}</small></span>
                </button>
              );
            })}
          </div>

          {activeAgent ? (
            <section className="hlc-ai-team-active-panel" aria-label={`${activeAgent.name} assistant`}>
              <div className="hlc-ai-team-active-head">
                <span>{activeAgent.name} is active</span>
                <Link to={activeAgent.route}>Open dedicated page</Link>
              </div>
              <AgentChatPanel
                key={activeAgent.id}
                agentId={activeAgent.id}
                agentName={activeAgent.name}
                accent={activeAgent.accent}
              />
            </section>
          ) : (
            <p className="hlc-ai-team-empty">Select one agent to open a single assistant panel. Switching agents replaces the current panel.</p>
          )}
        </div>
      )}

      <button
        type="button"
        className="hlc-ai-team-trigger"
        aria-expanded={launcherOpen}
        aria-label={`${launcherOpen ? "Close" : "Open"} HLC AI Team`}
        onClick={() => {
          if (launcherOpen) {
            setActiveAgentId(null);
            setLauncherOpen(false);
          } else {
            setLauncherOpen(true);
          }
        }}
      >
        <span className="hlc-ai-team-trigger-mark" aria-hidden="true">
          <img src="/brand/avatars/Kendrell_Locked_HLC.png" alt="" />
        </span>
        <span className="hlc-ai-team-trigger-copy"><strong>AI Team</strong><small>Open assistant</small></span>
      </button>
    </aside>
  );
}
