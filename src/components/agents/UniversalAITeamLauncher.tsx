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
  { id: "kendrell", name: "Kendrell", role: "Command", route: "/hq", avatar: "/brand/avatars/Kendrell_Locked_HLC.png", accent: "#3B82F6" },
  { id: "dion", name: "Dion", role: "Operations & BI", route: "/operations", avatar: "/brand/avatars/Dion_Locked_HLC.png", accent: "#3B82F6" },
  { id: "diamond", name: "Diamond", role: "Customer Experience", route: "/customer-experience", avatar: "/brand/avatars/Diamond_Locked_HLC.png", accent: "#60A5FA" },
];

const DEDICATED_AGENT_ROUTES = new Set(["/hq", "/operations", "/customer-experience"]);
const HOME_TEAM_ROUTES = new Set(["/dashboard"]);

const KENDRELL_PREFIXES = ["/ecosystem", "/settings", "/workflow", "/automations", "/notifications", "/rules"];
const DION_PREFIXES = [
  "/work",
  "/leads",
  "/estimator",
  "/jobs",
  "/calendar",
  "/follow-ups",
  "/contractors",
  "/call-center",
  "/manual-communications",
  "/matching",
  "/resources",
];
const DIAMOND_PREFIXES = [
  "/messages",
  "/community",
  "/network",
  "/map",
  "/profiles",
  "/providers",
  "/help",
  "/tutorials",
  "/profile",
  "/homeowner-portal",
  "/partner-portal",
];

function matchesRoute(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function contextualAgentIds(pathname: string): AgentId[] | null {
  if (HOME_TEAM_ROUTES.has(pathname)) return null;
  if (matchesRoute(pathname, KENDRELL_PREFIXES)) return ["kendrell"];
  if (matchesRoute(pathname, DION_PREFIXES)) return ["dion"];
  if (matchesRoute(pathname, DIAMOND_PREFIXES) || pathname.startsWith("/community-")) return ["diamond"];
  return null;
}

export default function UniversalAITeamLauncher() {
  const account = useAccountAccess();
  const location = useLocation();
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [launcherPath, setLauncherPath] = useState(location.pathname);
  const [activeAgentId, setActiveAgentId] = useState<AgentId | null>(null);

  const authorizedAgents = useMemo(() => {
    if (account.business && account.role) return AGENTS.filter((agent) => canAccessWorkspacePath(account.role!, agent.route));
    if (account.contractor) return AGENTS.filter((agent) => agent.id === "dion");
    if (account.homeowner || account.partner) return AGENTS.filter((agent) => agent.id === "diamond");
    return [];
  }, [account.business, account.contractor, account.homeowner, account.partner, account.role]);

  const visibleAgents = useMemo(() => {
    const contextual = contextualAgentIds(location.pathname);
    if (!contextual) return authorizedAgents;
    return authorizedAgents.filter((agent) => contextual.includes(agent.id));
  }, [authorizedAgents, location.pathname]);

  const routeLauncherOpen = launcherOpen && launcherPath === location.pathname;
  const contextualAgent = visibleAgents.length === 1 ? visibleAgents[0] : null;
  const activeAgent = launcherPath === location.pathname ? visibleAgents.find((agent) => agent.id === activeAgentId) ?? null : null;
  const onDedicatedAgentPage = DEDICATED_AGENT_ROUTES.has(location.pathname);
  const onHomeTeamPage = HOME_TEAM_ROUTES.has(location.pathname);
  const neutralLauncher = visibleAgents.length !== 1;

  useEffect(() => {
    document.body.classList.toggle("hlc-agent-open", Boolean(activeAgent));
    return () => document.body.classList.remove("hlc-agent-open");
  }, [activeAgent]);

  if (account.loading || account.error || !visibleAgents.length || onDedicatedAgentPage || onHomeTeamPage) return null;

  return (
    <aside className={`hlc-ai-team-launcher${routeLauncherOpen ? " is-open" : ""}${activeAgent ? " has-agent" : ""}`} aria-label="HomeLead Connect AI Team">
      {routeLauncherOpen && (
        <div className="hlc-ai-team-menu" role="dialog" aria-modal="false" aria-label="Choose a HomeLead Connect AI Team agent">
          <div className="hlc-ai-team-menu-head">
            <div><small>HOMELEAD CONNECT AI TEAM</small><strong>{activeAgent ? activeAgent.name : contextualAgent ? `Ask ${contextualAgent.name}` : "Choose your agent"}</strong></div>
            <button type="button" className="hlc-ai-team-close" aria-label="Close AI Team" onClick={() => { setActiveAgentId(null); setLauncherOpen(false); }}>×</button>
          </div>
          <div className="hlc-ai-team-agent-tabs" role="tablist" aria-label="AI Team agents">
            {visibleAgents.map((agent) => {
              const selected = activeAgentId === agent.id;
              return <button key={agent.id} type="button" role="tab" aria-selected={selected} className={selected ? "is-active" : ""} onClick={() => setActiveAgentId(agent.id)}><img src={agent.avatar} alt="" aria-hidden="true" /><span><strong>{agent.name}</strong><small>{agent.role}</small></span></button>;
            })}
          </div>
          {activeAgent ? (
            <section className="hlc-ai-team-active-panel" aria-label={`${activeAgent.name} assistant`}>
              <div className="hlc-ai-team-active-head"><span>{activeAgent.name} is active</span><Link to={activeAgent.route}>Open dedicated page</Link></div>
              <AgentChatPanel key={activeAgent.id} agentId={activeAgent.id} agentName={activeAgent.name} accent={activeAgent.accent} />
            </section>
          ) : (
            <p className="hlc-ai-team-empty">{contextualAgent ? `${contextualAgent.name} is the specialist for this area.` : "Select one agent to open a single assistant panel. Switching agents replaces the current panel."}</p>
          )}
        </div>
      )}
      <button type="button" className={`hlc-ai-team-trigger${neutralLauncher ? " is-neutral" : " is-contextual"}`} aria-expanded={routeLauncherOpen} aria-label={`${routeLauncherOpen ? "Close" : "Open"} ${contextualAgent ? `${contextualAgent.name} assistant` : "HomeLead Connect AI Team"}`} onClick={() => {
        if (routeLauncherOpen) { setActiveAgentId(null); setLauncherOpen(false); }
        else { setActiveAgentId(null); setLauncherPath(location.pathname); setLauncherOpen(true); }
      }}>
        <span className="hlc-ai-team-trigger-mark" aria-hidden="true">{neutralLauncher ? <span className="hlc-ai-team-neutral-mark">AI</span> : <img src={contextualAgent?.avatar} alt="" />}</span>
        <span className="hlc-ai-team-trigger-copy"><strong>{contextualAgent ? `Ask ${contextualAgent.name}` : "AI Team"}</strong><small>{contextualAgent ? contextualAgent.role : "Choose specialist"}</small></span>
      </button>
    </aside>
  );
}
