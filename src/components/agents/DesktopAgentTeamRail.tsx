import { Link, useLocation } from "react-router-dom";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import { canAccessWorkspacePath } from "../../lib/accessPolicy";

const AGENTS = [
  {
    id: "kendrell",
    name: "Kendrell",
    role: "Command",
    route: "/hq",
    avatar: "/brand/avatars/Kendrell_Locked_HLC.png",
  },
  {
    id: "dion",
    name: "Dion",
    role: "Operations & BI",
    route: "/operations",
    avatar: "/brand/avatars/Dion_Locked_HLC.png",
  },
  {
    id: "diamond",
    name: "Diamond",
    role: "Customer Experience",
    route: "/customer-experience",
    avatar: "/brand/avatars/Diamond_Locked_HLC.png",
  },
] as const;

export default function DesktopAgentTeamRail() {
  const account = useAccountAccess();
  const location = useLocation();

  if (!account.business || !account.role) return null;

  const visibleAgents = AGENTS.filter((agent) => canAccessWorkspacePath(account.role, agent.route));
  if (!visibleAgents.length) return null;

  return (
    <aside className="hlc-desktop-agent-team" aria-label="HLC AI team">
      <div className="hlc-desktop-agent-team-heading">
        <span>AI TEAM</span>
        <strong>Always available</strong>
      </div>
      <div className="hlc-desktop-agent-team-list">
        {visibleAgents.map((agent) => {
          const active = location.pathname === agent.route || location.pathname.startsWith(`${agent.route}/`);
          return (
            <Link
              key={agent.id}
              to={agent.route}
              className={`hlc-desktop-agent-team-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              title={`${agent.name} · ${agent.role}`}
            >
              <span className="hlc-desktop-agent-avatar-wrap">
                <img src={agent.avatar} alt="" aria-hidden="true" />
                <i aria-hidden="true" />
              </span>
              <span className="hlc-desktop-agent-team-copy">
                <strong>{agent.name}</strong>
                <small>{agent.role}</small>
              </span>
              <span className="hlc-desktop-agent-team-open" aria-hidden="true">›</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
