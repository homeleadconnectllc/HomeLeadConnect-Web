import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { ecosystemNavigation } from "../config/navigationPlacement";
import type { EcosystemPage } from "../config/ecosystem";
import { useAuth } from "../hooks/useAuth";
import { useAccountAccess } from "../hooks/useAccountAccess";
import { canAccessWorkspacePath } from "../lib/accessPolicy";
import { supabase } from "../lib/supabase";

const logo = "/hlc-logo-transparent.png";
const OPEN_HLC_COMMAND_SEARCH = "hlc:open-command-search";
const declaredWorkspaceRoutes = new Set([
  "/dashboard", "/ecosystem", "/workflow", "/automations", "/hq", "/notifications", "/analytics", "/analytics/forecasting", "/analytics/sandbox",
  "/work", "/work/matching", "/leads", "/estimator", "/jobs", "/calendar", "/follow-ups", "/operations",
  "/call-center", "/messages", "/manual-communications", "/customer-experience",
  "/documents", "/settings", "/team", "/homeowner-portal", "/contractor-portal", "/partner-portal", "/network",
  "/map", "/profiles", "/providers", "/matching", "/community-hub", "/community/swipe",
  "/community/discover", "/community/messages", "/community/challenges", "/community/academy", "/community/groups",
  "/community/discussions", "/community/reviews", "/community/referrals",
  "/community/events", "/community/moderation",
  "/academy", "/academy/roleplay", "/academy/library",
  "/resources", "/resources/materials", "/resources/suppliers", "/resources/forms",
  "/help", "/tutorials", "/rules", "/profile", "/settings/billing",
]);

const companyTeamPage: EcosystemPage = {
  label: "Company Team", route: "/team", owner: "Kendrell", audiences: ["Business", "Owner", "Manager"],
  purpose: "Invite managers and technicians, review membership and revoke access.", status: "WORKING",
};
const agentRoutes = new Set(["/hq", "/operations", "/customer-experience"]);
const agentNavigation = [
  { label: "Kendrell", route: "/hq", purpose: "Command · approvals, risk and orchestration", avatar: "/brand/avatars/Kendrell_Locked_HLC.png" },
  { label: "Dion", route: "/operations", purpose: "Operations & BI · leads, jobs and scheduling", avatar: "/brand/avatars/Dion_Locked_HLC.png" },
  { label: "Diamond", route: "/customer-experience", purpose: "Customer Experience · community and recovery", avatar: "/brand/avatars/Diamond_Locked_HLC.png" },
];

const legacyMobileRouteAliases = [
  { label: "Work", route: "/leads", canonicalRoute: "/work" },
  { label: "Network", route: "/network", canonicalRoute: "/community-hub" },
] as const;

