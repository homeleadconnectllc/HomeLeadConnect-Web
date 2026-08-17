import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { ecosystemNavigation, type EcosystemPage } from "../config/ecosystem";
import { useAuth } from "../hooks/useAuth";
import { useAccountAccess } from "../hooks/useAccountAccess";
import { canAccessWorkspacePath } from "../lib/accessPolicy";
import { supabase } from "../lib/supabase";

const logo = "/hlc-logo-final.png";
const declaredWorkspaceRoutes = new Set([
  "/dashboard", "/workflow", "/automations", "/hq", "/notifications",
  "/leads", "/estimator", "/jobs", "/calendar", "/follow-ups", "/operations",
  "/call-center", "/messages", "/manual-communications", "/customer-experience",
  "/documents", "/settings", "/team", "/homeowner-portal", "/contractor-portal", "/network",
  "/map", "/profiles", "/providers", "/matching", "/community-hub",
  "/community/discussions", "/community/reviews", "/community/referrals",
  "/community/events", "/community/moderation", "/help", "/tutorials", "/rules",
  "/profile", "/settings/billing",
]);

const companyTeamPage: EcosystemPage = {
  label: "Company Team",
  route: "/team",
  owner: "Kendrell",
  audiences: ["Business", "Owner", "Manager"],
  purpose: "Invite managers and technicians, review membership and revoke access.",
  status: "WORKING",
};

const agentRoutes = new Set(["/hq", "/operations", "/customer-experience"]);
const agentNavigation = [
  { label: "Kendrell", route: "/hq", purpose: "Command · approvals, risk and orchestration", avatar: "/brand/avatars/Kendrell_Locked_HLC.png" },
  { label: "Dion", route: "/operations", purpose: "Operations & BI · leads, jobs and scheduling", avatar: "/brand/avatars/Dion_Locked_HLC.png" },
  { label: "Diamond", route: "/customer-experience", purpose: "Customer Experience · community and recovery", avatar: "/brand/avatars/Diamond_Locked_HLC.png" },
];

type MobileIconName = "home" | "leads" | "jobs" | "messages" | "notifications" | "profile" | "more";

type MobileNavItem = {
  label: string;
  route: string;
  icon: MobileIconName;
};

function MobileNavIcon({ name }: { name: MobileIconName }) {
  if (name === "home") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.1a1.1 1.1 0 0 1-1.1 1.1h-5.3v-6.2H9.4V21H4.1A1.1 1.1 0 0 1 3 19.9Z" /></svg>;
  }
  if (name === "leads") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4.8 20c.8-4 3.2-6 7.2-6s6.4 2 7.2 6" /></svg>;
  }
  if (name === "jobs") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M3 12h18" /></svg>;
  }
  if (name === "messages") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4Z" /></svg>;
  }
  if (name === "notifications") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 10a5.2 5.2 0 0 1 10.4 0c0 5 2.2 5.1 2.2 7H4.6c0-1.9 2.2-2 2.2-7ZM9.7 20h4.6" /></svg>;
  }
  if (name === "profile") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M5 21c.6-4.5 3-6.7 7-6.7s6.4 2.2 7 6.7" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>;
}

function mobileRouteIsActive(pathname: string, route: string) {
  if (route === "/dashboard" || route === "/homeowner-portal" || route === "/contractor-portal") return pathname === route;
  return pathname === route || pathname.startsWith(`${route}/`);
}

