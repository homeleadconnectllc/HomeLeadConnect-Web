import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ecosystemNavigation } from "../../config/ecosystem";
import { useAccountAccess } from "../../hooks/useAccountAccess";
import { canAccessWorkspacePath } from "../../lib/accessPolicy";
import "../../styles/start-here-visual-wave.css";

const extraDestinations = [
  { label: "Start a service request", route: "/request-service", purpose: "Request home help and begin the HLC service workflow." },
  { label: "AI Team", route: "/hq", purpose: "Open Kendrell and the role-scoped HLC agent team." },
  { label: "Messages", route: "/messages", purpose: "Open conversations and communication history." },
  { label: "Documents & Scan Intake", route: "/documents", purpose: "Capture, review and organize job or service evidence." },
  { label: "Subscription & billing", route: "/settings/billing", purpose: "Review the workspace plan and billing controls." },
];

const directoryAliases = new Set(["index", "directory", "app directory", "contents", "table of contents"]);

export default function StartHere() {
  const access = useAccountAccess();
  const [query, setQuery] = useState("");
  const showBusinessTools = access.business && Boolean(access.role);
  const normalizedQuery = query.trim().toLowerCase();
  const needle = directoryAliases.has(normalizedQuery) ? "" : normalizedQuery;

  const groups = useMemo(() => {
    const visible = ecosystemNavigation.map((group) => ({
      ...group,
      pages: group.pages.filter((page) => {
        if (page.route === "/homeowner-portal") return access.homeowner;
        if (page.route === "/contractor-portal") return access.contractor;
        if (page.route === "/messages" || page.route === "/notifications") return access.business || access.homeowner || access.contractor;
        if (!showBusinessTools || !access.role) return false;
        return canAccessWorkspacePath(access.role, page.route);
      }),
    })).filter((group) => group.pages.length > 0);

    if (!needle) return visible;
    return visible.map((group) => ({
      ...group,
      pages: group.pages.filter((page) => `${page.label} ${page.purpose} ${group.label}`.toLowerCase().includes(needle)),
    })).filter((group) => group.pages.length > 0);
  }, [access.business, access.contractor, access.homeowner, access.role, needle, showBusinessTools]);

  const extras = extraDestinations.filter((item) => {
    if (item.route === "/hq" && (!showBusinessTools || !access.role || !canAccessWorkspacePath(access.role, "/hq"))) return false;
    if (item.route === "/settings/billing" && !showBusinessTools) return false;
    if ((item.route === "/messages" || item.route === "/documents") && !(showBusinessTools || access.homeowner || access.contractor)) return false;
    return !needle || `${item.label} ${item.purpose}`.toLowerCase().includes(needle);
  });

  return <main className="hlc-app-directory">
    <header className="hlc-app-directory-hero">
      <p>HOMELEAD CONNECT · APP DIRECTORY</p>
      <h1>Find anything in HLC.</h1>
      <span>Search the areas available to your account. HLC only lists destinations your current access can use.</span>
      <label className="hlc-app-directory-search">
        <span className="sr-only">Search HomeLead Connect</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search work, people, tools or settings" autoComplete="off" />
      </label>
    </header>

    {showBusinessTools && <section className="hlc-app-directory-first-day" aria-label="First-day checklist">
      <strong>First-day checklist</strong>
      <span>Before live use: confirm workspace settings, team access, phone workflow, one complete service workflow, notifications and follow-ups.</span>
      <nav aria-label="First-day checklist destinations">
        <Link to="/settings">Settings</Link>
        <Link to="/team">Team</Link>
        <Link to="/workflow">Workflow</Link>
        <Link to="/call-center">Call Center</Link>
      </nav>
    </section>}

    <section className="hlc-app-directory-quick" aria-label="HLC quick destinations">
      {extras.map((item) => <Link key={item.route} to={item.route}><strong>{item.label}</strong><span>{item.purpose}</span><b aria-hidden="true">→</b></Link>)}
    </section>

    <section className="hlc-app-directory-groups" aria-label="HomeLead Connect areas">
      {groups.map((group) => <article key={group.id} className="hlc-app-directory-group">
        <header><div><span>{group.label}</span><strong>{group.pages.length} destinations</strong></div></header>
        <div className="hlc-app-directory-links">
          {group.pages.map((page) => <Link key={page.route} to={page.route}><span><strong>{page.label}</strong><small>{page.purpose}</small></span><b aria-hidden="true">→</b></Link>)}
        </div>
      </article>)}
      {needle && groups.length === 0 && extras.length === 0 && <div className="hlc-app-directory-empty"><strong>No matching HLC destination.</strong><span>Try a shorter search such as “jobs”, “messages”, “profile” or “billing”.</span></div>}
    </section>

    <section className="hlc-app-directory-support" aria-label="Support and escalation">
      <strong>Support and escalation</strong>
      <span>If work is blocked or something looks wrong, use the Help Center for the next safe action and escalation path.</span>
      <Link to="/help">Open Help Center →</Link>
    </section>
  </main>;
}
