import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const logo = "/hlc-logo-final.png";

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

  // Close mobile menu automatically after navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

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
            {access.business && (
              <>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/leads">Leads</Link>
                <Link to="/estimator">LeadScope</Link>
                <Link to="/jobs">Jobs</Link>
                <Link to="/calendar">Schedule</Link>
                <Link to="/follow-ups">Follow-ups</Link>
                <Link to="/manual-communications">Calls &amp; texts</Link>
                <Link to="/call-center">Call center</Link>
                <Link to="/documents">Documents</Link>
                <Link to="/hq">HQ</Link>
                <Link to="/operations">Operations</Link>
                <Link to="/customer-experience">Customer experience</Link>
                <Link to="/settings">Settings</Link>
              </>
            )}
            {access.homeowner && <Link to="/homeowner-portal">Homeowner portal</Link>}
            {access.contractor && <Link to="/contractor-portal">Contractor portal</Link>}
            {(access.business || access.homeowner || access.contractor) && <Link to="/messages">Messages</Link>}
            {(access.business || access.homeowner || access.contractor) && import.meta.env.VITE_NOTIFICATIONS_ENABLED === "true" && (
              <Link to="/notifications">Notifications</Link>
            )}
            <button type="button" onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          !loading && (
            <>
              <Link to="/">Home</Link>
              <Link to="/homeowners">Homeowners</Link>
              <Link to="/contractors">Contractors</Link>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/leadscope">LeadScope</Link>
              <Link to="/community">Community</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/request-service">Request Service</Link>
              <Link to="/login">CRM Login</Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}
