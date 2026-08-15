import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { trackAnalyticsEvent } from "../../api/analytics";
import AgentChatPanel from "./AgentChatPanel";
import type { AgentId } from "../../ai/agents";
import { useAuth } from "../../hooks/useAuth";
import { normalizeInternalRole, type InternalRole } from "../../lib/accessPolicy";
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

const agents: Record<AgentId, AgentConfig> = {
  kendrell: { id: "kendrell", name: "Kendrell", role: "Executive Command AI", accent: "#F59E0B", avatar: "/brand/avatars/Kendrell_Locked_HLC.png" },
  dion: { id: "dion", name: "Dion", role: "Operations & BI AI", accent: "#2563EB", avatar: "/brand/avatars/Dion_Locked_HLC.png" },
  diamond: { id: "diamond", name: "Diamond", role: "Customer Experience & Community AI", accent: "#10B981", avatar: "/brand/avatars/Diamond_Locked_HLC.png" },
};

const hiddenRoutes = new Set(["/hq", "/operations", "/customer-experience"]);
const internalWorkspacePrefixes = [
  "/dashboard", "/start-here", "/ecosystem", "/workflow", "/automations", "/activity", "/network", "/map",
  "/profiles", "/providers", "/matching", "/community-hub", "/community/", "/help", "/tutorials", "/rules",
  "/profile", "/analytics", "/hq", "/settings", "/leads", "/estimator", "/jobs", "/calendar", "/team",
  "/follow-ups", "/manual-communications", "/documents", "/call-center", "/operations", "/customer-experience",
];

function isInternalWorkspacePath(pathname: string) {
  return internalWorkspacePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

function resolveAgent(pathname: string, access: AccessContext): AgentConfig | null {
  if (access.kind === "resident") return agents.diamond;
  if (access.kind === "professional") return agents.dion;
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

function greeting(agent: AgentConfig, pathname: string) {
  if (agent.id === "dion" && pathname.startsWith("/estimator")) return "I’m here if you want help checking the LeadScope numbers, materials, or next workflow step.";
  if (agent.id === "dion" && pathname.startsWith("/jobs")) return "I can help spot what is blocking this job, assignment, or schedule.";
  if (agent.id === "dion" && (pathname.startsWith("/map") || pathname.startsWith("/network") || pathname.startsWith("/providers"))) return "I can help interpret provider records, service areas, map coverage, availability, and the next operational step without inventing ranking or distance.";
  if (agent.id === "dion" && pathname.startsWith("/contractor-portal")) return "I can help explain offers, assigned work, profile setup, schedules, and the next professional-portal step.";
  if (agent.id === "diamond" && pathname.startsWith("/messages")) return "I can help draft a clear customer or provider response before anything is sent.";
  if (agent.id === "diamond" && pathname.startsWith("/community")) return "I can help keep the community experience useful, welcoming, and on-brand.";
  if (agent.id === "diamond" && pathname.startsWith("/homeowner-portal")) return "I can help explain your request, appointment, document, profile, or next resident-portal step.";
  if (agent.id === "kendrell" && pathname === "/dashboard") return "Command Center is ready. I can summarize risks, priorities, KPIs, and the next decision that matters.";
  return `${agent.name} is available for guidance on this HLC area.`;
}

export default function ContextualAgentDock() {
  const { session } = useAuth();
  const location = useLocation();
  const [access, setAccess] = useState<AccessContext>({ kind: null, role: null, userId: null });
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [greetingFor, setGreetingFor] = useState<AgentId | null>(null);

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

  const effectiveAccess = useMemo<AccessContext>(() => {
    if (access.kind || !session || !isInternalWorkspacePath(location.pathname)) return access;
    return { kind: "internal", role: null, userId: session.user.id };
  }, [access, location.pathname, session]);

  const agent = useMemo(() => resolveAgent(location.pathname, effectiveAccess), [location.pathname, effectiveAccess]);
  const open = Boolean(agent && openFor === location.pathname);
  const greetingVisible = Boolean(agent && greetingFor === agent.id);

  useEffect(() => {
    if (!agent || hiddenRoutes.has(location.pathname)) return;
    const key = `hlc-agent-greeted-${agent.id}`;
    if (sessionStorage.getItem(key)) return;
    const timer = window.setTimeout(() => {
      setGreetingFor(agent.id);
      sessionStorage.setItem(key, "1");
      void trackAnalyticsEvent("agent_greeting_shown", { agent: agent.id, page: location.pathname });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [agent, location.pathname]);

  if (!agent || hiddenRoutes.has(location.pathname)) return null;

  return (
    <aside
      className={`hlc-agent-dock ${open ? "is-open" : ""}`}
      data-agent={agent.id}
      aria-label={`${agent.name} contextual assistant`}
    >
      {!open && greetingVisible && (
        <div className="hlc-agent-greeting" role="status">
          <button type="button" onClick={() => setGreetingFor(null)} aria-label={`Dismiss ${agent.name} greeting`}>×</button>
          <strong>{agent.name}</strong>
          <span>{greeting(agent, location.pathname)}</span>
        </div>
      )}

      {open && (
        <div className="hlc-agent-dock-panel">
          <div className="hlc-agent-dock-panel-head">
            <img className="hlc-agent-panel-avatar" src={agent.avatar} alt="" aria-hidden="true" />
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
        aria-label={`${open ? "Close" : "Open"} ${agent.name} contextual assistant`}
        title={`${agent.name} · ${agent.role}`}
        onClick={() => {
          const nextOpen = !open;
          setOpenFor(nextOpen ? location.pathname : null);
          setGreetingFor(null);
          if (nextOpen) void trackAnalyticsEvent("agent_chat_opened", { agent: agent.id, page: location.pathname, access: effectiveAccess.kind });
        }}
      >
        <img src={agent.avatar} alt="" aria-hidden="true" />
        <span><strong>Ask {agent.name}</strong><small>{agent.role}</small></span>
      </button>
    </aside>
  );
}
