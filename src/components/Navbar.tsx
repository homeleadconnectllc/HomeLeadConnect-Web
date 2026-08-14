import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { ecosystemNavigation, type EcosystemPage } from "../config/ecosystem";
import { useAuth } from "../hooks/useAuth";
import { canAccessWorkspacePath, normalizeInternalRole, type InternalRole } from "../lib/accessPolicy";
import { supabase } from "../lib/supabase";

const logo = "/hlc-logo-final.png";
const declaredWorkspaceRoutes = new Set([
  "/dashboard", "/workflow", "/automations", "/hq", "/notifications",
  "/leads", "/estimator", "/jobs", "/calendar", "/follow-ups", "/operations",
  "/call-center", "/messages", "/manual-communications", "/customer-experience",
  "/documents", "/settings", "/homeowner-portal", "/contractor-portal", "/network",
  "/map", "/profiles", "/providers", "/matching", "/community-hub",
  "/community/discussions", "/community/reviews", "/community/referrals",
  "/community/events", "/community/moderation", "/help", "/tutorials", "/rules",
  "/profile", "/settings/billing",
]);

const agentRoutes = new Set(["/hq", "/operations", "/customer-experience"]);
const agentNavigation = [
  { label: "Kendrell", route: "/hq", purpose: "Command · approvals, risk and orchestration", avatar: "/brand/avatars/Kendrell_Locked_HLC.png" },
  { label: "Dion", route: "/operations", purpose: "Operations & BI · leads, jobs and scheduling", avatar: "/brand/avatars/Dion_Locked_HLC.png" },
  { label: "Diamond", route: "/customer-experience", purpose: "Customer Experience · community and recovery", avatar: "/brand/avatars/Diamond_Locked_HLC.png" },
];

type AccessState = {
  business: boolean;
  homeowner: boolean;
  contractor: boolean;
  role: InternalRole | null;
  userId: string | null;
};

export default function Navbar() {
  const { session, loading } = useAuth();
  const [access, setAccess] = useState<AccessState>({ business: false, homeowner: false, contractor: false, role: null, userId: null });
  const [mobileOpenAt, setMobileOpenAt] = useState<string | null>(null);
  const [openGroupState, setOpenGroupState] = useState<{ pathname: string; id: string } | null>(null);
  const location = useLocation();
  const mobileOpen = mobileOpenAt === location.pathname;

  useEffect(() => {
    if (!session) return;
    let active = true;
    const userId = session.user.id;
    Promise.all([
      supabase.from("workspace_members").select("workspace_id").eq("user_id", userId).limit(1),
      supabase.from("homeowner_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
      supabase.from("contractor_portal_links").select("id").eq("user_id", userId).is("revoked_at", null).limit(1),
      supabase.from("profiles").select("role").eq("user_id", userId).maybeSingle(),
    ]).then(([business, homeowner, contractor, profile]) => {
      if (!active) return;
      setAccess({
        business: !business.error && Boolean(business.data?.length),
        homeowner: !homeowner.error && Boolean(homeowner.data?.length),
        contractor: !contractor.error && Boolean(contractor.data?.length),
        role: profile.error ? null : normalizeInternalRole(profile.data?.role),
        userId,
      });
    }).catch(() => {
      if (active) setAccess({ business: false, homeowner: false, contractor: false, role: null, userId });
    });
    return () => { active = false; };
  }, [session]);

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
      .map((group) => ({
        ...group,
        pages: group.pages.filter((page) => hasPageAccess(page) && declaredWorkspaceRoutes.has(page.route) && !agentRoutes.has(page.route)),
      }))
      .filter((group) => group.pages.length > 0);
  }, [access]);

  const currentGroup = agentRoutes.has(location.pathname)
    ? "ai-team"
    : signedInGroups.find((group) => group.pages.some((page) => page.route === location.pathname))?.id ?? "command";
  const openGroup = openGroupState?.pathname === location.pathname ? openGroupState.id : currentGroup;
  const signedIn = !loading && Boolean(session);
  const accessResolved = !session || access.userId === session.user.id;
  const showBusinessTools = access.business && Boolean(access.role);
  const brandDestination = signedIn ? (access.business ? "/dashboard" : access.homeowner ? "/homeowner-portal" : access.contractor ? "/contractor-portal" : "/portal/accept") : "/login";

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
      {mobileDrawer}
    </>
  );
}
