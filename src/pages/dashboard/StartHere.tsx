import { Link } from "react-router-dom";

const card = { display: "grid", gap: 10, padding: 20, border: "1px solid #cbd5e1", borderRadius: 16, background: "#fff", lineHeight: 1.55 } as const;
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 14 } as const;
const row = { display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" } as const;

export default function StartHere() {
  return <main style={{ width: "min(1120px,calc(100% - 32px))", margin: "40px auto", display: "grid", gap: 20 }}>
    <header style={{ display: "grid", gap: 10, padding: "clamp(22px,5vw,40px)", borderRadius: 22, color: "#f8fafc", background: "linear-gradient(135deg,#081426,#12365f)" }}>
      <p style={{ margin: 0, color: "#60a5fa", fontWeight: 900, textTransform: "uppercase", letterSpacing: ".08em" }}>HomeLead Connect · company trial operations</p>
      <h1 style={{ margin: 0 }}>Start Here</h1>
      <p style={{ margin: 0 }}>Set up your company workspace, invite the right people, run one complete service workflow, and know exactly where to get help.</p>
    </header>

    <section style={card}>
      <h2 style={{ margin: 0 }}>First-day checklist</h2>
      <ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 8 }}>
        <li>Open <Link to="/settings">Settings</Link> and confirm your company profile and workspace details.</li>
        <li>Open <Link to="/team">Team</Link> and invite managers or technicians. Do not share one login between employees.</li>
        <li>Open <Link to="/call-center">Call Center</Link> and confirm the company phone workflow and operator process.</li>
        <li>Open <Link to="/workflow">Workflow</Link> and review the Request → Lead → LeadScope → Provider → Appointment → Job → Completion chain.</li>
        <li>Use <Link to="/request-service">Request Service</Link> for a controlled test request, then follow it through the workspace.</li>
        <li>Check <Link to="/notifications">Notifications</Link>, <Link to="/follow-ups">Follow-ups</Link>, and <Link to="/automations">Automations</Link> before using HLC with live customers.</li>
      </ol>
    </section>

    <section style={grid} aria-label="Role quick starts">
      <article style={card}><h2>Owner</h2><p>Owns company setup, billing, staff access, risk, security, and final operational decisions.</p><div style={row}><Link to="/dashboard">Dashboard</Link><Link to="/hq">Kendrell</Link><Link to="/settings">Settings</Link><Link to="/team">Team</Link></div></article>
      <article style={card}><h2>Manager</h2><p>Runs daily operations, workflow, staff coordination, automation, communications, and customer/provider follow-through.</p><div style={row}><Link to="/operations">Dion</Link><Link to="/workflow">Workflow</Link><Link to="/automations">Automations</Link><Link to="/call-center">Call Center</Link></div></article>
      <article style={card}><h2>Technician</h2><p>Works assigned operational records without receiving owner or management control-plane authority.</p><div style={row}><Link to="/jobs">Jobs</Link><Link to="/calendar">Calendar</Link><Link to="/documents">Documents</Link></div></article>
    </section>

    <section style={grid} aria-label="Trial operating expectations">
      <article style={card}><h2>Trial expectation</h2><p>Use real operating behavior, but start with a small controlled group. Confirm roles, customer consent, provider records, and one complete workflow before expanding volume.</p></article>
      <article style={card}><h2>Automation boundary</h2><p>HLC automation supports workflow monitoring and approved operational actions. It does not remove consent, authorization, provider, billing, or human-safety requirements.</p><Link to="/automations">Review automation controls →</Link></article>
      <article style={card}><h2>AI agents</h2><p>Kendrell, Dion, and Diamond are role-scoped assistants. Their guidance does not override workspace permissions, legal requirements, or explicit operational approvals built into HLC.</p><div style={row}><Link to="/hq">Kendrell</Link><Link to="/operations">Dion</Link><Link to="/customer-experience">Diamond</Link></div></article>
      <article style={card}><h2>Phone operations</h2><p>Use the Call Center for the canonical business-number workflow, call history, dispositions, and follow-up. Embedded browser calling only appears when a programmable carrier reports that capability.</p><Link to="/call-center">Open Call Center →</Link></article>
    </section>

    <section style={card}>
      <h2 style={{ margin: 0 }}>External launch gates</h2>
      <p style={{ margin: 0 }}>HLC can validate its software, database, permissions, automation, QA runtime, and provider-readiness automatically. Physical-device voice acceptance, the Supabase leaked-password-protection account toggle, and activation of a programmable WebRTC/SIP carrier for embedded live calling remain external controls.</p>
    </section>

    <section style={card}>
      <h2 style={{ margin: 0 }}>Safety, privacy, and compliance</h2>
      <p style={{ margin: 0 }}>Keep customer, provider, employee, document, and communication data inside the authorized workspace or portal. Do not bypass consent, suppression, role, sharing, or provider restrictions.</p>
      <div style={row}><Link to="/rules">Rules & safety</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/platform-disclosure">Platform disclosure</Link></div>
    </section>

    <section style={card}>
      <h2 style={{ margin: 0 }}>Support and escalation</h2>
      <p style={{ margin: 0 }}>For a blocked login, incorrect workspace access, customer-data concern, billing problem, or operational defect, stop the affected action and contact HomeLead Connect support at <a href="mailto:homeleadconnect@gmail.com">homeleadconnect@gmail.com</a> or <a href="tel:+17172881785">717-288-1785</a>. Include the page, time, and what you were trying to do; do not email passwords, authentication codes, or secret keys.</p>
      <div style={row}><Link to="/help">Help Center</Link><Link to="/tutorials">Tutorials</Link><Link to="/activity">Workspace activity</Link></div>
    </section>
  </main>;
}