type MobileIconName = "home" | "work" | "community" | "messages" | "notifications" | "profile" | "more";
type MobileNavItem = { label: string; route: string; icon: MobileIconName; matches?: string[] };
function MobileNavIcon({ name }: { name: MobileIconName }) {
  if (name === "home") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.8 12 3l9 7.8v9.1a1.1 1.1 0 0 1-1.1 1.1h-5.3v-6.2H9.4V21H4.1A1.1 1.1 0 0 1 3 19.9Z" /></svg>;
  if (name === "work") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V4h6v3M3 12h18" /></svg>;
  if (name === "community") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.8 20c.6-4.2 2.4-6.3 5.2-6.3 3 0 4.8 2.1 5.3 6.3M13.5 14.5c2.9-.7 6.5.8 7 5.5" /></svg>;
  if (name === "messages") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4Z" /></svg>;
  if (name === "notifications") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 10a5.2 5.2 0 0 1 10.4 0c0 5 2.2 5.1 2.2 7H4.6c0-1.9 2.2-2 2.2-7ZM9.7 20h4.6" /></svg>;
  if (name === "profile") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M5 21c.6-4.5 3-6.7 7-6.7s6.4 2.2 7 6.7" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>;
}
function pathMatchesPrefix(pathname: string, prefix: string) { return pathname === prefix || pathname.startsWith(`${prefix}/`); }
function mobileRouteIsActive(pathname: string, item: MobileNavItem) {
  if (item.matches?.some((prefix) => pathMatchesPrefix(pathname, prefix))) return true;
  if (legacyMobileRouteAliases.some((alias) => alias.canonicalRoute === item.route && pathMatchesPrefix(pathname, alias.route))) return true;
  if (item.route === "/dashboard" || item.route === "/homeowner-portal" || item.route === "/contractor-portal" || item.route === "/partner-portal") return pathname === item.route;
  return pathMatchesPrefix(pathname, item.route);
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

  useEffect(() => {
    if (!mobileOpen) return;
    const frame = window.requestAnimationFrame(() => {
      const scrollSurface = document.querySelector<HTMLElement>("body > .hlc-drawer-v2 > .hlc-drawer-v2-scroll");
      scrollSurface?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") closeMobileMenu(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  async function logout() { await supabase.auth.signOut(); window.location.href = "/login"; }
  const signedInGroups = useMemo(() => {
    const hasPageAccess = (page: EcosystemPage) => {
      if (page.route === "/homeowner-portal") return access.homeowner;
      if (page.route === "/contractor-portal") return access.contractor;
      if (page.route === "/partner-portal") return access.partner;
      if (page.route === "/messages" || page.route === "/notifications") return access.business || access.homeowner || access.contractor;
      if (!access.business || !access.role) return false;
      return canAccessWorkspacePath(access.role, page.route);
    };
    return ecosystemNavigation.map((group) => {
      const candidatePages = group.id === "account" ? [...group.pages, companyTeamPage] : group.pages;
      return { ...group, pages: candidatePages.filter((page) => hasPageAccess(page) && declaredWorkspaceRoutes.has(page.route) && !agentRoutes.has(page.route)) };
    }).filter((group) => group.pages.length > 0);
  }, [access]);

  const currentGroup = agentRoutes.has(location.pathname) ? "ai-team" : signedInGroups.find((group) => group.pages.some((page) => pathMatchesPrefix(location.pathname, page.route)))?.id ?? "command";
  const openGroup = openGroupState?.pathname === location.pathname ? openGroupState.id : currentGroup;
  const signedIn = !loading && Boolean(session);
  const accessResolved = !session || (!access.loading && access.userId === session.user.id);
  const showBusinessTools = access.business && Boolean(access.role);
  const brandDestination = signedIn ? (access.business ? "/dashboard" : access.homeowner ? "/homeowner-portal" : access.contractor ? "/contractor-portal" : access.partner ? "/partner-portal" : "/portal/accept") : "/login";
  const mobilePrimaryLinks = useMemo<MobileNavItem[]>(() => {
    if (!signedIn || !accessResolved) return [];
    if (showBusinessTools && access.role) return [
      { label: "Home", route: "/dashboard", icon: "home", matches: ["/dashboard", "/workflow", "/ecosystem", "/automations", "/notifications", "/hq", "/analytics"] },
      { label: "Work", route: "/work", icon: "work", matches: ["/work", "/leads", "/estimator", "/jobs", "/calendar", "/follow-ups", "/operations"] },
      { label: "Community", route: "/community-hub", icon: "community", matches: ["/community-hub", "/community", "/network", "/map", "/providers", "/profiles", "/matching"] },
      { label: "Messages", route: "/messages", icon: "messages", matches: ["/messages"] },
    ].filter((item) => canAccessWorkspacePath(access.role, item.route)) as MobileNavItem[];
    const portalHome = access.homeowner ? "/homeowner-portal" : access.contractor ? "/contractor-portal" : access.partner ? "/partner-portal" : "/portal/accept";
    const portalLinks: MobileNavItem[] = [{ label: "Home", route: portalHome, icon: "home" }];
    if (access.homeowner || access.contractor) portalLinks.push({ label: "Messages", route: "/messages", icon: "messages" }, { label: "Alerts", route: "/notifications", icon: "notifications" }, { label: "Profile", route: "/profile", icon: "profile" });
    return portalLinks;
  }, [access.contractor, access.homeowner, access.partner, access.role, accessResolved, showBusinessTools, signedIn]);

  const businessPrimaryAreaActive = showBusinessTools && mobilePrimaryLinks.some((item) => mobileRouteIsActive(location.pathname, item));
  const moreIsActive = mobileOpen || (showBusinessTools && !businessPrimaryAreaActive);
  function closeMobileMenu() { setMobileOpenAt(null); }
  function openGlobalSearch() { closeMobileMenu(); window.requestAnimationFrame(() => window.dispatchEvent(new Event(OPEN_HLC_COMMAND_SEARCH))); }
  function toggleGroup(id: string) { setOpenGroupState({ pathname: location.pathname, id: openGroup === id ? "" : id }); }

  function renderDesktopMenuContents() {
    if (loading) return <p className="hlc-nav-access-note" role="status">Loading navigation…</p>;
    if (!signedIn) return <><a href="https://homeleadconnect.org">Public Home</a><Link to="/request-service">Request Service</Link><Link to="/contact">Contact</Link><Link to="/login">Sign In</Link></>;
    return <>
      <div className="hlc-navbar-groups" aria-label="Signed-in HomeLead Connect areas">
        {showBusinessTools && access.role && <details className="hlc-nav-group hlc-nav-agent-group" open={openGroup === "ai-team"}><summary onClick={(event) => { event.preventDefault(); toggleGroup("ai-team"); }}><span>AI Team</span><small>{agentNavigation.filter((agent) => canAccessWorkspacePath(access.role, agent.route)).length}</small></summary><div className="hlc-nav-menu hlc-agent-nav-menu">{agentNavigation.filter((agent) => canAccessWorkspacePath(access.role, agent.route)).map((agent) => <Link className="hlc-agent-nav-link" aria-current={location.pathname === agent.route ? "page" : undefined} key={agent.route} to={agent.route}><img src={agent.avatar} alt="" aria-hidden="true" /><span className="hlc-agent-nav-copy"><strong>{agent.label}</strong><small>{agent.purpose}</small></span></Link>)}</div></details>}
        {signedInGroups.map((group) => <details className="hlc-nav-group" key={group.id} open={openGroup === group.id}><summary onClick={(event) => { event.preventDefault(); toggleGroup(group.id); }}><span>{group.label}</span><small>{group.pages.length}</small></summary><div className="hlc-nav-menu">{group.pages.map((page) => <Link aria-current={pathMatchesPrefix(location.pathname, page.route) ? "page" : undefined} key={page.route} to={page.route}><span>{page.label}</span><small>{page.purpose}</small></Link>)}</div></details>)}
      </div>
      {!accessResolved && <p className="hlc-nav-access-note">Loading account access…</p>}
      {accessResolved && access.business && !access.role && <p className="hlc-nav-access-note">Internal role not assigned. Workspace control surfaces are hidden.</p>}
      <button className="hlc-nav-logout" type="button" onClick={logout}>Sign out</button>
    </>;
  }

  function renderMobileMoreMenu() {
    if (loading || !accessResolved) return <p className="hlc-nav-access-note" role="status">Loading navigation…</p>;
    if (!signedIn) return <nav className="hlc-mobile-more-quick" aria-label="HomeLead Connect links"><a href="https://homeleadconnect.org"><MobileNavIcon name="home" /><span><strong>Public Home</strong><small>Visit HomeLead Connect</small></span><b aria-hidden="true">→</b></a><Link to="/request-service" onClick={closeMobileMenu}><MobileNavIcon name="work" /><span><strong>Request Service</strong><small>Start a home-service request</small></span><b aria-hidden="true">→</b></Link><Link to="/login" onClick={closeMobileMenu}><MobileNavIcon name="profile" /><span><strong>Sign In</strong><small>Open your account</small></span><b aria-hidden="true">→</b></Link></nav>;

    return <>
      <div className="hlc-mobile-more-title"><span>MORE</span><strong>{showBusinessTools ? "HomeLead Connect" : access.homeowner ? "Resident" : access.contractor ? "Professional" : access.partner ? "Partner" : "Account"}</strong></div>
      {!access.partner && <button className="hlc-mobile-command-search-trigger" type="button" onClick={openGlobalSearch}><span className="hlc-mobile-command-search-icon" aria-hidden="true">⌕</span><span><strong>Search HomeLead Connect</strong><small>Find work, people, tools and settings</small></span><b aria-hidden="true">→</b></button>}
      <nav className="hlc-mobile-more-quick" aria-label="More HomeLead Connect areas">
        {access.partner ? <Link to="/partner-portal/resources" onClick={closeMobileMenu}><MobileNavIcon name="more" /><span><strong>Partner resources</strong><small>Guidance and partner materials</small></span><b aria-hidden="true">→</b></Link> : <Link to="/start-here" onClick={closeMobileMenu}><MobileNavIcon name="more" /><span><strong>App Directory</strong><small>Everything available to your account</small></span><b aria-hidden="true">→</b></Link>}
        {!access.partner && <Link to="/notifications" onClick={closeMobileMenu}><MobileNavIcon name="notifications" /><span><strong>Notifications</strong><small>What needs attention</small></span><b aria-hidden="true">→</b></Link>}
        {!access.partner && <Link to="/profile" onClick={closeMobileMenu}><MobileNavIcon name="profile" /><span><strong>My profile</strong><small>Identity and preferences</small></span><b aria-hidden="true">→</b></Link>}
        {showBusinessTools && <Link to="/settings" onClick={closeMobileMenu}><MobileNavIcon name="more" /><span><strong>Settings</strong><small>Workspace and account controls</small></span><b aria-hidden="true">→</b></Link>}
      </nav>
      {accessResolved && access.business && !access.role && <p className="hlc-nav-access-note">Internal role not assigned. Workspace controls are hidden.</p>}
      <button className="hlc-mobile-more-signout" type="button" onClick={logout}>Sign out</button>
    </>;
  }

  const mobileDrawer = mobileOpen && typeof document !== "undefined" ? createPortal(
    <div className="hlc-drawer-v2 hlc-mobile-command-sheet" role="dialog" aria-modal="true" aria-label="More HomeLead Connect areas">
      <div className="hlc-drawer-v2-scroll">
        <div className="hlc-mobile-command-sheet-head"><span>HomeLead Connect</span><button className="hlc-drawer-v2-close" type="button" onClick={closeMobileMenu} aria-label="Close HomeLead Connect navigation">Close</button></div>
        {renderMobileMoreMenu()}
      </div>
    </div>,
    document.body,
  ) : null;

  return <>
    <nav className={`hlc-navbar ${mobileOpen ? "menu-is-open" : ""}`} role="navigation" aria-label="Main navigation">
      <Link className="hlc-navbar-brand" to={brandDestination} onClick={closeMobileMenu}><div className="hlc-navbar-logo"><img src={logo} alt="HomeLead Connect LLC" /></div><div className="hlc-navbar-brand-copy"><h2>HomeLead Connect</h2><span>{signedIn ? (showBusinessTools ? "HomeLead Connect workspace" : access.homeowner ? "Resident portal" : access.contractor ? "Professional portal" : access.partner ? "Partner portal" : "HomeLead Connect account") : "Home services network"}</span></div></Link>
      <button type="button" className="hlc-navbar-toggle" aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close menu" : "Open menu"} onClick={() => setMobileOpenAt(mobileOpen ? null : location.pathname)}>{mobileOpen ? "Close" : "Menu"}</button>
      <div className="hlc-navbar-links hlc-desktop-navigation">{renderDesktopMenuContents()}</div>
    </nav>
    {signedIn && accessResolved && mobilePrimaryLinks.length > 0 && <nav className="hlc-mobile-tabbar" aria-label="Mobile primary navigation">{mobilePrimaryLinks.map((item) => { const active = mobileRouteIsActive(location.pathname, item); return <Link key={item.route} to={item.route} className={active ? "is-active" : undefined} aria-current={active ? "page" : undefined} onClick={closeMobileMenu}><MobileNavIcon name={item.icon} /><span>{item.label}</span></Link>; })}<button type="button" className={moreIsActive ? "is-active" : undefined} aria-expanded={mobileOpen} aria-label={mobileOpen ? "Close all HomeLead Connect areas" : "Open all HomeLead Connect areas"} onClick={() => setMobileOpenAt(mobileOpen ? null : location.pathname)}><MobileNavIcon name="more" /><span>More</span></button></nav>}
    {mobileDrawer}
  </>;
}
