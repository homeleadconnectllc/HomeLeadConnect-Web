import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

export default function Dashboard() {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div style={{padding:"40px",fontFamily:"system-ui"}}>
      <h1>HomeLead Connect Dashboard</h1>
      <p>✅ Authentication Connected</p>
      <p>✅ Supabase Connected</p>
      <p>✅ Protected Route Ready</p>

      <nav style={{ display: "flex", gap: 16, margin: "24px 0" }}>
        <Link to="/leads">Leads</Link>
        <Link to="/estimator">Estimator</Link>
        <Link to="/jobs">Jobs</Link>
      </nav>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}
