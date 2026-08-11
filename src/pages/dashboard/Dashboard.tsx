import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{padding:"40px",fontFamily:"system-ui"}}>
      <h1>HomeLead Connect Dashboard</h1>
      <p>Open a workspace tool to continue.</p>

      <nav style={{ display: "flex", gap: 16, margin: "24px 0" }}>
        <Link to="/leads">Leads</Link>
        <Link to="/estimator">LeadScope</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/calendar">Schedule</Link>
        <Link to="/follow-ups">Follow-ups</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </div>
  );
}
