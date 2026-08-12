import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ecosystemNavigation, type EcosystemOwner, type EcosystemPage } from "../config/ecosystem";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const logo = "/hlc-logo-final.png";
const declaredWorkspaceRoutes = new Set([
  "/dashboard",
  "/ecosystem",
  "/workflow",
  "/automations",
  "/hq",
  "/notifications",
  "/leads",
  "/estimator",
  "/jobs",
  "/calendar",
  "/follow-ups",
  "/operations",
  "/call-center",
  "/messages",
  "/manual-communications",
  "/customer-experience",
  "/documents",
  "/settings",
  "/homeowner-portal",
  "/contractor-portal",
  "/network",
  "/map",
  "/profiles",
  "/providers",
  "/matching",
  "/community-hub",
  "/community/discussions",
  "/community/reviews",
  "/community/referrals",
  "/community/events",
  "/community/moderation",
  "/help",
  "/tutorials",
  "/rules",
  "/profile",
  "/settings/billing",
]);

const ownerLabels: Record<EcosystemOwner, string> = {
  Kendrell: "Ken",
  Dion: "Dion",
  Diamond: "Diamond",
  Shared: "Shared",
};

export default function Navbar() {
  const { session, loading } = useAuth();
  const [access, setAccess] = useState({ business: false, homeowner: false, contractor: false });
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([
      supabase.from("workspace_members").select("workspace_id").eq("user_id", session.user.id).limit(1),
      supabase.from("homeowner_portal_links").select("id").eq("user_id", session.user.id).is("revoked_at", null).limit(1),
      supabase.from("contractor_portal_links").select("id").eq("user_id", session.user.id).is("revoked_at", null).limit(1),
    ]).then(([business, homeowner, contractor]) => {
      if (!active) return;
      setAccess({
        business: !business.error && Boolean(business.data?.length),
        homeowner: !homeowner.error && Boolean(homeowner.data?.length),
        contractor: !contractor.error && Boolean(contractor.data?.length),
      });
    });
    return () => { active = false; };
  }, [session]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function hasPageAccess(page: EcosystemPage) {
    if (page.route === "/homeowner-portal") return access.homeowner;
    if (page.route === "/contractor-portal") return access.contractor;
    if (page.route === "/messages") return access.business || access.homeowner || access.contractor;
    if (page.route === "/notifications") return import.meta.env.VITE_NOTIFICATIONS_ENABLED === "true" && (access.business || access.homeowner || access.contractor);
    return access.business;
  }

  const signedInGroups = ecosystemNavigation
    .map((group) => ({
      ...group,
      pages: group.pages.filter((page) => hasPageAccess(page)),
    }))
    .filter((group) => group.pages.length > 0);

  return (
    <nav className="hlc-navbar" role="navigation" aria-label="Main navigation">
      <div className="hlc-navbar-brand">
        <div className="hlc-navbar-logo">
          <img src={logo} alt="HomeLead Connect LLC" />
        </div>
        <h2>HomeLead Connect</h2>
      </div>

      <button
        type="button"
        className="hlc-navbar-toggle"
        aria-expanded={mobileOpen}
        aria-controls="hlc-primary-navigation"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? "Close" : "Menu"}
      </button>

      <div
        id="hlc-primary-navigation"
        className={`hlc-navbar-links ${mobileOpen ? "mobile-open" : "mobile-hidden"}`}
      >
        {!loading && session ? (
          <>
            <div className="hlc-navbar-groups" aria-label="Signed-in HLC areas">
              {signedInGroups.map((group) => (
                <details
                  className="hlc-nav-group"
                  key={group.id}
                  open={group.pages.some((page) => page.route === location.pathname)}
                >
                  <summary>{group.label}</summary>
                  <div className="hlc-nav-menu">
                    <p>{group.purpose}</p>
                    {group.pages.map((page) => {
                      const isDeclared = declaredWorkspaceRoutes.has(page.route);
                      return isDeclared ? (
                        <Link
                          aria-current={location.pathname === page.route ? "page" : undefined}
                          key={page.route}
                          onClick={() => setMobileOpen(false)}
                          to={page.route}
                        >
                          <span>{page.label}</span>
                          <small>{ownerLabels[page.owner]} · {page.status}</small>
                        </Link>
                      ) : (
                        <span
                          className="hlc-nav-reserved"
                          key={page.route}
                          title={`${page.route} is reserved in the ecosystem map but not built yet.`}
                        >
                          <span>{page.label}</span>
                          <small>{ownerLabels[page.owner]} · {page.status}</small>
                        </span>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
            <button type="button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          !loading && (
            <>
              <a href="https://homeleadconnect.org">Public Home</a>
              <Link to="/request-service" onClick={() => setMobileOpen(false)}>Request Service</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)}>Contact</Link>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}
