import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const logo = "/hlc-logo-final.png";

export default function Navbar() {
  const { session, loading } = useAuth();

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <nav
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        gap: "16px",
        background: "#111827",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <img
          src={logo}
          alt="HomeLead Connect LLC"
          style={{
            width: 50,
            height: 50,
            objectFit: "contain",
            flexShrink: 0,
          }}
        />

        <h2 style={{ margin: 0, whiteSpace: "nowrap" }}>HomeLead Connect</h2>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <Link to="/">Home</Link>
        <Link to="/contact">Contact</Link>
        {!loading && session ? <>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/leads">Leads</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/calendar">Schedule</Link>
          <Link to="/settings">Settings</Link>
          <button type="button" onClick={logout}>Log out</button>
        </> : !loading && <Link to="/login">CRM Login</Link>}
      </div>
    </nav>
  );
}