export default function Navbar() {
  const { session, loading } = useAuth();
  const access = useAccountAccess();
  const [mobileOpenAt, setMobileOpenAt] = useState<string | null>(null);
  const [openGroupState, setOpenGroupState] = useState<{ pathname: string; id: string } | null>(null);
  const location = useLocation();
  const mobileOpen = mobileOpenAt === location.pathname;

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [mobileOpen]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const signedInGroups = useMemo(() => {
    const hasPageAccess = (page: EcosystemPage) => {
      if (page.route === "/homeowner-portal") return access.homeowner;
      if (page.route === "/contractor-portal") return access.contractor;
      if (page.route === "/messages") return access.business || access.homeowner || access.contractor;
      if (page.route === "/notifications") return access.business || access.homeowner || access.contractor;
      if (!access.business || !access.role) return false;
      return canAccessWorkspacePath(access.role, page.route);
    };

    return ecosystemNavigation
      .map((group) => {
        const candidatePages = group.id === "account" ? [...group.pages, companyTeamPage] : group.pages;
        return {
          ...group,
          pages: candidatePages.filter((page) => hasPageAccess(page) && declaredWorkspaceRoutes.has(page.route) && !agentRoutes.has(page.route)),
        };
      })
      .filter((group) => group.pages.length > 0);
  }, [access]);

  const currentGroup = agentRoutes.has(location.pathname)
    ? "ai-team"
    : signedInGroups.find((group) => group.pages.some((page) => page.route === location.pathname))?.id ?? "command";
  const openGroup = openGroupState?.pathname === location.pathname ? openGroupState.id : currentGroup;
  const signedIn = !loading && Boolean(session);
  const accessResolved = !session || (!access.loading && access.userId === session.user.id);
  const showBusinessTools = access.business && Boolean(access.role);
  const brandDestination = signedIn ? (access.business ? "/dashboard" : access.homeowner ? "/homeowner-portal" : access.contractor ? "/contractor-portal" : "/portal/accept") : "/login";

  const mobilePrimaryLinks = useMemo<MobileNavItem[]>(() => {
    if (!signedIn || !accessResolved) return [];
    if (showBusinessTools && access.role) {
      return [
        { label: "Home", route: "/dashboard", icon: "home" as const },
        { label: "Leads", route: "/leads", icon: "leads" as const },
        { label: "Jobs", route: "/jobs", icon: "jobs" as const },
        { label: "Messages", route: "/messages", icon: "messages" as const },
      ].filter((item) => canAccessWorkspacePath(access.role, item.route));
    }

    const portalHome = access.homeowner ? "/homeowner-portal" : access.contractor ? "/contractor-portal" : "/portal/accept";
    const portalLinks: MobileNavItem[] = [{ label: "Home", route: portalHome, icon: "home" }];
    if (access.homeowner || access.contractor) {
      portalLinks.push(
        { label: "Messages", route: "/messages", icon: "messages" },
        { label: "Alerts", route: "/notifications", icon: "notifications" },
        { label: "Profile", route: "/profile", icon: "profile" },
      );
    }
    return portalLinks;
  }, [access.contractor, access.homeowner, access.role, accessResolved, showBusinessTools, signedIn]);

  function closeMobileMenu() {
    setMobileOpenAt(null);
  }

  function toggleGroup(id: string) {
    setOpenGroupState({ pathname: location.pathname, id: openGroup === id ? "" : id });
  }

  function renderMenuContents() {
    if (loading) {
      return <p className="hlc-nav-access-note" role="status">Loading navigation…</p>;
    }

    if (!signedIn) {
      return (
        <>
          <div className="hlc-mobile-menu-heading"><span>HomeLead Connect</span><strong>How can we help?</strong></div>
          <a href="https://homeleadconnect.org">Public Home</a>
          <Link to="/request-service" onClick={closeMobileMenu}>Request Service</Link>
          <Link to="/contact" onClick={closeMobileMenu}>Contact</Link>
          <Link to="/login" onClick={closeMobileMenu}>Sign In</Link>
        </>
      );
    }

    return (
      <>
        <div className="hlc-mobile-menu-heading">
          <span>{showBusinessTools ? "HLC workspace" : access.homeowner ? "Resident portal" : access.contractor ? "Professional portal" : "HLC account"}</span>
          <strong>{showBusinessTools ? "Run HomeLead Connect." : "Your HomeLead Connect access."}</strong>
        </div>

        {showBusinessTools && <Link className="hlc-owner-home-link" to="/dashboard" onClick={closeMobileMenu}>
          <span><strong>Open Command Center</strong><small>Dashboard, live work and priorities</small></span>
          <b aria-hidden="true">→</b>
        </Link>}

        <div className="hlc-navbar-groups" aria-label="Signed-in HLC areas">
          {showBusinessTools && (
            <details className="hlc-nav-group hlc-nav-agent-group" open={openGroup === "ai-team"}>
              <summary onClick={(event) => { event.preventDefault(); toggleGroup("ai-team"); }}>
                <span>AI Team</span><small>{agentNavigation.filter((agent) => canAccessWorkspacePath(access.role, agent.route)).length}</small>
              </summary>
              <div className="hlc-nav-menu hlc-agent-nav-menu">
                {agentNavigation.filter((agent) => canAccessWorkspacePath(access.role, agent.route)).map((agent) => (
                  <Link className="hlc-agent-nav-link" aria-current={location.pathname === agent.route ? "page" : undefined} key={agent.route} onClick={closeMobileMenu} to={agent.route}>
                    <img src={agent.avatar} alt="" aria-hidden="true" />
                    <span className="hlc-agent-nav-copy"><strong>{agent.label}</strong><small>{agent.purpose}</small></span>
                  </Link>
                ))}
              </div>
            </details>
          )}

          {signedInGroups.map((group) => (
            <details className="hlc-nav-group" key={group.id} open={openGroup === group.id}>
              <summary onClick={(event) => { event.preventDefault(); toggleGroup(group.id); }}>
                <span>{group.label}</span><small>{group.pages.length}</small>
              </summary>
              <div className="hlc-nav-menu">
                {group.pages.map((page) => (
                  <Link aria-current={location.pathname === page.route ? "page" : undefined} key={page.route} onClick={closeMobileMenu} to={page.route}>
                    <span>{page.label}</span><small>{page.purpose}</small>
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </div>

        {!accessResolved && <p className="hlc-nav-access-note">Loading account access…</p>}
        {accessResolved && access.business && !access.role && <p className="hlc-nav-access-note">Internal role not assigned. Workspace control surfaces are hidden.</p>}
        <button className="hlc-nav-logout" type="button" onClick={logout}>Sign out</button>
      </>
    );
  }

  const mobileDrawer = mobileOpen && typeof document !== "undefined"
    ? createPortal(
        <div className="hlc-mobile-portal" role="dialog" aria-modal="true" aria-label="HomeLead Connect navigation">
          <div className="hlc-mobile-portal-scroll">{renderMenuContents()}</div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <nav className={`hlc-navbar ${mobileOpen ? "menu-is-open" : ""}`} role="navigation" aria-label="Main navigation">
        <Link className="hlc-navbar-brand" to={brandDestination} onClick={closeMobileMenu} aria-label="HomeLead Connect home">
          <div className="hlc-navbar-logo"><img src={logo} alt="HomeLead Connect LLC" /></div>
          <div className="hlc-navbar-brand-copy">
            <h2>HomeLead Connect</h2>
            <span>{signedIn ? (showBusinessTools ? "HLC workspace" : access.homeowner ? "Resident portal" : access.contractor ? "Professional portal" : "HLC account") : "Home services network"}</span>
          </div>
        </Link>

        <button
          type="button"
          className="hlc-navbar-toggle"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpenAt(mobileOpen ? null : location.pathname)}
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>

        <div className="hlc-navbar-links hlc-desktop-navigation">{renderMenuContents()}</div>
      </nav>

      {signedIn && accessResolved && mobilePrimaryLinks.length > 0 && (
        <nav className="hlc-mobile-tabbar" aria-label="Mobile primary navigation">
          {mobilePrimaryLinks.map((item) => {
            const active = mobileRouteIsActive(location.pathname, item.route);
            return (
              <Link
                key={item.route}
                to={item.route}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={closeMobileMenu}
              >
                <MobileNavIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            className={mobileOpen ? "is-active" : undefined}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close all HLC areas" : "Open all HLC areas"}
            onClick={() => setMobileOpenAt(mobileOpen ? null : location.pathname)}
          >
            <MobileNavIcon name="more" />
            <span>More</span>
          </button>
        </nav>
      )}
      {mobileDrawer}
    </>
  );
}
